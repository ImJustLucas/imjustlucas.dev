// Plain function, safe for React components: no Effect import (ADR-0002).
import type { Locale } from "@/i18n/routing";

import type { Period, PeriodPoint } from "./period";

const ONGOING: Record<Locale, string> = { en: "Today", fr: "Aujourd'hui" };

/** A year as is, a year-month as the Locale's month name and year. */
const formatPoint = (point: PeriodPoint, locale: Locale) => {
  if (point.length === 4) return point;
  const [year, month] = point.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year!, month! - 1)));
};

/**
 * A Period as Visitors read it, at its recorded precision: "2021 - 2023",
 * "September 2025 - Today", or "November 2023" for a single point in time.
 */
export const formatPeriod = (period: Period, locale: Locale): string => {
  const start = formatPoint(period.start, locale);
  if (period.end === period.start) return start;
  const end =
    period.end === "ongoing"
      ? ONGOING[locale]
      : formatPoint(period.end, locale);
  return `${start} - ${end}`;
};
