/**
 * Antigravity — React Bits-style particle ring component.
 * Uses Three.js + @react-three/fiber.
 *
 * Props match the React Bits Antigravity API:
 *   count, magnetRadius, ringRadius, waveSpeed, waveAmplitude,
 *   particleSize, lerpSpeed, color, autoAnimate, particleVariance,
 *   rotationSpeed, depthFactor, pulseSpeed, fieldStrength
 *
 * Extra props added for this project:
 *   fadeDuration — ms after which the canvas fades to 0 opacity (one-shot mode)
 *   fadeDelay    — ms before the fade starts
 */
"use client";
import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  fieldStrength?: number;
  /** ms to wait before starting to fade out (0 = never fade) */
  fadeDelay?: number;
  /** ms over which to fade from full opacity to 0 */
  fadeDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Scene — must be rendered inside <Canvas>
// ---------------------------------------------------------------------------
interface SceneProps {
  count: number;
  ringRadius: number;
  waveSpeed: number;
  waveAmplitude: number;
  particleSize: number;
  lerpSpeed: number;
  color: string;
  particleVariance: number;
  rotationSpeed: number;
  depthFactor: number;
  pulseSpeed: number;
  fieldStrength: number;
  magnetRadius: number;
}

function AntigravityScene({
  count,
  ringRadius,
  waveSpeed,
  waveAmplitude,
  particleSize,
  lerpSpeed,
  color,
  particleVariance,
  rotationSpeed,
  depthFactor,
  pulseSpeed,
  fieldStrength,
  magnetRadius,
}: SceneProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const elapsed = useRef(0);

  // Mutable position buffer (updated every frame)
  const currentPos = useRef<Float32Array>(new Float32Array(count * 3));

  // Target ring positions (fixed after mount)
  const ringPos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr[i * 3]     = Math.cos(angle) * ringRadius;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = Math.sin(angle) * ringRadius;
    }
    return arr;
  }, [count, ringRadius]);

  // Randomised per-particle constants (seed data)
  const seeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = Math.random();
    return arr;
  }, [count]);

  // Size variation per particle
  const sizeVariance = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = 1.0 - particleVariance * 0.5 + Math.random() * particleVariance;
    }
    return arr;
  }, [count, particleVariance]);

  // Initialise geometry and scatter particles on mount
  const initGeometry = useCallback(() => {
    const pos = currentPos.current;
    for (let i = 0; i < count; i++) {
      // Scatter in a sphere around the origin
      const r = magnetRadius * (1.8 + seeds[i] * 2.5);
      const theta = seeds[i] * Math.PI * 2;
      const phi = (seeds[(count - 1 - i) % count] - 0.5) * Math.PI;
      pos[i * 3]     = r * Math.cos(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * depthFactor;
      pos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
    }
    // Push to GPU
    if (pointsRef.current?.geometry) {
      const attr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      if (attr) {
        (attr.array as Float32Array).set(pos);
        attr.needsUpdate = true;
      }
    }
  }, [count, magnetRadius, seeds, depthFactor]);

  useEffect(() => {
    initGeometry();
  }, [initGeometry]);

  useFrame((_, delta) => {
    if (!pointsRef.current?.geometry) return;

    elapsed.current += delta;
    const t = elapsed.current;

    const attr = pointsRef.current.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const gpuArr = attr.array as Float32Array;
    const pos = currentPos.current;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const seed = seeds[i];

      // Wave deformation on the ring target
      const wave =
        Math.sin(t * waveSpeed + angle * fieldStrength * 0.25 + seed * 2) *
        waveAmplitude *
        0.12 *
        ringRadius;
      const verticalWave =
        Math.cos(t * waveSpeed * 0.7 + angle * 2.5 + seed) *
        waveAmplitude *
        0.06 *
        ringRadius;
      const pulse =
        Math.sin(t * pulseSpeed * 0.4 + i * 0.07) * 0.03 * sizeVariance[i];

      const tx = ringPos[i * 3]     * (1 + pulse) + Math.cos(angle) * wave;
      const ty = (ringPos[i * 3 + 1] + verticalWave) * depthFactor;
      const tz = ringPos[i * 3 + 2] * (1 + pulse) + Math.sin(angle) * wave;

      // Lerp current → target
      pos[i * 3]     += (tx - pos[i * 3])     * lerpSpeed;
      pos[i * 3 + 1] += (ty - pos[i * 3 + 1]) * lerpSpeed;
      pos[i * 3 + 2] += (tz - pos[i * 3 + 2]) * lerpSpeed;

      gpuArr[i * 3]     = pos[i * 3];
      gpuArr[i * 3 + 1] = pos[i * 3 + 1];
      gpuArr[i * 3 + 2] = pos[i * 3 + 2];
    }

    attr.needsUpdate = true;

    // Optional Y-axis rotation
    if (rotationSpeed !== 0) {
      pointsRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  // Build initial position array for the declarative attribute
  const initPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    // All start at origin — initGeometry() scatters them after mount
    return arr;
  }, [count]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={particleSize * 0.11}
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
export default function Antigravity({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.5,
  lerpSpeed = 0.05,
  color = "#FF9FFC",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  fieldStrength = 10,
  fadeDelay = 0,
  fadeDuration = 0,
  className,
  style,
}: AntigravityProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // One-shot fade-out
  useEffect(() => {
    if (!fadeDelay || !fadeDuration || !wrapRef.current) return;
    const el = wrapRef.current;
    const startFade = setTimeout(() => {
      el.style.transition = `opacity ${fadeDuration}ms ease-out`;
      el.style.opacity = "0";
    }, fadeDelay);
    return () => clearTimeout(startFade);
  }, [fadeDelay, fadeDuration]);

  // Camera distance: pull back so full ring fits in FOV=50
  const camZ = ringRadius * 2.8;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <Canvas
        camera={{
          position: [0, ringRadius * 0.4, camZ],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <AntigravityScene
          count={count}
          ringRadius={ringRadius}
          magnetRadius={magnetRadius}
          waveSpeed={waveSpeed}
          waveAmplitude={waveAmplitude}
          particleSize={particleSize}
          lerpSpeed={lerpSpeed}
          color={color}
          particleVariance={particleVariance}
          rotationSpeed={rotationSpeed}
          depthFactor={depthFactor}
          pulseSpeed={pulseSpeed}
          fieldStrength={fieldStrength}
        />
      </Canvas>
    </div>
  );
}
