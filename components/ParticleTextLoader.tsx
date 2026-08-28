"use client";
import React, { useRef, useEffect } from "react";

export default function ParticleTextLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: any[] = [];
    let mouse = { x: -1000, y: -1000, radius: 120, smoothX: -1000, smoothY: -1000 };
    
    let gathering = false;
    let gatherStart = 0;
    const gatherDuration = 2000; // 2 seconds to assemble
    const scatter = 300;
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    class Particle {
      x: number;
      y: number;
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      size: number;
      color: string;
      seed: number;
      depth: number;
      delay: number;

      constructor(x: number, y: number, color: string, seed: number, isMobile: boolean) {
        this.targetX = x;
        this.targetY = y;
        this.color = color;
        this.seed = seed;
        this.depth = 0.45 + (Math.random() * 0.9);
        this.delay = seed * 500;
        
        const angle = seed * Math.PI * 2;
        const distance = scatter * (0.35 + this.depth * 0.75);
        
        this.startX = this.targetX + Math.cos(angle) * distance + (seed - 0.5) * scatter * 0.45;
        this.startY = this.targetY + Math.sin(angle) * distance + (this.depth - 0.9) * scatter * 0.45;
        
        this.x = this.startX;
        this.y = this.startY;
        
        // Smaller particles on mobile so text remains sharp
        const baseSize = isMobile ? (Math.random() * 1.5 + 0.8) : (Math.random() * 2.5 + 1);
        this.size = Math.max(0.5, baseSize);
      }
      
      draw(progress: number) {
        if (!ctx) return;
        ctx.globalAlpha = clamp(0.2 + progress * 0.8, 0, 1);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      update(now: number) {
        let baseX = this.targetX;
        let baseY = this.targetY;
        let progress = 1;

        if (gathering) {
          const local = (now - gatherStart - this.delay) / gatherDuration;
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX = this.startX + (this.targetX - this.startX) * eased;
          baseY = this.startY + (this.targetY - this.startY) * eased;
        }

        if (progress >= 1) {
          const driftTime = now * 0.001;
          baseX += Math.sin(driftTime * 0.9 + this.seed * 10) * 1.5 * this.depth;
          baseY += Math.cos(driftTime * 0.75 + this.depth * 10) * 1.5 * this.depth;
        }

        const dx = baseX - mouse.smoothX;
        const dy = baseY - mouse.smoothY;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < mouse.radius) {
          const force = Math.pow(1 - distance / mouse.radius, 2) * 40;
          baseX += (dx / distance) * force;
          baseY += (dy / distance) * force;
        }

        const follow = 0.22;
        this.x += (baseX - this.x) * follow;
        this.y += (baseY - this.y) * follow;
        
        return progress;
      }
    }

    const init = () => {
      particles = [];
      const isMobile = width < 768;
      
      ctx.fillStyle = "white";
      
      // Calculate font size so it NEVER exceeds 90% of screen width
      let fontSize = Math.max(Math.min(width / 8, 140), 20);
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      const fullText = "HTB X WiCyS";
      let totalWidth = ctx.measureText(fullText).width;
      
      if (totalWidth > width * 0.9) {
          fontSize = fontSize * ((width * 0.9) / totalWidth);
          ctx.font = `bold ${fontSize}px sans-serif`;
      }
      
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const textY = height / 2;
      
      const htbText = "HTB ";
      const xText = "X ";
      const wiText = "Wi";
      const cysText = "CyS";
      
      const w1 = ctx.measureText(htbText).width;
      const w2 = ctx.measureText(xText).width;
      const w3 = ctx.measureText(wiText).width;
      const w4 = ctx.measureText(cysText).width;
      
      totalWidth = w1 + w2 + w3 + w4;
      let currentX = width / 2 - totalWidth / 2;

      ctx.fillStyle = "#008000"; // Darker HTB green
      ctx.fillText(htbText, currentX, textY);
      currentX += w1;

      ctx.fillStyle = "#ffffff"; // X white
      ctx.fillText(xText, currentX, textY);
      currentX += w2;

      ctx.fillStyle = "#7030a0"; // Wi violet
      ctx.fillText(wiText, currentX, textY);
      currentX += w3;

      ctx.fillStyle = "#92d050"; // CyS green
      ctx.fillText(cysText, currentX, textY);

      const textCoordinates = ctx.getImageData(0, 0, width, height);
      ctx.clearRect(0, 0, width, height);

      // Higher resolution (lower step) on mobile so small text is legible
      const step = isMobile ? 3 : 5; 
      let particleCount = 0;
      
      for (let y = 0; y < textCoordinates.height; y += step) {
        for (let x = 0; x < textCoordinates.width; x += step) {
          const index = (y * textCoordinates.width + x) * 4;
          const alpha = textCoordinates.data[index + 3];
          if (alpha > 128) {
            const r = textCoordinates.data[index];
            const g = textCoordinates.data[index + 1];
            const b = textCoordinates.data[index + 2];
            const color = `rgba(${r},${g},${b},1)`;
            const seed = ((particleCount * 9301 + 49297) % 233280) / 233280;
            particles.push(new Particle(x, y, color, seed, isMobile));
            particleCount++;
          }
        }
      }
      
      gatherStart = performance.now();
      gathering = true;
    };

    setTimeout(init, 50);

    let animationFrameId: number;
    const animate = (now: number) => {
      // Clear entirely for crisp particles
      ctx.clearRect(0, 0, width, height);
      
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.18;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.18;

      let allComplete = true;
      for (let i = 0; i < particles.length; i++) {
        const progress = particles[i].update(now);
        particles[i].draw(progress);
        if (progress < 1) allComplete = false;
      }
      
      if (gathering && allComplete) {
        gathering = false;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchend", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchend", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden font-tech">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
      <div className="absolute bottom-12 animate-pulse text-sm tracking-widest pointer-events-none flex flex-col items-center gap-2">
        <span className="text-cyan-400/70 font-bold">BLACK CAT CTF</span>
      </div>
    </div>
  );
}
