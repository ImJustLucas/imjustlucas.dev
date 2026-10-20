"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { CHIBI_SIZE, chibiFrames, type ChibiPose } from "@/lib/chibi";
import { cn } from "@/lib/utils";

import { useParisNight } from "./use-paris-night";

/** Each drawn frame stays this long: about 5 frames per second, stepped. */
const FRAME_MS = 200;

type ChibiSpriteProps = {
  pose: ChibiPose;
  alt: string;
  /** Box size and placement; the art is contained in it. */
  className?: string;
  /** `sizes` for the responsive image. */
  sizes: string;
  /** Plays the drawn frames while true (hover, a live state). */
  playing?: boolean;
  /** Wears the night outfit by Lucas's time in Paris, when the pose has one. */
  followParisNight?: boolean;
  priority?: boolean;
};

/**
 * A chibi pose. Its frames alternate in steps, never tweened, only while
 * `playing`, on screen and without reduced motion (first frame otherwise);
 * the chibi itself never hops or slides. Day and night art are stacked so
 * the switch after mount is a short crossfade with no layout shift.
 */
export function ChibiSprite({
  pose,
  alt,
  className,
  sizes,
  playing = false,
  followParisNight = false,
  priority = false,
}: ChibiSpriteProps) {
  const parisNight = useParisNight();
  const night = followParisNight && parisNight;
  const reducedMotion = useReducedMotion();
  const box = useRef<HTMLSpanElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tick, setTick] = useState(0);

  const day = chibiFrames(pose, false);
  const nightArt = chibiFrames(pose, true);
  const frames = night ? nightArt : day;
  const animated = playing && onScreen && !reducedMotion && frames.length > 1;

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animated) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), FRAME_MS);
    return () => window.clearInterval(timer);
  }, [animated]);
  // The first frame whenever it is not playing
  const frame = animated ? tick % frames.length : 0;

  const layers = [
    ...day.map((src, i) => ({ src, shown: !night && frame === i })),
    ...(nightArt !== day
      ? nightArt.map((src, i) => ({ src, shown: night && frame === i }))
      : []),
  ];

  return (
    <span ref={box} className={cn("relative block", className)}>
      {layers.map(({ src, shown }, i) => (
        <Image
          key={src}
          src={src}
          // Only the visible layer is announced
          alt={shown ? alt : ""}
          aria-hidden={shown ? undefined : true}
          width={CHIBI_SIZE}
          height={CHIBI_SIZE}
          sizes={sizes}
          priority={priority && i === 0}
          draggable={false}
          className={cn(
            "absolute inset-0 size-full object-contain",
            shown ? "opacity-100" : "opacity-0",
            // Day and night crossfade; drawn frames step instantly
            nightArt !== day &&
              "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          )}
        />
      ))}
    </span>
  );
}
