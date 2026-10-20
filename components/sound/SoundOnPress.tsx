"use client";

import type { Cue } from "@/lib/sound/kit";

import { useSounds } from "./SoundProvider";

type SoundOnPressProps = {
  children: React.ReactNode;
  /** The note played on press; `null` for none (hover tick only). */
  cue?: Cue | null;
  /** The quiet tick on hover (fine pointers only). */
  tick?: boolean;
};

/**
 * Gives controls rendered by a server component their note from the kit,
 * without making them client components: a layout-less wrapper
 * (`display: contents`) that hears the presses bubbling up from inside.
 */
export function SoundOnPress({
  children,
  cue = "press",
  tick = false,
}: SoundOnPressProps) {
  const { play } = useSounds();
  return (
    <span
      className="contents"
      onClick={cue ? () => play(cue) : undefined}
      onPointerEnter={tick ? () => play("tick") : undefined}
    >
      {children}
    </span>
  );
}
