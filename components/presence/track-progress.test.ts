import { describe, expect, it } from "vitest";

import { trackProgress } from "./track-progress";

describe("trackProgress", () => {
  it("is the share of the track played", () => {
    expect(trackProgress(1500, 1000, 3000)).toBe(0.25);
  });

  it("holds at the ends before the start and after the end", () => {
    expect(trackProgress(500, 1000, 3000)).toBe(0);
    expect(trackProgress(9000, 1000, 3000)).toBe(1);
  });

  it("is empty for a track with no length", () => {
    expect(trackProgress(2000, 1000, 1000)).toBe(0);
  });
});
