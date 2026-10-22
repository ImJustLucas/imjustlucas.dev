"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * The XP bar: a pressed-in track holding the Level's progress, notched in
 * tenths. Rendered full; when it starts off screen it empties and fills
 * once as it comes into view (none under reduced motion).
 */
export function XpBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  /** What the bar measures, for assistive tech. */
  label: string;
}) {
  const reducedMotion = useReducedMotion();
  const bar = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"rest" | "empty" | "filling">("rest");
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  // A sliver always shows once there is any XP in the Level.
  const percent = value > 0 ? Math.max(3, ratio * 100) : 0;

  useEffect(() => {
    const element = bar.current;
    if (!element || reducedMotion) return;
    // Already on screen: no empty frame flashed at the visitor.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    setPhase("empty");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        // The empty bar was painted at mount, off screen: fill from it.
        setPhase("filling");
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="relative h-4 overflow-hidden rounded-full bg-ground shadow-[inset_0_2px_0_rgb(var(--ledge))]"
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full bg-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.18)]",
          phase === "filling" &&
            "transition-[clip-path] duration-[900ms] ease-out",
        )}
        style={{
          width: `${percent}%`,
          clipPath:
            phase === "empty"
              ? "inset(0 100% 0 0 round 999px)"
              : "inset(0 0 0 0 round 999px)",
        }}
      />
      {/* The notches: a 2px raised-colour cut every tenth */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, transparent 0 calc(10% - 2px), rgb(var(--raised) / 0.9) calc(10% - 2px) 10%)",
        }}
      />
    </div>
  );
}
