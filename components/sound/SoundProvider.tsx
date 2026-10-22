"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { SoundEngine } from "@/lib/sound/engine";
import type { Cue, CueOptions } from "@/lib/sound/kit";
import {
  readStoredSound,
  resolveSoundState,
  type SoundState,
  type StoredSound,
  writeStoredSound,
} from "@/lib/sound/preference";

type SoundContextValue = {
  state: SoundState;
  /** Plays a cue when sound is on; the hover tick only for fine pointers. */
  play: (cue: Cue, options?: CueOptions) => void;
  /** The sound switch: flips and stores the visitor's choice. */
  toggle: () => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const storage = () => window.localStorage;

/**
 * The visitor's choice: read once from storage, then kept in memory, so it
 * holds for the visit even when storage refuses to keep it.
 */
const choice = (() => {
  let value: StoredSound | null | undefined;
  const listeners = new Set<() => void>();
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    get: () =>
      value === undefined ? (value = readStoredSound(storage)) : value,
    set: (next: StoredSound) => {
      value = next;
      writeStoredSound(storage, next);
      listeners.forEach((listener) => listener());
    },
  };
})();

/**
 * The one sound engine of the client (mounted once in the Locale layout).
 * Sound is on by default, off by default under reduced motion, and follows
 * the visitor's stored choice once they press the switch.
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const engine = useRef<SoundEngine | null>(null);
  const stored = useSyncExternalStore(choice.subscribe, choice.get, () => null);
  const reducedMotion = useReducedMotion();
  const state = useMemo(
    () => resolveSoundState(stored, reducedMotion),
    [stored, reducedMotion],
  );

  useEffect(() => {
    engine.current = new SoundEngine();
    // Nothing sounds before the visitor's first press or key.
    const arm = () => engine.current?.arm();
    window.addEventListener("pointerdown", arm, { capture: true, once: true });
    window.addEventListener("keydown", arm, { capture: true, once: true });
    return () => {
      window.removeEventListener("pointerdown", arm, { capture: true });
      window.removeEventListener("keydown", arm, { capture: true });
    };
  }, []);

  const enabled = state.enabled;
  const play = useCallback(
    (cue: Cue, options?: CueOptions) => {
      if (!enabled) return;
      if (cue === "tick" && !window.matchMedia(FINE_POINTER).matches) return;
      engine.current?.play(cue, options);
    },
    [enabled],
  );

  const toggle = useCallback(() => {
    const next: StoredSound = enabled ? "off" : "on";
    choice.set(next);
    // Only switching on is audible.
    if (next === "on") {
      engine.current?.arm();
      engine.current?.play("toggleOn");
    }
  }, [enabled]);

  const value = useMemo(() => ({ state, play, toggle }), [state, play, toggle]);

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSounds() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return context;
}

const SILENT: SoundContextValue = {
  state: { enabled: false, reason: "chosen" },
  play: () => {},
  toggle: () => {},
};

/**
 * For screens that play no sound (the Admin) but show components of the
 * client that have their notes: every cue is silent.
 */
export function SilentSounds({ children }: { children: React.ReactNode }) {
  return (
    <SoundContext.Provider value={SILENT}>{children}</SoundContext.Provider>
  );
}
