import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { GitHubStars } from "./github-stars";
import { layerInMemory } from "./repository-in-memory";
import { testProfile } from "./test-profile";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const react = { id: "react", name: "React", color: "#60a5fa" };

const text = (en: string, fr: string) => ({ en, fr });

const catalogWith = (documents: {
  techs?: unknown;
  techCategories?: unknown;
  projects?: unknown;
  experiences?: unknown;
  profile?: unknown;
}) =>
  ContentCatalog.layer.pipe(
    Layer.provide(
      layerInMemory({
        "content/techs.json": JSON.stringify(documents.techs ?? []),
        "content/tech-categories.json": JSON.stringify(
          documents.techCategories ?? [],
        ),
        "content/projects.json": JSON.stringify(documents.projects ?? []),
        "content/experiences.json": JSON.stringify(documents.experiences ?? []),
        "content/profile.json": JSON.stringify(
          documents.profile ?? testProfile,
        ),
      }),
    ),
    Layer.provide(GitHubStars.layerTest({})),
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
        },
      ]);
      expect(french.map((p) => [p.title, p.description])).toEqual([
        ["Qotum", "La façon la plus intelligente de répondre à vos avis."],
      ]);
    }).pipe(Effect.provide(catalogWith({ techs: [react], projects: [qotum] }))),
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
