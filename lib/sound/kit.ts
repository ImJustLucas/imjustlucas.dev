/**
 * The sound kit (DESIGN.md, Motion and Sound): one instrument, a soft
 * plucked kalimba tine, in one key, D major pentatonic over two octaves.
 * Plain data, played by `engine.ts`. `press` is the note of secondary
 * controls (ledge buttons, social links) that have no cue of their own.
 */

/** The loudest the whole kit ever gets. */
export const MASTER_GAIN = 0.22;

/** The notes of the kit, D major pentatonic (D, E, F#, A, B). */
export const NOTES = {
  "F#3": 54,
  A3: 57,
  D4: 62,
  E4: 64,
  "F#4": 66,
  A4: 69,
  B4: 71,
  D5: 74,
  E5: 76,
  "F#5": 78,
  A5: 81,
  B5: 83,
} as const;

export type Note = keyof typeof NOTES;

/** Frequency in hertz of a kit note (equal temperament, A4 = 440 Hz). */
export const frequency = (note: Note) =>
  440 * 2 ** ((NOTES[note] - NOTES.A4) / 12);

/** One pluck of the tine. */
export type Pluck = {
  readonly note: Note;
  /** Seconds after the cue starts. */
  readonly at: number;
  /** Relative to the master gain, 0 to 1. */
  readonly gain: number;
  /** Seconds for the tine to ring out. */
  readonly decay: number;
  /** Semitones the pitch slides up over the first 80ms (the boop). */
  readonly bend?: number;
};

/** A cue: plucks, plus the recorded coin for the unlock. */
export type CueSound = {
  readonly plucks: ReadonlyArray<Pluck>;
  /** Seconds after the cue starts to play `/sounds/coin.mp3`. */
  readonly coinAt?: number;
};

export type Cue =
  | "tick"
  | "press"
  | "tab"
  | "confirm"
  | "toggleOn"
  | "toggleOff"
  | "unlock"
  | "boop"
  | "miss";

/**
 * Each menu tab plays its own degree, in menu order, so walking down the
 * menu plays a rising scale: me D4, what i've done E4, my experiences F#4,
 * yt videos A4, contact D5.
 */
export const TAB_NOTES: ReadonlyArray<Note> = ["D4", "E4", "F#4", "A4", "D5"];

const BOOP_NOTES: ReadonlyArray<Note> = ["D5", "E5", "F#5", "A5", "B5"];

const pluck = (note: Note, at = 0, gain = 0.7, decay = 0.9): Pluck => ({
  note,
  at,
  gain,
  decay,
});

export type CueOptions = {
  /** The tab's position in the menu, for `tab`. */
  readonly tab?: number;
  /** A number in [0, 1), picks the boop's degree. */
  readonly random?: number;
};

/** What a cue plays. */
export const cueSound = (cue: Cue, options: CueOptions = {}): CueSound => {
  switch (cue) {
    case "tick":
      return { plucks: [pluck("B5", 0, 0.16, 0.22)] };
    case "press":
      return { plucks: [pluck("A4", 0, 0.5, 0.6)] };
    case "tab": {
      const index = Math.max(0, options.tab ?? 0) % TAB_NOTES.length;
      return { plucks: [pluck(TAB_NOTES[index])] };
    }
    case "confirm":
      return {
        plucks: [pluck("D4", 0, 0.6), pluck("A4", 0, 0.5), pluck("D5", 0.09)],
      };
    case "toggleOn":
      return {
        plucks: [pluck("A4", 0, 0.55, 0.6), pluck("D5", 0.07, 0.6, 0.7)],
      };
    case "toggleOff":
      return {
        plucks: [pluck("D5", 0, 0.55, 0.6), pluck("A4", 0.07, 0.6, 0.7)],
      };
    case "unlock":
      return {
        plucks: [
          pluck("D4", 0, 0.6),
          pluck("F#4", 0.07, 0.6),
          pluck("A4", 0.14, 0.6),
          pluck("D5", 0.21, 0.7, 1.2),
        ],
        coinAt: 0.32,
      };
    case "boop": {
      const random = Math.min(Math.max(options.random ?? 0, 0), 0.999);
      const note = BOOP_NOTES[Math.floor(random * BOOP_NOTES.length)];
      return { plucks: [{ ...pluck(note, 0, 0.6, 0.5), bend: 2 }] };
    }
    case "miss":
      return {
        plucks: [pluck("A3", 0, 0.6, 0.6), pluck("F#3", 0.09, 0.6, 0.8)],
      };
  }
};
