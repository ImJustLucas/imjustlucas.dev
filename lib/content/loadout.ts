// Plain function, safe for React components: no Effect import (ADR-0002).
import type { Period } from "./period";
import type { Tech } from "./schema";

/** A Tech of the loadout: how many Projects use it, and since when. */
export type LoadoutEntry = {
  readonly tech: Tech;
  /** How many Projects use the Tech, at least one. */
  readonly projects: number;
  /** The year the earliest of those Projects started. */
  readonly since: number;
};

/**
 * The loadout: every Tech at least one Project uses, the most used first,
 * then the longest held, then by name. A Tech no Project uses is left out,
 * as its count would be zero.
 */
export const loadout = (
  projects: ReadonlyArray<{
    readonly techs: ReadonlyArray<Tech>;
    readonly period: Period;
  }>,
): ReadonlyArray<LoadoutEntry> => {
  const entries = new Map<Tech["id"], LoadoutEntry>();
  for (const project of projects) {
    const year = Number(project.period.start.slice(0, 4));
    for (const tech of project.techs) {
      const entry = entries.get(tech.id);
      entries.set(tech.id, {
        tech,
        projects: (entry?.projects ?? 0) + 1,
        since: Math.min(entry?.since ?? year, year),
      });
    }
  }
  return [...entries.values()].sort(
    (a, b) =>
      b.projects - a.projects ||
      a.since - b.since ||
      a.tech.name.localeCompare(b.tech.name),
  );
};
