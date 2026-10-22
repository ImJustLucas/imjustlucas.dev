"use client";

import { useSyncExternalStore } from "react";

import {
  countTrophyStepIn,
  EMPTY_PROGRESS,
  markAnnouncedIn,
  readStoredProgress,
  type TallyId,
  type TallyStep,
  TROPHY_STORAGE_KEY,
  type TrophyId,
  type TrophyProgress,
  unlockTrophyIn,
  writeStoredProgress,
} from "@/lib/trophies/trophies";

/**
 * The visitor's Trophies on the client (docs/trophies.md): read once from
 * storage, then kept in memory, so they hold for the visit even when storage
 * refuses them. Another tab's unlocks arrive through the `storage` event.
 * `TrophyLayer` announces each new unlock.
 */

const storage = () => window.localStorage;
const listeners = new Set<() => void>();
let progress: TrophyProgress | undefined;

const notify = () => listeners.forEach((listener) => listener());

const onStorage = (event: StorageEvent) => {
  if (event.key !== TROPHY_STORAGE_KEY) return;
  progress = undefined;
  notify();
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

const current = (): TrophyProgress =>
  (progress ??= readStoredProgress(storage));

const update = (change: (progress: TrophyProgress) => TrophyProgress) => {
  const before = current();
  const after = change(before);
  if (after === before) return;
  progress = after;
  writeStoredProgress(storage, after);
  notify();
};

/** Unlocks a Trophy (once): `unlockTrophy("coinRain")`. */
export const unlockTrophy = (id: TrophyId) =>
  update((progress) => unlockTrophyIn(progress, id, new Date()));

/** Counts one step of a Tally (once): `countTrophyStep("palettes", "plum")`. */
export const countTrophyStep = <T extends TallyId>(
  tally: T,
  step: TallyStep<T>,
) => update((progress) => countTrophyStepIn(progress, tally, step, new Date()));

/** Marks an unlocked Trophy's toast as shown. */
export const markTrophyAnnounced = (id: TrophyId) =>
  update((progress) => markAnnouncedIn(progress, id));

/** The visitor's progress; empty on the server and the first render. */
export const useTrophies = (): TrophyProgress =>
  useSyncExternalStore(subscribe, current, () => EMPTY_PROGRESS);
