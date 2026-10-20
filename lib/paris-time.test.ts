import { describe, expect, it } from "vitest";

import { isNightInParis } from "./paris-time";

describe("isNightInParis", () => {
  it("is night from 21:00 to 07:00 in Paris in winter (UTC+1)", () => {
    expect(isNightInParis(new Date("2026-01-15T19:59:00Z"))).toBe(false); // 20:59
    expect(isNightInParis(new Date("2026-01-15T20:00:00Z"))).toBe(true); // 21:00
    expect(isNightInParis(new Date("2026-01-16T05:59:00Z"))).toBe(true); // 06:59
    expect(isNightInParis(new Date("2026-01-16T06:00:00Z"))).toBe(false); // 07:00
  });

  it("follows daylight saving time in summer (UTC+2)", () => {
    expect(isNightInParis(new Date("2026-07-15T18:59:00Z"))).toBe(false); // 20:59
    expect(isNightInParis(new Date("2026-07-15T19:00:00Z"))).toBe(true); // 21:00
    expect(isNightInParis(new Date("2026-07-16T04:59:00Z"))).toBe(true); // 06:59
    expect(isNightInParis(new Date("2026-07-16T05:00:00Z"))).toBe(false); // 07:00
  });

  it("is day at noon and night at midnight", () => {
    expect(isNightInParis(new Date("2026-10-20T10:00:00Z"))).toBe(false);
    expect(isNightInParis(new Date("2026-10-20T22:00:00Z"))).toBe(true);
  });
});
