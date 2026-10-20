import { describe, expect, it } from "vitest";

import techs from "@/content/techs.json";

import { contrastRatio, textColorOn } from "./text-color-on";

const AA = 4.5;

describe("contrastRatio", () => {
  it("measures the WCAG ratio, whatever the order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21);
    expect(contrastRatio("#3b82f6", "#3b82f6")).toBe(1);
  });
});

describe("textColorOn", () => {
  it("writes black on light and mid-tone colours", () => {
    expect(textColorOn("#ffffff")).toBe("#000000");
    expect(textColorOn("#facc15")).toBe("#000000");
    expect(textColorOn("#38bdf8")).toBe("#000000");
    expect(textColorOn("#3b82f6")).toBe("#000000");
    expect(textColorOn("#EF4444")).toBe("#000000");
  });

  it("writes white on dark colours", () => {
    expect(textColorOn("#000000")).toBe("#ffffff");
    expect(textColorOn("#1e3a8a")).toBe("#ffffff");
    expect(textColorOn("#7c3aed")).toBe("#ffffff");
  });

  it("reaches AA contrast on every grey", () => {
    for (let v = 0; v < 256; v++) {
      const grey = `#${v.toString(16).padStart(2, "0").repeat(3)}`;
      expect(contrastRatio(grey, textColorOn(grey))).toBeGreaterThanOrEqual(AA);
    }
  });

  it.each(techs)("reaches AA contrast on the $name badge", ({ color }) => {
    expect(contrastRatio(color, textColorOn(color))).toBeGreaterThanOrEqual(AA);
  });
});
