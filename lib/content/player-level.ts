/**
 * The rules of Lucas's Level, derived from his GitHub Contributions: plain
 * functions with no Effect import, applied by the content catalog.
 *
 * One Contribution is one XP. Going from Level `n` to `n + 1` costs `100 n`
 * XP, so Level `n` starts at `50 n (n - 1)` XP; a new account is Level 1.
 */

/** One day of GitHub's Contribution calendar. */
export type ContributionDay = {
  /** GitHub's calendar day, `YYYY-MM-DD`. */
  readonly date: string;
  readonly count: number;
  /** GitHub's shade for the day, from 0 (none) to 4 (its busiest quarter). */
  readonly intensity: 0 | 1 | 2 | 3 | 4;
};

/** Lucas's Contributions as GitHub counts them. */
export type ContributionHistory = {
  /** Every Contribution since the account was opened. */
  readonly total: number;
  /** The last year of the calendar, oldest first, ending today. */
  readonly days: ReadonlyArray<ContributionDay>;
};

/** Where Lucas stands, ready to render. */
export type PlayerLevel = {
  /** Every Contribution since the account was opened, one XP each. */
  readonly xp: number;
  readonly level: number;
  /** XP earned since the current Level started. */
  readonly levelXp: number;
  /** XP the current Level takes to complete: `100 × level`. */
  readonly levelCost: number;
  /** Consecutive days with a Contribution, ending today or yesterday. */
  readonly streak: number;
  /** Whether today already counts in the Streak. */
  readonly streakIncludesToday: boolean;
  /** The last `RECENT_WEEKS` weeks, oldest first, each from its Sunday. */
  readonly weeks: ReadonlyArray<ReadonlyArray<ContributionDay>>;
  /** Contributions in those weeks. */
  readonly recentContributions: number;
};

/** How many weeks of the calendar the heatmap shows. */
export const RECENT_WEEKS = 20;

const LEVEL_STEP = 100;

/** The XP at which `level` starts. */
const levelStart = (level: number) => (LEVEL_STEP / 2) * level * (level - 1);

/** The Level reached with `xp` XP, and how far into it. */
export const levelFromXp = (
  xp: number,
): Pick<PlayerLevel, "level" | "levelXp" | "levelCost"> => {
  const earned = Math.max(0, Math.floor(xp));
  // The closed form, then nudged, so a float never lands a Level off.
  let level = Math.floor((1 + Math.sqrt(1 + (8 * earned) / LEVEL_STEP)) / 2);
  while (levelStart(level) > earned) level--;
  while (levelStart(level + 1) <= earned) level++;
  return {
    level,
    levelXp: earned - levelStart(level),
    levelCost: LEVEL_STEP * level,
  };
};

const DAY = 24 * 60 * 60 * 1000;

/** The calendar day `offset` days from `date`, both `YYYY-MM-DD`. */
const shiftDay = (date: string, offset: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + offset * DAY)
    .toISOString()
    .slice(0, 10);

/**
 * The Streak on `today` (Lucas's day in Paris): consecutive days with a
 * Contribution, ending today. A today without one yet does not break it
 * until the day ends: the Streak then runs to yesterday.
 */
export const currentStreak = (
  days: ReadonlyArray<ContributionDay>,
  today: string,
): Pick<PlayerLevel, "streak" | "streakIncludesToday"> => {
  const counts = new Map(days.map((day) => [day.date, day.count]));
  const active = (date: string) => (counts.get(date) ?? 0) > 0;
  const streakIncludesToday = active(today);
  let day = streakIncludesToday ? today : shiftDay(today, -1);
  let streak = 0;
  while (active(day)) {
    streak++;
    day = shiftDay(day, -1);
  }
  return { streak, streakIncludesToday };
};

/**
 * The last `count` calendar weeks up to `today`, oldest first, each from its
 * Sunday like GitHub's; days after today are left out, so the current week
 * may be short.
 */
export const recentWeeks = (
  days: ReadonlyArray<ContributionDay>,
  today: string,
  count = RECENT_WEEKS,
): ReadonlyArray<ReadonlyArray<ContributionDay>> => {
  const weeks = new Map<string, ContributionDay[]>();
  for (const day of [...days]
    .filter((day) => day.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date))) {
    const sunday = shiftDay(
      day.date,
      -new Date(`${day.date}T00:00:00Z`).getUTCDay(),
    );
    const week = weeks.get(sunday);
    if (week) week.push(day);
    else weeks.set(sunday, [day]);
  }
  return [...weeks.values()].slice(-count);
};

/** Lucas's Level, Streak and recent weeks on `today` (his day in Paris). */
export const playerLevel = (
  history: ContributionHistory,
  today: string,
): PlayerLevel => {
  const weeks = recentWeeks(history.days, today);
  return {
    xp: Math.max(0, history.total),
    ...levelFromXp(history.total),
    ...currentStreak(history.days, today),
    weeks,
    recentContributions: weeks.flat().reduce((sum, day) => sum + day.count, 0),
  };
};
