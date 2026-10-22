import { describe, expect, it } from "vitest";

import {
  isProjectSort,
  PROJECT_SORTS,
  sortProjects,
  techMatches,
} from "./inventory";
import type { Rarity } from "./schema";

const project = (title: string, rarity: Rarity) => ({ title, rarity });

// In Period order, the most recent first, as the catalog gives them.
const projects = [
  project("predi", "epic"),
  project("Zed", "common"),
  project("Écho", "rare"),
  project("tricks", "epic"),
  project("arc", "legendary"),
];
const titles = (sorted: ReadonlyArray<{ title: string }>) =>
  sorted.map((p) => p.title);

describe("sortProjects", () => {
  it("keeps the Period order for the most recent first", () => {
    expect(titles(sortProjects(projects, "recent", "fr"))).toEqual([
      "predi",
      "Zed",
      "Écho",
      "tricks",
      "arc",
    ]);
  });

  it("reverses it for the oldest first", () => {
    expect(titles(sortProjects(projects, "oldest", "fr"))).toEqual([
      "arc",
      "tricks",
      "Écho",
      "Zed",
      "predi",
    ]);
  });

  it("puts the rarest first, the most recent first within a rarity", () => {
    expect(titles(sortProjects(projects, "rarity", "fr"))).toEqual([
      "arc",
      "predi",
      "tricks",
      "Écho",
      "Zed",
    ]);
  });

  it("sorts by name from A to Z, ignoring case and accents", () => {
    expect(titles(sortProjects(projects, "name", "fr"))).toEqual([
      "arc",
      "Écho",
      "predi",
      "tricks",
      "Zed",
    ]);
  });

  it("leaves the given list untouched", () => {
    const before = titles(projects);
    sortProjects(projects, "oldest", "fr");
    sortProjects(projects, "rarity", "fr");
    expect(titles(projects)).toEqual(before);
  });
});

describe("PROJECT_SORTS", () => {
  it("offers rarity first, the default", () => {
    expect(PROJECT_SORTS).toEqual(["rarity", "recent", "oldest", "name"]);
  });
});

describe("isProjectSort", () => {
  it("accepts the offered orders only", () => {
    expect(isProjectSort("rarity")).toBe(true);
    expect(isProjectSort("stars")).toBe(false);
    expect(isProjectSort(null)).toBe(false);
  });
});

describe("techMatches", () => {
  it("ignores case, accents, spaces and punctuation", () => {
    expect(techMatches("Next.js", "nextjs")).toBe(true);
    expect(techMatches("React Native", "reactnat")).toBe(true);
    expect(techMatches("Material UI", "MATERIAL-ui")).toBe(true);
    expect(techMatches("Café", "cafe")).toBe(true);
  });

  it("finds the query anywhere in the name", () => {
    expect(techMatches("TypeScript", "script")).toBe(true);
    expect(techMatches("TypeScript", "python")).toBe(false);
  });

  it("matches every Tech on an empty search", () => {
    expect(techMatches("Docker", "")).toBe(true);
    expect(techMatches("Docker", " ")).toBe(true);
  });
});
