import type { Track } from "./tracks";

/**
 * The radio's state (DESIGN.md, Radio): plain data and its transitions,
 * played by `engine.ts` through `components/radio`. The radio is off until
 * the visitor's first press (it never starts by itself), then plays its
 * tracks in order from a random first one, looping. Rain is a layer of the
 * radio: it sounds only while the radio plays, and pausing or muting the
 * site silences both.
 */

export type RadioStatus = "off" | "loading" | "playing" | "paused";

export type RadioState = {
  readonly status: RadioStatus;
  /** The current track's index in the list. */
  readonly track: number;
  /** 0 to 1, as the slider shows it. */
  readonly volume: number;
  readonly rain: boolean;
  /** 0 to 1, as the slider shows it. */
  readonly rainVolume: number;
};

export type RadioEvent =
  /** A press on play: loading until the audio actually plays. */
  | { readonly type: "play" }
  /** The audio is playing. */
  | { readonly type: "started" }
  | { readonly type: "pause" }
  | { readonly type: "next" }
  /** The track played to its end. */
  | { readonly type: "ended" }
  /** The track could not load or play. */
  | { readonly type: "failed" }
  /** The site's sound switch turned off. */
  | { readonly type: "mute" }
  | { readonly type: "volume"; readonly value: number }
  | { readonly type: "rain" }
  | { readonly type: "rainVolume"; readonly value: number }
  /** The visitor's stored preferences and the visit's first track, read after mount, while off. */
  | {
      readonly type: "restore";
      readonly prefs: RadioPrefs;
      readonly track: number;
    };

/** What the radio remembers per visitor; never whether it was playing. */
export type RadioPrefs = Pick<RadioState, "volume" | "rain" | "rainVolume">;

export const DEFAULT_PREFS: RadioPrefs = {
  volume: 0.6,
  rain: false,
  rainVolume: 0.5,
};

/** The loudest the music and the rain get, under the files' own level. */
export const MUSIC_MAX_GAIN = 0.7;
export const RAIN_MAX_GAIN = 0.6;

export const clampVolume = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/** The gain for a slider position: squared, so the slider feels even. */
export const gainOf = (volume: number, max: number): number =>
  clampVolume(volume) ** 2 * max;

/** The track after `index`, looping. */
export const nextTrack = (index: number, count: number): number =>
  count > 0 ? (index + 1) % count : 0;

/** A random first track for the visit, from a number in [0, 1). */
export const firstTrack = (count: number, random: number): number =>
  count > 0 ? Math.min(count - 1, Math.floor(Math.max(0, random) * count)) : 0;

export const initialRadio = (
  prefs: RadioPrefs,
  count: number,
  random: number,
): RadioState => ({
  status: "off",
  track: firstTrack(count, random),
  ...prefs,
});

/** Whether the radio is sounding (or about to). */
export const isOn = (state: RadioState): boolean =>
  state.status === "playing" || state.status === "loading";

/** Whether the rain layer sounds. */
export const rainSounds = (state: RadioState): boolean =>
  state.rain && isOn(state);

export const radioReducer = (
  count: number,
  state: RadioState,
  event: RadioEvent,
): RadioState => {
  switch (event.type) {
    case "play":
      return isOn(state) ? state : { ...state, status: "loading" };
    case "started":
      return state.status === "loading"
        ? { ...state, status: "playing" }
        : state;
    case "pause":
    case "mute":
    case "failed":
      return isOn(state) ? { ...state, status: "paused" } : state;
    case "next":
      // Paused or off, it only moves on; playing, it loads the next one
      return {
        ...state,
        track: nextTrack(state.track, count),
        status: isOn(state) ? "loading" : state.status,
      };
    case "ended":
      return isOn(state)
        ? { ...state, track: nextTrack(state.track, count), status: "loading" }
        : state;
    case "volume":
      return { ...state, volume: clampVolume(event.value) };
    case "rain":
      return { ...state, rain: !state.rain };
    case "rainVolume":
      return { ...state, rainVolume: clampVolume(event.value) };
    case "restore":
      return state.status === "off"
        ? { ...state, ...event.prefs, track: event.track }
        : state;
  }
};

/** Elapsed and total time as `m:ss / m:ss`, for the slot's Data line. */
export const formatTime = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/** What the operating system shows for the track (Media Session). */
export const mediaMetadata = (
  track: Track,
  album: string,
  artwork: string,
): {
  title: string;
  artist: string;
  album: string;
  artwork: { src: string; sizes: string; type: string }[];
} => ({
  title: track.title,
  artist: track.artist,
  album,
  artwork: [{ src: artwork, sizes: "1024x1024", type: "image/webp" }],
});

export const RADIO_STORAGE_KEY = "imjustlucas.radio";

/** Reads stored preferences, keeping the default for anything unknown. */
export const parseRadioPrefs = (value: string | null): RadioPrefs => {
  if (!value) return DEFAULT_PREFS;
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    return DEFAULT_PREFS;
  }
  if (typeof raw !== "object" || raw === null) return DEFAULT_PREFS;
  const { volume, rain, rainVolume } = raw as Record<string, unknown>;
  return {
    volume:
      typeof volume === "number" ? clampVolume(volume) : DEFAULT_PREFS.volume,
    rain: typeof rain === "boolean" ? rain : DEFAULT_PREFS.rain,
    rainVolume:
      typeof rainVolume === "number"
        ? clampVolume(rainVolume)
        : DEFAULT_PREFS.rainVolume,
  };
};

/** The minimal `Storage` the preferences need. */
type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

/** The stored preferences, the defaults when storage is unavailable. */
export const readRadioPrefs = (
  storage: () => PreferenceStorage,
): RadioPrefs => {
  try {
    return parseRadioPrefs(storage().getItem(RADIO_STORAGE_KEY));
  } catch {
    return DEFAULT_PREFS;
  }
};

/** Stores the preferences; the radio keeps working when storage refuses. */
export const writeRadioPrefs = (
  storage: () => PreferenceStorage,
  prefs: RadioPrefs,
): void => {
  try {
    storage().setItem(
      RADIO_STORAGE_KEY,
      JSON.stringify({
        volume: prefs.volume,
        rain: prefs.rain,
        rainVolume: prefs.rainVolume,
      }),
    );
  } catch {
    // The choice still holds for this visit.
  }
};
