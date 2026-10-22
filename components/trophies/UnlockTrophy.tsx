"use client";

import { useEffect } from "react";

import type { TrophyId } from "@/lib/trophies/trophies";

import { unlockTrophy } from "./trophy-store";

/**
 * Unlocks a Trophy when it is shown, for a server component that has no
 * event of its own: `<UnlockTrophy id="lost" />`. Renders nothing.
 */
export function UnlockTrophy({ id }: { id: TrophyId }) {
  useEffect(() => unlockTrophy(id), [id]);
  return null;
}
