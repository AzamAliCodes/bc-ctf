"use client";
/**
 * DecryptedText — React Bits
 * TypeScript conversion of the original JSX component.
 * Source: https://reactbits.dev
 * Dependency: motion (motion/react)
 */
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion } from "motion/react";

// ─── Types ──────────────────────────────────────────────────────────────────
type AnimateOn = "view" | "hover" | "inViewHover" | "click";
type ClickMode = "once" | "toggle";
type RevealDirection = "start" | "end" | "center";

export interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: RevealDirection;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: AnimateOn;
  clickMode?: ClickMode;
  [key: string]: unknown;
}

// ─── Inline styles ──────────────────────────────────────────────────────────
const styles = {
  wrapper: { display: "inline-block", whiteSpace: "pre-wrap" } as React.CSSProperties,
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    border: 0,
  } as React.CSSProperties,
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set<number>());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "click");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");

  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((c) => c !== " ")
      : characters.split("");
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (originalText: string, currentRevealed: Set<number>) =>
      originalText
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (currentRevealed.has(i)) return originalText[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join(""),
    [availableChars]
  );

  const computeOrder = useCallback(
    (len: number): number[] => {
      if (len <= 0) return [];
      if (revealDirection === "start") return Array.from({ length: len }, (_, i) => i);
      if (revealDirection === "end") return Array.from({ length: len }, (_, i) => len - 1 - i);
      // center
      const order: number[] = [];
      const middle = Math.floor(len / 2);
      let offset = 0;
      while (order.length < len) {
        if (offset % 2 === 0) {
          const idx = middle + offset / 2;
          if (idx >= 0 && idx < len) order.push(idx);
        } else {
          const idx = middle - Math.ceil(offset / 2);
          if (idx >= 0 && idx < len) order.push(idx);
        }
        offset++;
      }
      return order.slice(0, len);
    },
    [revealDirection]
  );

  const fillAllIndices = useCallback(() => {
    const s = new Set<number>();
    for (let i = 0; i < text.length; i++) s.add(i);
    return s;
  }, [text]);

  const removeRandomIndices = useCallback((set: Set<number>, count: number) => {
    const arr = Array.from(set);
    for (let i = 0; i < count && arr.length > 0; i++) {
      arr.splice(Math.floor(Math.random() * arr.length), 1);
    }
    return new Set(arr);
  }, []);

  const encryptInstantly = useCallback(() => {
    const emptySet = new Set<number>();
    setRevealedIndices(emptySet);
    setDisplayText(shuffleText(text, emptySet));
    setIsDecrypted(false);
  }, [text, shuffleText]);

  const triggerDecrypt = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length);
      pointerRef.current = 0;
      setRevealedIndices(new Set());
    } else {
      setRevealedIndices(new Set());
    }
    setDirection("forward");
    setIsAnimating(true);
  }, [sequential, computeOrder, text.length]);

  const triggerReverse = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length).slice().reverse();
      pointerRef.current = 0;
      const all = fillAllIndices();
      setRevealedIndices(all);
      setDisplayText(shuffleText(text, all));
    } else {
      const all = fillAllIndices();
      setRevealedIndices(all);
      setDisplayText(shuffleText(text, all));
    }
    setDirection("reverse");
    setIsAnimating(true);
  }, [sequential, computeOrder, fillAllIndices, shuffleText, text]);

  // Core animation loop
  useEffect(() => {
    if (!isAnimating) return;
    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>) => {
      const len = text.length;
      if (revealDirection === "start") return revealedSet.size;
      if (revealDirection === "end") return len - 1 - revealedSet.size;
      // center
      const middle = Math.floor(len / 2);
      const offset = Math.floor(revealedSet.size / 2);
      const nextIdx = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
      if (nextIdx >= 0 && nextIdx < len && !revealedSet.has(nextIdx)) return nextIdx;
      for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i;
      return 0;
    };

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prev) => {
        if (sequential) {
          if (direction === "forward") {
            if (prev.size < text.length) {
              const next = getNextIndex(prev);
              const newSet = new Set(prev);
              newSet.add(next);
              setDisplayText(shuffleText(text, newSet));
              return newSet;
            }
            clearInterval(intervalRef.current!);
            setIsAnimating(false);
            setIsDecrypted(true);
            return prev;
          }
          // reverse sequential
          if (pointerRef.current < orderRef.current.length) {
            const idxToRemove = orderRef.current[pointerRef.current++];
            const newSet = new Set(prev);
            newSet.delete(idxToRemove);
            setDisplayText(shuffleText(text, newSet));
            if (newSet.size === 0) {
              clearInterval(intervalRef.current!);
              setIsAnimating(false);
              setIsDecrypted(false);
            }
            return newSet;
          }
          clearInterval(intervalRef.current!);
          setIsAnimating(false);
          setIsDecrypted(false);
          return prev;
        }

        // Non-sequential forward
        if (direction === "forward") {
          setDisplayText(shuffleText(text, prev));
          currentIteration++;
          if (currentIteration >= maxIterations) {
            clearInterval(intervalRef.current!);
            setIsAnimating(false);
            setDisplayText(text);
            setIsDecrypted(true);
          }
          return prev;
        }

        // Non-sequential reverse
        let cur = prev;
        if (cur.size === 0) cur = fillAllIndices();
        const removeCount = Math.max(1, Math.ceil(text.length / Math.max(1, maxIterations)));
        const nextSet = removeRandomIndices(cur, removeCount);
        setDisplayText(shuffleText(text, nextSet));
        currentIteration++;
        if (nextSet.size === 0 || currentIteration >= maxIterations) {
          clearInterval(intervalRef.current!);
          setIsAnimating(false);
          setIsDecrypted(false);
          setDisplayText(shuffleText(text, new Set()));
          return new Set();
        }
        return nextSet;
      });
    }, speed);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [
    isAnimating, text, speed, maxIterations, sequential, revealDirection,
    shuffleText, direction, fillAllIndices, removeRandomIndices,
  ]);

  // Click
  const handleClick = () => {
    if (animateOn !== "click") return;
    if (clickMode === "once") {
      if (isDecrypted) return;
      triggerDecrypt();
    } else {
      if (isDecrypted) triggerReverse();
      else triggerDecrypt();
    }
  };

  // Hover
  const triggerHoverDecrypt = useCallback(() => {
    if (isAnimating) return;
    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(text);
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, text]);

  const resetToPlainText = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsDecrypted(true);
    setDirection("forward");
  }, [text]);

  // View / InViewHover observer
  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            triggerDecrypt();
            setHasAnimated(true);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const cur = containerRef.current;
    if (cur) observer.observe(cur);
    return () => { if (cur) observer.unobserve(cur); };
  }, [animateOn, hasAnimated, triggerDecrypt]);

  // Initialise on animateOn change
  useEffect(() => {
    if (animateOn === "click") {
      encryptInstantly();
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection("forward");
  }, [animateOn, text, encryptInstantly]);

  const animateProps =
    animateOn === "hover" || animateOn === "inViewHover"
      ? { onMouseEnter: triggerHoverDecrypt, onMouseLeave: resetToPlainText }
      : animateOn === "click"
      ? { onClick: handleClick }
      : {};

  return (
    <motion.span
      ref={containerRef}
      className={parentClassName}
      style={styles.wrapper}
      {...animateProps}
      {...(props as Record<string, unknown>)}
    >
      <span style={styles.srOnly}>{displayText}</span>
      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const revealed = revealedIndices.has(index) || (!isAnimating && isDecrypted);
          return (
            <span key={index} className={revealed ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
