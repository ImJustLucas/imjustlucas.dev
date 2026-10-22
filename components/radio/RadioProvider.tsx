"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { useSounds } from "@/components/sound/SoundProvider";
import { chibiFrames } from "@/lib/chibi";
import { RadioEngine } from "@/lib/radio/engine";
import {
  DEFAULT_PREFS,
  firstTrack,
  initialRadio,
  isOn,
  mediaMetadata,
  type RadioEvent,
  radioReducer,
  type RadioState,
  rainSounds,
  readRadioPrefs,
  writeRadioPrefs,
} from "@/lib/radio/radio";
import { type Track, TRACKS } from "@/lib/radio/tracks";

type Progress = { at: number; duration: number };

type RadioContextValue = {
  state: RadioState;
  track: Track;
  /** Play when off or paused, pause when on. */
  toggle: () => void;
  next: () => void;
  setVolume: (value: number) => void;
  toggleRain: () => void;
  setRainVolume: (value: number) => void;
  /** The track's progress, for `useSyncExternalStore`. */
  subscribeProgress: (listener: () => void) => () => void;
  progress: () => Progress;
};

const RadioContext = createContext<RadioContextValue | undefined>(undefined);

const storage = () => window.localStorage;
const NO_PROGRESS: Progress = { at: 0, duration: 0 };

/**
 * The radio of the client (DESIGN.md, Radio), mounted once in the Locale
 * layout so it keeps playing across pages. It never starts by itself: the
 * engine and the first track load on the visitor's first press of play.
 * It follows the site's sound switch: muting pauses it, and pressing play
 * while muted turns sound back on.
 */
export function RadioProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Radio");
  const { state: sound, toggle: toggleSound, play: cue } = useSounds();
  const [state, setState] = useState(() =>
    initialRadio(DEFAULT_PREFS, TRACKS.length, 0),
  );
  const current = useRef(state);
  const engine = useRef<RadioEngine | null>(null);
  const progressCache = useRef<Progress>(NO_PROGRESS);
  const progressListeners = useRef(new Set<() => void>());

  /**
   * Moves the radio to its next state and drives the engine from the change,
   * synchronously, so a press reaches the audio inside its own gesture.
   */
  const apply = useCallback((event: RadioEvent) => {
    const before = current.current;
    const after = radioReducer(TRACKS.length, before, event);
    if (after === before) return;
    current.current = after;
    setState(after);

    const audio = engine.current;
    if (audio) {
      if (after.volume !== before.volume) {
        audio.setVolume(after.volume, isOn(after));
      }
      const loads =
        after.status === "loading" &&
        (before.status !== "loading" || after.track !== before.track);
      if (loads) audio.play(TRACKS[after.track].src);
      if (isOn(before) && !isOn(after)) audio.pause();
      if (
        rainSounds(after) !== rainSounds(before) ||
        (rainSounds(after) && after.rainVolume !== before.rainVolume)
      ) {
        audio.setRain(rainSounds(after), after.rainVolume);
      }
    }

    if (
      after.volume !== before.volume ||
      after.rain !== before.rain ||
      after.rainVolume !== before.rainVolume
    ) {
      writeRadioPrefs(storage, after);
    }
  }, []);

  // The visitor's stored mix and a random first track, after mount
  useEffect(() => {
    apply({
      type: "restore",
      prefs: readRadioPrefs(storage),
      track: firstTrack(TRACKS.length, Math.random()),
    });
  }, [apply]);

  // The site's sound switch turning off silences the radio
  useEffect(() => {
    if (!sound.enabled) apply({ type: "mute" });
  }, [sound.enabled, apply]);

  useEffect(() => () => engine.current?.dispose(), []);

  const play = useCallback(() => {
    if (!sound.enabled) toggleSound();
    else cue("toggleOn");
    // The first press creates the engine, inside the gesture
    if (!engine.current) {
      const created = new RadioEngine({
        onStarted: () => apply({ type: "started" }),
        onEnded: () => apply({ type: "ended" }),
        onFailed: () => apply({ type: "failed" }),
      });
      created.setVolume(current.current.volume, false);
      created.subscribe(() => {
        progressCache.current = created.progress();
        progressListeners.current.forEach((listener) => listener());
      });
      engine.current = created;
    }
    apply({ type: "play" });
  }, [sound.enabled, toggleSound, cue, apply]);

  const toggle = useCallback(() => {
    if (isOn(current.current)) {
      cue("toggleOff");
      apply({ type: "pause" });
    } else {
      play();
    }
  }, [apply, cue, play]);

  const next = useCallback(() => {
    cue("press");
    apply({ type: "next" });
  }, [apply, cue]);

  const toggleRain = useCallback(() => {
    cue(current.current.rain ? "toggleOff" : "toggleOn");
    apply({ type: "rain" });
  }, [apply, cue]);

  const setVolume = useCallback(
    (value: number) => apply({ type: "volume", value }),
    [apply],
  );
  const setRainVolume = useCallback(
    (value: number) => apply({ type: "rainVolume", value }),
    [apply],
  );

  // The operating system's media controls, once the radio has started
  const handlers = useRef({ toggle, next, play });
  useEffect(() => {
    handlers.current = { toggle, next, play };
  });
  const album = t("album");
  useEffect(() => {
    if (state.status === "off" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata(
      mediaMetadata(TRACKS[state.track], album, chibiFrames("music", false)[0]),
    );
    session.playbackState = isOn(state) ? "playing" : "paused";
  }, [state, album]);

  const started = state.status !== "off";
  useEffect(() => {
    if (!started || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const actions: [MediaSessionAction, () => void][] = [
      ["play", () => !isOn(current.current) && handlers.current.play()],
      ["pause", () => isOn(current.current) && handlers.current.toggle()],
      ["nexttrack", () => handlers.current.next()],
    ];
    for (const [action, handler] of actions) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // An action this browser does not know
      }
    }
    return () => {
      for (const [action] of actions) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Same
        }
      }
    };
  }, [started]);

  const subscribeProgress = useCallback((listener: () => void) => {
    progressListeners.current.add(listener);
    return () => void progressListeners.current.delete(listener);
  }, []);
  const progress = useCallback(() => progressCache.current, []);

  const value = useMemo(
    () => ({
      state,
      track: TRACKS[state.track],
      toggle,
      next,
      setVolume,
      toggleRain,
      setRainVolume,
      subscribeProgress,
      progress,
    }),
    [
      state,
      toggle,
      next,
      setVolume,
      toggleRain,
      setRainVolume,
      subscribeProgress,
      progress,
    ],
  );

  return (
    <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error("useRadio must be used within a RadioProvider");
  }
  return context;
}
