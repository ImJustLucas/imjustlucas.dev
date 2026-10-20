import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { GitHubStars } from "./github-stars";
import { layerInMemory } from "./repository-in-memory";
import { testProfile } from "./test-profile";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const react = { id: "react", name: "React", color: "#60a5fa" };

const text = (en: string, fr: string) => ({ en, fr });

const BOILERPLATE = "https://github.com/ImJustLucas/Next-13-Boilerplate";

const catalogWith = (
  documents: {
    techs?: unknown;
    techCategories?: unknown;
    projects?: unknown;
    experiences?: unknown;
    profile?: unknown;
    achievements?: unknown;
    hobbies?: unknown;
  },
  /** Star count per repository link; GitHub fails for any other. */
  stars: Readonly<Record<string, number>> = {},
) =>
  ContentCatalog.layer.pipe(
    Layer.provide(
      layerInMemory({
        "content/techs.json": JSON.stringify(documents.techs ?? []),
        "content/tech-categories.json": JSON.stringify(
          documents.techCategories ?? [],
        ),
        "content/projects.json": JSON.stringify(documents.projects ?? []),
        "content/experiences.json": JSON.stringify(documents.experiences ?? []),
        "content/achievements.json": JSON.stringify(
          documents.achievements ?? [],
        ),
        "content/hobbies.json": JSON.stringify(documents.hobbies ?? []),
        "content/profile.json": JSON.stringify(
          documents.profile ?? testProfile,
        ),
      }),
    ),
    Layer.provide(GitHubStars.layerTest(stars)),
    Layer.provide(YouTubeChannel.layerTest({})),
  );

const qotum = {
  title: "Qotum",
  description: text(
    "The smartest way to respond to your ratings.",
    "La façon la plus intelligente de répondre à vos avis.",
  ),
  wip: true,
  period: { start: "2024", end: "ongoing" },
  techs: ["react"],
  openSource: false,
  rarity: "rare",
  featured: 1,
};

describe("ContentCatalog.inLocale(locale).projects", () => {
  it.effect("returns each description in the Locale, the title as is", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;
      const english = yield* catalog.inLocale("en").projects;
      const french = yield* catalog.inLocale("fr").projects;

      expect(english).toEqual([
        {
          title: "Qotum",
          description: "The smartest way to respond to your ratings.",
          wip: true,
          period: { start: "2024", end: "ongoing" },
          techs: [react],
          rarity: "rare",
          featured: 1,
        },
      ]);
      expect(french.map((p) => [p.title, p.description])).toEqual([
        ["Qotum", "La façon la plus intelligente de répondre à vos avis."],
      ]);
    }).pipe(Effect.provide(catalogWith({ techs: [react], projects: [qotum] }))),
  );
});

/** A Project at `place` on the home page (none: not featured). */
const featuredAt = (
  title: string,
  start: string,
  place?: number,
  rest: object = {},
) => ({
  title,
  description: text(`${title} in English`, `${title} en français`),
  wip: false,
  period: { start, end: start },
  techs: [],
  openSource: false,
  rarity: "common",
  ...(place !== undefined && { featured: place }),
  ...rest,
});

describe("ContentCatalog.inLocale(locale).featuredProjects", () => {
  it.effect(
    "returns the featured Projects by place, then by Period, at most 3",
    () =>
      Effect.gen(function* () {
        const featured = yield* (yield* ContentCatalog).inLocale("fr")
          .featuredProjects;

        expect(featured.map((p) => [p.title, p.featured])).toEqual([
          ["Predi.GG", 1],
          ["Qotum", 2],
          ["Tricks", 2],
        ]);
        expect(featured[0].description).toBe("Predi.GG en français");
      }).pipe(
        Effect.provide(
          catalogWith({
            projects: [
              featuredAt("Tricks", "2021", 2),
              featuredAt("Boilerplate", "2023"),
              featuredAt("Side project", "2024", 4),
              featuredAt("Qotum", "2024", 2),
              featuredAt("Predi.GG", "2025", 1),
            ],
          }),
        ),
      ),
  );

  it.effect("returns none when no Project is featured", () =>
    Effect.gen(function* () {
      expect(
        yield* (yield* ContentCatalog).inLocale("en").featuredProjects,
      ).toEqual([]);
    }).pipe(
      Effect.provide(
        catalogWith({ projects: [featuredAt("Boilerplate", "2023")] }),
      ),
    ),
  );

  it.effect("gives featured Projects their star count, like the others", () =>
    Effect.gen(function* () {
      const [featured] = yield* (yield* ContentCatalog).inLocale("en")
        .featuredProjects;

      expect(featured).toEqual({
        title: "Boilerplate",
        description: "Boilerplate in English",
        wip: false,
        period: { start: "2023", end: "2023" },
        techs: [],
        repository: BOILERPLATE,
        stars: 12,
        rarity: "common",
        featured: 1,
      });
    }).pipe(
      Effect.provide(
        catalogWith(
          {
            projects: [
              featuredAt("Boilerplate", "2023", 1, {
                openSource: true,
                repository: BOILERPLATE,
              }),
            ],
          },
          { [BOILERPLATE]: 12 },
        ),
      ),
    ),
  );
});

describe("ContentCatalog.inLocale(locale).achievements", () => {
  it.effect("returns each name and description in the Locale, in order", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;

      expect(yield* catalog.inLocale("fr").achievements).toEqual([
        {
          name: "MasterDevFrance 2025",
          description: "vainqueur du concours national",
          year: 2025,
          rarity: "legendary",
          link: "/mdf-2025",
          art: "/images/chibi/trophy.webp",
        },
        {
          name: "Hackathon",
          description: "premier prix",
          year: 2023,
          rarity: "rare",
          link: "https://hackathon.example",
          art: "/images/achievements/hackathon-0a1b2c3d.png",
        },
      ]);
      expect(
        (yield* catalog.inLocale("en").achievements).map((a) => [
          a.name,
          a.description,
        ]),
      ).toEqual([
        ["MasterDevFrance 2025", "winner of the national competition"],
        ["Hackathon", "first prize"],
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          achievements: [
            {
              name: text("MasterDevFrance 2025", "MasterDevFrance 2025"),
              description: text(
                "winner of the national competition",
                "vainqueur du concours national",
              ),
              year: 2025,
              rarity: "legendary",
              link: "/mdf-2025",
              art: "/images/chibi/trophy.webp",
            },
            {
              name: text("Hackathon", "Hackathon"),
              description: text("first prize", "premier prix"),
              year: 2023,
              rarity: "rare",
              link: "https://hackathon.example",
              art: "/images/achievements/hackathon-0a1b2c3d.png",
            },
          ],
        }),
      ),
    ),
  );
});

describe("ContentCatalog.inLocale(locale).hobbies", () => {
  it.effect("returns each label in the Locale, in order", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;

      expect(yield* catalog.inLocale("fr").hobbies).toEqual([
        { label: "jouer à LoL", pose: "lol" },
        { label: "surf", pose: "surf" },
      ]);
      expect(yield* catalog.inLocale("en").hobbies).toEqual([
        { label: "playing LoL", pose: "lol" },
        { label: "surf", pose: "surf" },
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          hobbies: [
            { label: text("playing LoL", "jouer à LoL"), pose: "lol" },
            { label: text("surf", "surf"), pose: "surf" },
          ],
        }),
      ),
    ),
  );
});

describe("ContentCatalog.inLocale(locale).techCategories", () => {
  it.effect("returns each name and description in the Locale", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;

      expect(yield* catalog.inLocale("fr").techCategories).toEqual([
        { name: "Outils", description: "Ce que j'utilise", techs: [react] },
      ]);
      expect(yield* catalog.inLocale("en").techCategories).toEqual([
        { name: "Tools", description: "What I use", techs: [react] },
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [react],
          techCategories: [
            {
              name: text("Tools", "Outils"),
              description: text("What I use", "Ce que j'utilise"),
              techs: ["react"],
            },
          ],
        }),
      ),
    ),
  );
});

describe("ContentCatalog.inLocale(locale).experiences", () => {
  it.effect(
    "returns each role and description in the Locale, the company as is",
    () =>
      Effect.gen(function* () {
        const catalog = yield* ContentCatalog;

        expect(yield* catalog.inLocale("fr").experiences).toEqual([
          {
            company: "Favikon",
            role: "Développeur Fullstack",
            contractType: "work-study",
            link: "https://favikon.com",
            description: "Un SaaS",
            period: { start: "2023", end: "2025" },
            emoji: "💜",
          },
        ]);
        expect(
          (yield* catalog.inLocale("en").experiences).map((e) => [
            e.company,
            e.role,
            e.description,
          ]),
        ).toEqual([["Favikon", "Fullstack Developer", "A SaaS"]]);
      }).pipe(
        Effect.provide(
          catalogWith({
            experiences: [
              {
                company: "Favikon",
                role: text("Fullstack Developer", "Développeur Fullstack"),
                contractType: "work-study",
                link: "https://favikon.com",
                description: text("A SaaS", "Un SaaS"),
                period: { start: "2023", end: "2025" },
                emoji: "💜",
              },
            ],
          }),
        ),
      ),
  );
});

describe("ContentCatalog.inLocale(locale).resume", () => {
  it.effect("returns the Profile's Resume for the Locale", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;

      expect(yield* catalog.inLocale("en").resume).toEqual({
        asset: "/pdf/cv-lucas.pdf",
        lastUpdated: "2025-05-28",
      });
      expect(yield* catalog.inLocale("fr").resume).toEqual({
        asset: "/pdf/cv-lucas-fr.pdf",
        lastUpdated: "2025-10-07",
      });
    }).pipe(Effect.provide(catalogWith({ profile: testProfile }))),
  );
});
