import { describe, expect, it } from "vitest";

import {
  type Cue,
  cueSound,
  frequency,
  MASTER_GAIN,
  NOTES,
  TAB_NOTES,
} from "./kit";

const CUES: ReadonlyArray<Cue> = [
  "tick",
  "press",
  "tab",
  "confirm",
  "toggleOn",
  "toggleOff",
  "unlock",
  "boop",
  "miss",
  "throw",
  "clink",
];

const pitchClass = (midi: number) => midi % 12;
// D, E, F#, A, B
const D_MAJOR_PENTATONIC = new Set([2, 4, 6, 9, 11]);

describe("the sound kit", () => {
  it("never gets louder than a master gain of 0.25", () => {
    expect(MASTER_GAIN).toBeLessThanOrEqual(0.25);
    for (const cue of CUES) {
      const sound = cueSound(cue, { random: 0.99 });
      for (const { gain } of [...sound.plucks, ...(sound.samples ?? [])]) {
        expect(gain).toBeGreaterThan(0);
        expect(gain).toBeLessThanOrEqual(1);
      }
    }
  });

  it("stays in D major pentatonic", () => {
    for (const midi of Object.values(NOTES)) {
      expect(D_MAJOR_PENTATONIC.has(pitchClass(midi))).toBe(true);
    }
  });

  it("tunes A4 to 440 Hz and D4 to about 293.66 Hz", () => {
    expect(frequency("A4")).toBe(440);
    expect(frequency("D4")).toBeCloseTo(293.66, 1);
  });

  it("plays a rising scale down the menu, one degree per tab", () => {
    const notes = TAB_NOTES.map(
      (_, tab) => cueSound("tab", { tab }).plucks[0].note,
    );
    expect(notes).toEqual(["D4", "E4", "F#4", "A4", "D5"]);
    const pitches = notes.map((note) => NOTES[note]);
    expect([...pitches].sort((a, b) => a - b)).toEqual(pitches);
  });

  it("plays the toggle up when switching on and down when switching off", () => {
    expect(cueSound("toggleOn").plucks.map((p) => p.note)).toEqual([
      "A4",
      "D5",
    ]);
    expect(cueSound("toggleOff").plucks.map((p) => p.note)).toEqual([
      "D5",
      "A4",
    ]);
  });

  it("ends the unlock arpeggio with the coin", () => {
    const unlock = cueSound("unlock");
    expect(unlock.plucks.map((p) => p.note)).toEqual(["D4", "F#4", "A4", "D5"]);
    const lastPluck = Math.max(...unlock.plucks.map((p) => p.at));
    expect(unlock.samples).toHaveLength(1);
    expect(unlock.samples?.[0].sample).toBe("coin");
    expect(unlock.samples?.[0].at).toBeGreaterThan(lastPluck);
  });

  it("throws a coin with the coin and lands it with the impact", () => {
    expect(cueSound("throw").samples?.map((s) => s.sample)).toEqual(["coin"]);
    expect(cueSound("clink").samples?.map((s) => s.sample)).toEqual(["impact"]);
  });

  it("bends the boop upwards on a degree picked by the random number", () => {
    const low = cueSound("boop", { random: 0 }).plucks[0];
    const high = cueSound("boop", { random: 0.999 }).plucks[0];
    expect(low.bend).toBeGreaterThan(0);
    expect(NOTES[high.note]).toBeGreaterThan(NOTES[low.note]);
  });
});
