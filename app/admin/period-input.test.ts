import { describe, expect, it } from "vitest";

import { readPeriod } from "./period-input";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
};

describe("reading a Period field", () => {
  it("reads a year as a year and a year with a month as a year-month", () => {
    expect(
      readPeriod(
        form({
          "period.start.year": "2023",
          "period.start.month": "",
          "period.end.year": " 2025 ",
          "period.end.month": "08",
        }),
        "period",
      ),
    ).toEqual({ start: "2023", end: "2025-08" });
  });

  it("reads an ongoing end, whatever the end's year and month say", () => {
    expect(
      readPeriod(
        form({
          "period.start.year": "2025",
          "period.start.month": "09",
          "period.end.year": "2026",
          "period.end.month": "01",
          "period.end.ongoing": "on",
        }),
        "period",
      ),
    ).toEqual({ start: "2025-09", end: "ongoing" });
  });

  it("leaves a missing year empty, for the schema to report", () => {
    expect(readPeriod(form({ "period.start.month": "05" }), "period")).toEqual({
      start: "",
      end: "",
    });
  });
});
