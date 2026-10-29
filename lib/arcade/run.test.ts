import { describe, expect, it } from "vitest";

import { bestOf, parseBest, random } from "./run";

describe("the seeded generator", () => {
  it("draws numbers in [0, 1), the same for the same seed", () => {
    let seed = 42;
    const first: number[] = [];
    for (let i = 0; i < 100; i++) {
      const [value, next] = random(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      first.push(value);
      seed = next;
    }
    expect(random(42)[0]).toBe(first[0]);
  });
});

describe("the best score", () => {
  it("keeps the better of the stored best and the run", () => {
    expect(bestOf(null, 120)).toBe(120);
    expect(bestOf(300, 120)).toBe(300);
    expect(bestOf(100, 120)).toBe(120);
    // A time: the lower, and a table not cleared never beats one
    expect(bestOf(null, 4210, "lowest")).toBe(4210);
    expect(bestOf(3990, 4210, "lowest")).toBe(3990);
    expect(bestOf(5000, 4210, "lowest")).toBe(4210);
    expect(bestOf(5000, 0, "lowest")).toBe(5000);
    expect(bestOf(null, 0, "lowest")).toBeNull();
  });

  it("reads only a whole, non-negative stored score", () => {
    expect(parseBest(null)).toBeNull();
    expect(parseBest("250")).toBe(250);
    expect(parseBest("-3")).toBeNull();
    expect(parseBest("12.5")).toBeNull();
    expect(parseBest("lol")).toBeNull();
  });
});
