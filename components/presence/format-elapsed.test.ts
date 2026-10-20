import { describe, expect, it } from "vitest";

import { formatElapsed } from "./format-elapsed";

describe("formatElapsed", () => {
  it("shows minutes and seconds under an hour", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(65_000)).toBe("1:05");
    expect(formatElapsed(59 * 60_000 + 59_000)).toBe("59:59");
  });

  it("adds the hours after an hour", () => {
    expect(formatElapsed(3_600_000)).toBe("1:00:00");
    expect(formatElapsed(2 * 3_600_000 + 7 * 60_000 + 3_000)).toBe("2:07:03");
  });

  it("never goes negative when clocks disagree", () => {
    expect(formatElapsed(-5_000)).toBe("0:00");
  });
});
