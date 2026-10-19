import { describe, expect, it } from "vitest";

import { textColorOn } from "./text-color-on";

describe("textColorOn", () => {
  it("writes black on light colours", () => {
    expect(textColorOn("#facc15")).toBe("#000000");
    expect(textColorOn("#ffffff")).toBe("#000000");
  });

  it("writes white on dark and mid-tone colours", () => {
    expect(textColorOn("#000000")).toBe("#ffffff");
    expect(textColorOn("#3b82f6")).toBe("#ffffff");
    expect(textColorOn("#EF4444")).toBe("#ffffff");
  });
});
