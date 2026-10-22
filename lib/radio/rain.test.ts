import { describe, expect, it } from "vitest";

import { rainSamples, seededRandom } from "./rain";

const RATE = 8000;

describe("seededRandom", () => {
  it("repeats for a seed and stays in [0, 1)", () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const n = a();
      expect(n).toBe(b());
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe("rainSamples", () => {
  const samples = rainSamples(RATE, seededRandom(1), 2);

  it("lasts the asked length", () => {
    expect(samples.length).toBe(2 * RATE);
  });

  it("is audible and never clips", () => {
    let peak = 0;
    let energy = 0;
    for (const s of samples) {
      peak = Math.max(peak, Math.abs(s));
      energy += s * s;
    }
    expect(peak).toBeLessThanOrEqual(0.95);
    expect(Math.sqrt(energy / samples.length)).toBeGreaterThan(0.01);
  });

  it("loops without a jump at the seam", () => {
    // The step from the last sample back to the first is an ordinary one
    let steps = 0;
    for (let i = 1; i < samples.length; i++) {
      steps += Math.abs(samples[i] - samples[i - 1]);
    }
    const typical = steps / (samples.length - 1);
    const seam = Math.abs(samples[0] - samples[samples.length - 1]);
    expect(seam).toBeLessThan(typical * 8);
  });
});
