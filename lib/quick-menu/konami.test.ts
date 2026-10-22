import { describe, expect, it } from "vitest";

import { KONAMI, konamiStep } from "./konami";

describe("konamiStep", () => {
  const type = (keys: ReadonlyArray<string>) =>
    keys.reduce((progress, key) => konamiStep(progress, key), 0);

  it("completes on the whole code, letters in either case", () => {
    expect(type(KONAMI)).toBe(KONAMI.length);
    expect(type([...KONAMI.slice(0, 8), "B", "A"])).toBe(KONAMI.length);
  });

  it("starts over on a wrong key", () => {
    expect(type(["ArrowUp", "ArrowUp", "ArrowDown", "x"])).toBe(0);
  });

  it("keeps two ups when a third comes", () => {
    expect(type(["ArrowUp", "ArrowUp", "ArrowUp", ...KONAMI.slice(2)])).toBe(
      KONAMI.length,
    );
  });

  it("starts again after a completed code", () => {
    expect(type([...KONAMI, ...KONAMI])).toBe(KONAMI.length);
  });
});
