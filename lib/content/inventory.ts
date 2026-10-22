// Plain functions, safe for React components: no Effect import (ADR-0002).
import type { Rarity } from "./schema";

/** The orders the inventory offers, the first the default. */
export const PROJECT_SORTS = ["rarity", "recent", "oldest", "name"] as const;
export type ProjectSort = (typeof PROJECT_SORTS)[number];

export const isProjectSort = (value: unknown): value is ProjectSort =>
  PROJECT_SORTS.includes(value as ProjectSort);

const RARITY_RANK: { readonly [R in Rarity]: number } = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

/**
 * The Projects in the chosen order. They arrive in Period order, the most
 * recent first (the catalog's), which `recent` keeps, `oldest` reverses and
 * the other orders fall back on: `rarity` the rarest first, `name` from A to
 * Z in the Locale's collation.
 */
export const sortProjects = <
  P extends { readonly title: string; readonly rarity: Rarity },
>(
  projects: ReadonlyArray<P>,
  sort: ProjectSort,
  locale: string,
): ReadonlyArray<P> => {
  switch (sort) {
    case "recent":
      return projects;
    case "oldest":
      return [...projects].reverse();
    case "rarity":
      return [...projects].sort(
        (a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity],
      );
    case "name": {
      const collator = new Intl.Collator(locale, { sensitivity: "base" });
      return [...projects].sort((a, b) => collator.compare(a.title, b.title));
    }
  }
};

/** Lowercase letters and digits only, without accents: "Next.js" is "nextjs". */
const searchable = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Whether a Tech's name answers what the visitor typed in the loadout's
 * search: case, accents, spaces and punctuation ignored, anywhere in the
 * name. An empty search matches every Tech.
 */
export const techMatches = (name: string, query: string): boolean =>
  searchable(name).includes(searchable(query));
