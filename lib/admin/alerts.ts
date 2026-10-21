import type { Content } from "@/lib/content/schema";

/**
 * What the Admin home asks the Owner to fix (plain code): a Resume that has
 * grown stale and a Project shown with no Tech, two gaps the final audit of
 * 2026-10-21 found on the public pages.
 */

/** A Resume older than this many months is stale. */
export const RESUME_MAX_AGE_MONTHS = 6;

export type AdminAlert =
  | {
      readonly kind: "stale-resume";
      readonly locale: "en" | "fr";
      /** The Resume's date, `YYYY-MM-DD`. */
      readonly lastUpdated: string;
      /** The Experience that started after it, if that is why it is stale. */
      readonly newerExperience?: string;
    }
  | {
      readonly kind: "project-without-tech";
      /** The Project's position in the stored document. */
      readonly index: number;
      readonly title: string;
    };

/** `YYYY-MM-DD` moved back `months` calendar months (day kept). */
const monthsBefore = (day: string, months: number) => {
  const [year, month] = day.split("-").map(Number);
  const total = year * 12 + (month - 1) - months;
  const y = Math.floor(total / 12);
  const m = String((total % 12) + 1).padStart(2, "0");
  return `${y}-${m}${day.slice(7)}`;
};

/** The first day a Period point can mean: `2024` is 2024-01-01. */
const firstDay = (point: string) =>
  point.length === 4 ? `${point}-01-01` : `${point}-01`;

/**
 * The alerts for `content` on `today` (`YYYY-MM-DD`, in Europe/Paris): each
 * Resume older than six months or older than the start of the most recently
 * started Experience, then each Project with no Tech, in stored order.
 */
export const adminAlerts = (
  content: Pick<Content, "profile" | "experiences" | "projects">,
  today: string,
): ReadonlyArray<AdminAlert> => {
  const tooOld = monthsBefore(today, RESUME_MAX_AGE_MONTHS);
  const newest = content.experiences.reduce<
    { company: string; start: string } | undefined
  >((latest, { company, period }) => {
    const start = firstDay(period.start);
    return !latest || start > latest.start ? { company, start } : latest;
  }, undefined);

  const resumes = (["en", "fr"] as const).flatMap((locale): AdminAlert[] => {
    const { lastUpdated } = content.profile.resumes[locale];
    const beforeExperience =
      newest && newest.start <= today && lastUpdated < newest.start;
    if (!beforeExperience && lastUpdated >= tooOld) return [];
    return [
      {
        kind: "stale-resume",
        locale,
        lastUpdated,
        ...(beforeExperience && { newerExperience: newest.company }),
      },
    ];
  });

  const projects = content.projects.flatMap((project, index): AdminAlert[] =>
    project.techs.length === 0
      ? [{ kind: "project-without-tech", index, title: project.title }]
      : [],
  );

  return [...resumes, ...projects];
};

/** `date` as a day in Europe/Paris, `YYYY-MM-DD`: the Admin's "today". */
export const parisDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

/** Whole calendar months from `day` to `today` (both `YYYY-MM-DD`). */
export const monthsBetween = (day: string, today: string) => {
  const months = (d: string) =>
    Number(d.slice(0, 4)) * 12 + Number(d.slice(5, 7));
  return months(today) - months(day) - (today.slice(8) < day.slice(8) ? 1 : 0);
};
