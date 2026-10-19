import { Schema } from "effect";

const POINT = String.raw`\d{4}(-(0[1-9]|1[0-2]))?`;

/** A point in time, precise to the year (`2024`) or the month (`2024-05`). */
export const PeriodPoint = Schema.String.check(
  Schema.isPattern(new RegExp(`^${POINT}$`), {
    message: "Expected a year (YYYY) or a year-month (YYYY-MM)",
  }),
);
export type PeriodPoint = typeof PeriodPoint.Type;

/** A Period's end: a point in time, or "ongoing". */
const PeriodEnd = Schema.String.check(
  Schema.isPattern(new RegExp(`^(${POINT}|ongoing)$`), {
    message: "Expected a year (YYYY), a year-month (YYYY-MM) or ongoing",
  }),
);

/** The earliest month a point can mean: a year starts in January. */
const earliest = (point: PeriodPoint) =>
  point.length === 4 ? `${point}-01` : point;

/** The latest month a point can mean: a year ends in December. */
const latest = (point: PeriodPoint) =>
  point.length === 4 ? `${point}-12` : point;

/**
 * The span of time a Project or Experience covers. A single point in time is
 * a Period whose end equals its start. The end must not precede the start.
 */
export const Period = Schema.Struct({
  start: PeriodPoint,
  end: PeriodEnd,
}).check(
  Schema.makeFilter((period) =>
    period.end === "ongoing" || latest(period.end) >= earliest(period.start)
      ? undefined
      : { path: ["end"], issue: "End must not precede start" },
  ),
);
export type Period = typeof Period.Type;

/**
 * Orders Periods by start, most recent first; on equal starts, ongoing first.
 * A year-precision start counts as January of that year.
 */
export const byStartMostRecentFirst = (a: Period, b: Period): number => {
  const startA = earliest(a.start);
  const startB = earliest(b.start);
  if (startA !== startB) return startA > startB ? -1 : 1;
  return Number(b.end === "ongoing") - Number(a.end === "ongoing");
};
