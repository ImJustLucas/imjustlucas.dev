import { describe, expect, it } from "vitest";

import { formatPeriod } from "./format-period";

describe("formatPeriod", () => {
  it("shows years at year precision", () => {
    expect(formatPeriod({ start: "2021", end: "2023" }, "en")).toBe(
      "2021 - 2023",
    );
    expect(formatPeriod({ start: "2021", end: "2023" }, "fr")).toBe(
      "2021 - 2023",
    );
  });

  it("names months in the Locale at month precision", () => {
    expect(formatPeriod({ start: "2023-09", end: "2024-02" }, "en")).toBe(
      "September 2023 - February 2024",
    );
    expect(formatPeriod({ start: "2023-09", end: "2024-02" }, "fr")).toBe(
      "septembre 2023 - février 2024",
    );
  });

  it("keeps each end at its own precision", () => {
    expect(formatPeriod({ start: "2023-09", end: "2025" }, "en")).toBe(
      "September 2023 - 2025",
    );
  });

  it("shows an ongoing Period as running today", () => {
    expect(formatPeriod({ start: "2025-09", end: "ongoing" }, "en")).toBe(
      "September 2025 - Today",
    );
    expect(formatPeriod({ start: "2025", end: "ongoing" }, "fr")).toBe(
      "2025 - Aujourd'hui",
    );
  });

  it("shows a single point in time once", () => {
    expect(formatPeriod({ start: "2023-11", end: "2023-11" }, "en")).toBe(
      "November 2023",
    );
    expect(formatPeriod({ start: "2024-05", end: "2024-05" }, "fr")).toBe(
      "mai 2024",
    );
    expect(formatPeriod({ start: "2022", end: "2022" }, "fr")).toBe("2022");
  });
});
