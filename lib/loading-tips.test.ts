import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

import {
  LOADING_TIPS,
  pickTip,
  type TipFeature,
  tipWeight,
  triedFeatures,
} from "./loading-tips";

const none = new Set<TipFeature>();

/** A `random` that returns the given rolls in turn. */
const rolls =
  (...values: number[]) =>
  () =>
    values.shift() ?? 0;

describe("loading tips", () => {
  it.each([
    ["en", en],
    ["fr", fr],
  ])("each have a short line in %s", (_, dictionary) => {
    const texts = dictionary.LoadingTips.tips as Record<string, string>;
    expect(Object.keys(texts).sort()).toEqual(
      LOADING_TIPS.map((tip) => tip.id).sort(),
    );
    // Two lines at most under a spinner on a phone
    for (const text of Object.values(texts)) {
      expect([...text].length).toBeLessThanOrEqual(90);
    }
  });

  it("weigh a feature not tried yet over one already used", () => {
    const palettes = { id: "palettes", feature: "palette" } as const;
    expect(tipWeight(palettes, none)).toBe(2);
    expect(tipWeight(palettes, new Set(["palette"]))).toBe(0.5);
    expect(tipWeight({ id: "coffee" }, new Set(["palette"]))).toBe(1);
  });
});

describe("picking a tip", () => {
  const tips = [
    { id: "a" },
    { id: "b", feature: "palette" },
    { id: "c", hiddenDuring: ["mdf-2025"] },
  ] as const;

  it("draws by weight", () => {
    // Weights 1, 2 and 1: a roll of 0.2 lands on a, 0.5 on b, 0.9 on c
    const pick = (roll: number) =>
      pickTip({
        wait: "arcade",
        last: null,
        tried: none,
        random: () => roll,
        tips,
      });
    expect([pick(0.2), pick(0.5), pick(0.9)]).toEqual(["a", "b", "c"]);
  });

  it("never shows the same tip twice in a row", () => {
    let last: string | null = null;
    for (const roll of [0, 0, 0.99, 0.99, 0.5, 0.5]) {
      const next = pickTip({
        wait: "arcade",
        last,
        tried: none,
        random: () => roll,
        tips,
      });
      expect(next).not.toBe(last);
      last = next;
    }
  });

  it("keeps a tip out of the wait it would only repeat", () => {
    const random = rolls(0.99, 0.99, 0.99);
    for (let draw = 0; draw < 3; draw++) {
      expect(
        pickTip({ wait: "mdf-2025", last: null, tried: none, random, tips }),
      ).not.toBe("c");
    }
  });

  it("shows the one tip left even if it was the last", () => {
    expect(
      pickTip({
        wait: "arcade",
        last: "a",
        tried: none,
        random: () => 0.5,
        tips: [{ id: "a" }],
      }),
    ).toBe("a");
  });

  it("reaches every tip of the list", () => {
    const seen = new Set<string>();
    for (let step = 0; step < 200; step++) {
      seen.add(
        pickTip({
          wait: "arcade",
          last: null,
          tried: none,
          random: () => step / 200,
        }),
      );
    }
    expect(seen.size).toBe(LOADING_TIPS.length);
  });
});

describe("tried features", () => {
  it("come from the keys the features write", () => {
    const stored = new Map([
      ["imjustlucas.palette", "plum"],
      ["imjustlucas:arcade:surf:best", "12"],
    ]);
    expect(triedFeatures((key) => stored.get(key) ?? null)).toEqual(
      new Set(["palette", "arcade"]),
    );
  });

  it("are none on a first visit", () => {
    expect(triedFeatures(() => null).size).toBe(0);
  });
});
