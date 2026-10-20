import { describe, expect, it } from "vitest";

import { loadout } from "./loadout";
import type { Period } from "./period";
import type { Tech } from "./schema";

const tech = (id: string, name = id): Tech => ({
  id: id as Tech["id"],
  name,
  color: "#000000",
});
const next = tech("nextjs", "Next.js");
const nest = tech("nestjs", "NestJS");
const nuxt = tech("nuxtjs", "Nuxt");

const project = (start: Period["start"], ...techs: ReadonlyArray<Tech>) => ({
  techs,
  period: { start, end: "ongoing" } as Period,
});

describe("loadout", () => {
  it("counts the Projects using each Tech, from the year the first started", () => {
    expect(
      loadout([project("2024", next, nest), project("2023-11", next)]),
    ).toEqual([
      { tech: next, projects: 2, since: 2023 },
      { tech: nest, projects: 1, since: 2024 },
    ]);
  });

  it("puts the most used first, then the longest held, then by name", () => {
    const zod = tech("zod", "Zod");
    const astro = tech("astro", "Astro");
    expect(
      loadout([
        project("2024", zod, astro),
        project("2021", nuxt),
        project("2022", next),
        project("2025", next),
      ]).map((entry) => entry.tech.id),
    ).toEqual(["nextjs", "nuxtjs", "astro", "zod"]);
  });

  it("leaves out what no Project uses", () => {
    expect(loadout([project("2025")])).toEqual([]);
    expect(loadout([])).toEqual([]);
  });
});
