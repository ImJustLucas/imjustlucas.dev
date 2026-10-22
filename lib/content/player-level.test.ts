import { describe, expect, it } from "vitest";

import {
  type ContributionDay,
  currentStreak,
  levelFromXp,
  playerLevel,
  RECENT_WEEKS,
  recentWeeks,
} from "./player-level";

/** Consecutive days from `start`, one per count. */
const daysFrom = (
  start: string,
  counts: ReadonlyArray<number>,
): ContributionDay[] =>
  counts.map((count, i) => ({
    date: new Date(Date.parse(`${start}T00:00:00Z`) + i * 86_400_000)
      .toISOString()
      .slice(0, 10),
    count,
    intensity: count === 0 ? 0 : 1,
  }));

describe("levelFromXp", () => {
  it("starts at Level 1 with no XP", () => {
    expect(levelFromXp(0)).toEqual({ level: 1, levelXp: 0, levelCost: 100 });
  });

  it("costs 100 × n XP to go from Level n to n + 1", () => {
    expect(levelFromXp(99)).toEqual({ level: 1, levelXp: 99, levelCost: 100 });
    expect(levelFromXp(100)).toEqual({ level: 2, levelXp: 0, levelCost: 200 });
    expect(levelFromXp(299)).toEqual({
      level: 2,
      levelXp: 199,
      levelCost: 200,
    });
    expect(levelFromXp(300)).toEqual({ level: 3, levelXp: 0, levelCost: 300 });
  });

  it("lands exactly on every Level's start, however high", () => {
    for (let level = 1; level <= 500; level++) {
      const start = 50 * level * (level - 1);
      expect(levelFromXp(start).level).toBe(level);
      expect(levelFromXp(start).levelXp).toBe(0);
      expect(levelFromXp(start - 1).level).toBe(Math.max(1, level - 1));
    }
  });

  it("puts 6253 XP at Level 11, 753 of 1100 into it", () => {
    expect(levelFromXp(6253)).toEqual({
      level: 11,
      levelXp: 753,
      levelCost: 1100,
    });
  });

  it("treats negative or fractional XP as whole XP from zero", () => {
    expect(levelFromXp(-5)).toEqual({ level: 1, levelXp: 0, levelCost: 100 });
    expect(levelFromXp(100.9).level).toBe(2);
  });
});

describe("currentStreak", () => {
  it("counts the consecutive active days ending today", () => {
    const days = daysFrom("2026-10-15", [3, 0, 1, 2, 5]);

    expect(currentStreak(days, "2026-10-19")).toEqual({
      streak: 3,
      streakIncludesToday: true,
    });
  });

  it("keeps the Streak alive while today has no Contribution yet", () => {
    const days = daysFrom("2026-10-15", [3, 0, 1, 2, 0]);

    expect(currentStreak(days, "2026-10-19")).toEqual({
      streak: 2,
      streakIncludesToday: false,
    });
  });

  it("keeps it alive when GitHub has no entry for today yet", () => {
    // Just after midnight in Paris, GitHub's calendar can still end yesterday.
    const days = daysFrom("2026-10-16", [1, 2, 4]);

    expect(currentStreak(days, "2026-10-19")).toEqual({
      streak: 3,
      streakIncludesToday: false,
    });
  });

  it("is broken once a whole day passed without a Contribution", () => {
    const days = daysFrom("2026-10-15", [3, 4, 0, 0, 0]);

    expect(currentStreak(days, "2026-10-19")).toEqual({
      streak: 0,
      streakIncludesToday: false,
    });
  });

  it("is zero with no data at all", () => {
    expect(currentStreak([], "2026-10-19")).toEqual({
      streak: 0,
      streakIncludesToday: false,
    });
  });

  it("crosses months and years", () => {
    const days = daysFrom("2025-12-30", [1, 1, 1, 1]);

    expect(currentStreak(days, "2026-01-02").streak).toBe(4);
  });
});

describe("recentWeeks", () => {
  it("groups the days into weeks from Sunday, oldest first", () => {
    // 2026-10-04 is a Sunday.
    const weeks = recentWeeks(
      daysFrom("2026-10-01", Array(12).fill(1)),
      "2026-10-12",
    );

    expect(weeks.map((week) => week.map((day) => day.date))).toEqual([
      ["2026-10-01", "2026-10-02", "2026-10-03"],
      [
        "2026-10-04",
        "2026-10-05",
        "2026-10-06",
        "2026-10-07",
        "2026-10-08",
        "2026-10-09",
        "2026-10-10",
      ],
      ["2026-10-11", "2026-10-12"],
    ]);
  });

  it("keeps only the last weeks, and none after today", () => {
    const weeks = recentWeeks(
      daysFrom("2025-10-19", Array(400).fill(1)),
      "2026-10-21",
      RECENT_WEEKS,
    );

    expect(weeks).toHaveLength(RECENT_WEEKS);
    expect(weeks.at(-1)!.at(-1)!.date).toBe("2026-10-21");
    expect(weeks.every((week) => week.length <= 7)).toBe(true);
  });

  it("is empty with no data", () => {
    expect(recentWeeks([], "2026-10-21")).toEqual([]);
  });
});

describe("playerLevel", () => {
  it("derives the Level from every Contribution, the Streak and weeks from the calendar", () => {
    const days = daysFrom("2026-10-11", [0, 2, 0, 5, 7, 1]);

    expect(playerLevel({ total: 350, days }, "2026-10-16")).toEqual({
      xp: 350,
      level: 3,
      levelXp: 50,
      levelCost: 300,
      streak: 3,
      streakIncludesToday: true,
      weeks: [days],
      recentContributions: 15,
    });
  });

  it("is Level 1 with no Streak and no weeks on zero data", () => {
    expect(playerLevel({ total: 0, days: [] }, "2026-10-16")).toEqual({
      xp: 0,
      level: 1,
      levelXp: 0,
      levelCost: 100,
      streak: 0,
      streakIncludesToday: false,
      weeks: [],
      recentContributions: 0,
    });
  });
});
