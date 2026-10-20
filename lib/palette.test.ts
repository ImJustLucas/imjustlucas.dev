import { describe, expect, it } from "vitest";

import {
  DEFAULT_PALETTE,
  PALETTE_SCRIPT,
  PALETTE_STORAGE_KEY,
  PALETTE_SWATCH,
  paletteAttribute,
  PALETTES,
  parsePalette,
} from "./palette";

/** Runs the head script against a fake document and storage. */
const runScript = (getItem: (key: string) => string | null) => {
  const attributes = new Map<string, string>();
  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) =>
        attributes.set(name, value),
    },
  };
  new Function("localStorage", "document", PALETTE_SCRIPT)(
    { getItem },
    document,
  );
  return attributes.get("data-palette");
};

describe("the palette", () => {
  it("is electric by default", () => {
    expect(DEFAULT_PALETTE).toBe("electric");
    expect(parsePalette(null)).toBe("electric");
  });

  it("keeps a known choice and ignores anything else", () => {
    expect(parsePalette("plum")).toBe("plum");
    expect(parsePalette("neon")).toBe("electric");
  });

  it("sets an attribute only for a palette other than the default", () => {
    expect(paletteAttribute("electric")).toBeNull();
    expect(paletteAttribute("plum")).toBe("plum");
  });

  it("applies a stored plum before the first paint", () => {
    expect(
      runScript((key) => (key === PALETTE_STORAGE_KEY ? "plum" : null)),
    ).toBe("plum");
  });

  it("leaves the default alone and survives unavailable storage", () => {
    expect(runScript(() => null)).toBeUndefined();
    expect(runScript(() => "neon")).toBeUndefined();
    expect(
      runScript(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      }),
    ).toBeUndefined();
  });
});

describe("the palettes", () => {
  it("each have a swatch colour", () => {
    for (const palette of PALETTES) {
      expect(PALETTE_SWATCH[palette]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("can each be applied before the first paint", () => {
    for (const palette of PALETTES.filter((p) => p !== DEFAULT_PALETTE)) {
      expect(runScript(() => palette)).toBe(palette);
    }
  });
});
