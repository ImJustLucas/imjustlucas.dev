import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubStars } from "./github-stars";
import { layerInMemory } from "./repository-in-memory";
import { testProfile } from "./test-profile";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const typescript = { id: "typescript", name: "TypeScript", color: "#3b82f6" };
const react = { id: "react", name: "React", color: "#60a5fa" };
const docker = { id: "docker", name: "Docker", color: "#3b82f6" };

const text = (en: string, fr: string) => ({ en, fr });

const catalogWith = (
  documents: {
    techs?: unknown;
    techCategories?: unknown;
    projects?: unknown;
    experiences?: unknown;
    profile?: unknown;
  },
  sources: {
    /** Star count per repository link; GitHub fails for any other. */
    stars?: Readonly<Record<string, number>>;
  } = {},
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
        "content/profile.json": JSON.stringify(
          documents.profile ?? testProfile,
        ),
      }),
    ),
    Layer.provide(GitHubStars.layerTest(sources.stars ?? {})),
    Layer.provide(YouTubeChannel.layerTest({})),
  );

describe("ContentCatalog.techCategories", () => {
  it.effect("resolves each Tech identifier to its Tech", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;
      const categories = yield* catalog.techCategories;

      expect(categories).toEqual([
        {
          name: text("Frontend", "Frontend"),
          description: text("Building UIs", "Construire des interfaces"),
          techs: [typescript, react],
        },
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [typescript, react, docker],
          techCategories: [
            {
              name: text("Frontend", "Frontend"),
              description: text("Building UIs", "Construire des interfaces"),
              techs: ["typescript", "react"],
            },
          ],
        }),
      ),
    ),
  );

  it.effect("keeps the category's order of Techs, not the registry's", () =>
    Effect.gen(function* () {
      const categories = yield* (yield* ContentCatalog).techCategories;

      expect(categories.map((c) => c.techs.map((t) => t.id))).toEqual([
        ["docker", "react", "typescript"],
        ["react"],
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [typescript, react, docker],
          techCategories: [
            {
              name: text("Mixed", "Mélange"),
              description: text("All of them", "Tous"),
              techs: ["docker", "react", "typescript"],
            },
            {
              name: text("Frontend", "Frontend"),
              description: text("Building UIs", "Construire des interfaces"),
              techs: ["react"],
            },
          ],
        }),
      ),
    ),
  );

  it.effect("fails on an unknown Tech identifier, naming file and place", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).techCategories);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain(
        "content/tech-categories.json at [0].techs[1]: Unknown Tech identifier: vue",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [typescript, react],
          techCategories: [
            {
              name: text("Frontend", "Frontend"),
              description: text("Building UIs", "Construire des interfaces"),
              techs: ["react", "vue"],
            },
          ],
        }),
      ),
    ),
  );

  it.effect("fails on a missing or empty translation", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).techCategories);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain(
        "content/tech-categories.json at [0].name.fr: Missing translation",
      );
      expect(error.message).toContain(
        "content/tech-categories.json at [0].description.en: Missing translation",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [react],
          techCategories: [
            {
              name: { en: "Frontend" },
              description: text("", "Construire des interfaces"),
              techs: ["react"],
            },
          ],
        }),
      ),
    ),
  );

  it.effect("fails when a Tech is defined more than once", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).techCategories);

      expect(error.message).toContain(
        "content/techs.json at [2].id: Tech identifier defined more than once: react",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [typescript, react, { ...react, name: "React.js" }],
          techCategories: [],
        }),
      ),
    ),
  );

  it.effect("fails when a content document is not valid JSON", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).techCategories);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain("content/techs.json");
    }).pipe(
      Effect.provide(
        ContentCatalog.layer.pipe(
          Layer.provide(
            layerInMemory({
              "content/techs.json": "[{",
              "content/tech-categories.json": "[]",
              "content/projects.json": "[]",
              "content/experiences.json": "[]",
              "content/profile.json": JSON.stringify(testProfile),
            }),
          ),
          Layer.provide(GitHubStars.layerTest({})),
          Layer.provide(YouTubeChannel.layerTest({})),
        ),
      ),
    ),
  );
});

const project = (title: string, period: unknown, rest: object = {}) => ({
  title,
  description: text(`${title} in English`, `${title} en français`),
  wip: false,
  period,
  techs: [],
  openSource: false,
  ...rest,
});

const NEXT_13 = "https://github.com/ImJustLucas/Next-13-Boilerplate";
const BUN_ELYSIA = "https://github.com/ImJustLucas/bun-elysia-boilerplate";

const openSource = (title: string, year: string, repository: string) =>
  project(title, { start: year, end: year }, { openSource: true, repository });

const projectTitles = Effect.gen(function* () {
  const projects = yield* (yield* ContentCatalog).projects;
  return projects.map((p) => p.title);
});

describe("ContentCatalog.projects", () => {
  it.effect("orders Projects by Period start, most recent first", () =>
    Effect.gen(function* () {
      expect(yield* projectTitles).toEqual([
        "Predi.GG",
        "Bun Elysia Boilerplate",
        "Next 13 Boilerplate",
        "Tricks",
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [
            project("Tricks", { start: "2021", end: "2023" }),
            project("Next 13 Boilerplate", {
              start: "2023-11",
              end: "2023-11",
            }),
            project("Predi.GG", { start: "2025", end: "ongoing" }),
            project("Bun Elysia Boilerplate", {
              start: "2024-05",
              end: "2024-05",
            }),
          ],
        }),
      ),
    ),
  );

  it.effect("puts the ongoing Project first on equal starts", () =>
    Effect.gen(function* () {
      expect(yield* projectTitles).toEqual(["Qotum", "Side project", "Tricks"]);
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [
            project("Tricks", { start: "2021", end: "2023" }),
            project("Side project", { start: "2024", end: "2024" }),
            project("Qotum", { start: "2024", end: "ongoing" }),
          ],
        }),
      ),
    ),
  );

  it.effect("counts a year-precision start as January of that year", () =>
    Effect.gen(function* () {
      expect(yield* projectTitles).toEqual([
        "May 2024",
        "January 2024, ongoing",
        "2024",
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [
            project("2024", { start: "2024", end: "2024" }),
            project("May 2024", { start: "2024-05", end: "2024-05" }),
            project("January 2024, ongoing", {
              start: "2024-01",
              end: "ongoing",
            }),
          ],
        }),
      ),
    ),
  );

  it.effect("resolves each Tech identifier and keeps the Period", () =>
    Effect.gen(function* () {
      const [qotum] = yield* (yield* ContentCatalog).projects;

      expect(qotum).toEqual({
        title: "Qotum",
        description: text("Qotum in English", "Qotum en français"),
        image: "/images/projects/qotum.png",
        wip: true,
        period: { start: "2024", end: "ongoing" },
        techs: [react, typescript],
        externalLink: "https://qotum.com",
      });
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [typescript, react],
          projects: [
            project(
              "Qotum",
              { start: "2024", end: "ongoing" },
              {
                image: "/images/projects/qotum.png",
                wip: true,
                techs: ["react", "typescript"],
                externalLink: "https://qotum.com",
              },
            ),
          ],
        }),
      ),
    ),
  );

  it.effect(
    "links open-source Projects to their repository, or else to the Profile's GitHub",
    () =>
      Effect.gen(function* () {
        const projects = yield* (yield* ContentCatalog).projects;

        expect(projects.map((p) => [p.title, p.repository])).toEqual([
          ["Open", "https://github.com/ImJustLucas/open"],
          ["Closed", undefined],
          ["Open, no repository", "https://github.com/someone-else"],
        ]);
      }).pipe(
        Effect.provide(
          catalogWith(
            {
              projects: [
                project(
                  "Open",
                  { start: "2024", end: "2024" },
                  {
                    openSource: true,
                    repository: "https://github.com/ImJustLucas/open",
                  },
                ),
                project(
                  "Closed",
                  { start: "2023", end: "2023" },
                  {
                    openSource: false,
                    repository: "https://github.com/ImJustLucas/closed",
                  },
                ),
                project(
                  "Open, no repository",
                  { start: "2022", end: "2022" },
                  { openSource: true },
                ),
              ],
              profile: {
                ...testProfile,
                links: {
                  ...testProfile.links,
                  github: "https://github.com/someone-else",
                },
              },
            },
            // GitHub knows only the Project's own repository: asking it for
            // the Profile's link would fail the catalog.
            { stars: { "https://github.com/ImJustLucas/open": 3 } },
          ),
        ),
      ),
  );

  it.effect(
    "merges the star count of an open-source Project's repository",
    () =>
      Effect.gen(function* () {
        const projects = yield* (yield* ContentCatalog).projects;

        expect(projects.map((p) => [p.title, p.stars])).toEqual([
          ["Bun Elysia Boilerplate", 33],
          ["Next 13 Boilerplate", 16],
        ]);
      }).pipe(
        Effect.provide(
          catalogWith(
            {
              projects: [
                openSource("Next 13 Boilerplate", "2023", NEXT_13),
                openSource("Bun Elysia Boilerplate", "2024", BUN_ELYSIA),
              ],
            },
            { stars: { [NEXT_13]: 16, [BUN_ELYSIA]: 33 } },
          ),
        ),
      ),
  );

  it.effect("shows no star count for a Project without repository", () =>
    Effect.gen(function* () {
      const projects = yield* (yield* ContentCatalog).projects;

      expect(projects.map((p) => [p.title, p.stars])).toEqual([
        ["No repository", undefined],
        ["Closed source", undefined],
      ]);
    }).pipe(
      Effect.provide(
        // GitHub knows no repository: asking it would fail the catalog.
        catalogWith({
          projects: [
            project("No repository", { start: "2024", end: "2024" }),
            project(
              "Closed source",
              { start: "2023", end: "2023" },
              { openSource: false, repository: NEXT_13 },
            ),
          ],
        }),
      ),
    ),
  );

  it.effect("shows no star count for a repository with zero stars", () =>
    Effect.gen(function* () {
      const projects = yield* (yield* ContentCatalog).projects;

      expect(projects.map((p) => [p.title, p.repository, p.stars])).toEqual([
        ["Bun Elysia Boilerplate", BUN_ELYSIA, undefined],
      ]);
    }).pipe(
      Effect.provide(
        catalogWith(
          {
            projects: [
              openSource("Bun Elysia Boilerplate", "2024", BUN_ELYSIA),
            ],
          },
          { stars: { [BUN_ELYSIA]: 0 } },
        ),
      ),
    ),
  );

  it.effect(
    "fails during revalidation when GitHub fails, so the previous page is kept",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).projects);

        expect(error._tag).toBe("GitHubStarsUnavailable");
      }).pipe(
        Effect.provideService(PageGeneration, "revalidation"),
        Effect.provide(
          catalogWith(
            {
              projects: [
                openSource("Next 13 Boilerplate", "2023", NEXT_13),
                openSource("Bun Elysia Boilerplate", "2024", BUN_ELYSIA),
              ],
            },
            { stars: { [NEXT_13]: 16 } },
          ),
        ),
      ),
  );

  it.effect("omits the stars GitHub fails to give on a cold build", () =>
    Effect.gen(function* () {
      const projects = yield* (yield* ContentCatalog).projects;

      expect(projects.map((p) => [p.title, p.repository, p.stars])).toEqual([
        ["Bun Elysia Boilerplate", BUN_ELYSIA, undefined],
        ["Next 13 Boilerplate", NEXT_13, 16],
      ]);
    }).pipe(
      Effect.provideService(PageGeneration, "cold-build"),
      Effect.provide(
        catalogWith(
          {
            projects: [
              openSource("Next 13 Boilerplate", "2023", NEXT_13),
              openSource("Bun Elysia Boilerplate", "2024", BUN_ELYSIA),
            ],
          },
          { stars: { [NEXT_13]: 16 } },
        ),
      ),
    ),
  );

  it.effect("fails on a Period that ends before it starts", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).projects);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain(
        "content/projects.json at [0].period.end: End must not precede start",
      );
      expect(error.message).toContain(
        "content/projects.json at [1].period.end: End must not precede start",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [
            project("Backwards", { start: "2024", end: "2023" }),
            project("Backwards by a month", {
              start: "2024-05",
              end: "2024-04",
            }),
          ],
        }),
      ),
    ),
  );

  it.effect("accepts an end at a coarser precision within the start year", () =>
    Effect.gen(function* () {
      expect(yield* projectTitles).toEqual(["Within 2024"]);
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [project("Within 2024", { start: "2024-05", end: "2024" })],
        }),
      ),
    ),
  );

  it.effect("fails on a Period point that is not a year or a year-month", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).projects);

      expect(error.message).toContain(
        "content/projects.json at [0].period.start: Expected a year (YYYY) or a year-month (YYYY-MM)",
      );
      expect(error.message).toContain(
        "content/projects.json at [1].period.end: Expected a year (YYYY), a year-month (YYYY-MM) or ongoing",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [
            project("Month 13", { start: "2024-13", end: "ongoing" }),
            project("Now", { start: "2024", end: "now" }),
          ],
        }),
      ),
    ),
  );

  it.effect("fails on an unknown Tech identifier, naming file and place", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).projects);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain(
        "content/projects.json at [0].techs[1]: Unknown Tech identifier: vue",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [react],
          projects: [
            project(
              "Tricks",
              { start: "2021", end: "2023" },
              { techs: ["react", "vue"] },
            ),
          ],
        }),
      ),
    ),
  );
});

const experience = (company: string, period: unknown, rest: object = {}) => ({
  company,
  role: text("Fullstack Developer", "Développeur Fullstack"),
  contractType: "work-study",
  link: `https://${company.toLowerCase().replace(/\W/g, "")}.com`,
  description: text(`${company} in English`, `${company} en français`),
  period,
  ...rest,
});

const experienceCompanies = Effect.gen(function* () {
  const experiences = yield* (yield* ContentCatalog).experiences;
  return experiences.map((e) => e.company);
});

describe("ContentCatalog.experiences", () => {
  it.effect(
    "lists an ongoing Experience started later before one started earlier",
    () =>
      Effect.gen(function* () {
        expect(yield* experienceCompanies).toEqual([
          "Bam Karaoke",
          "Predi.GG",
          "Favikon",
          "The Tricks Network",
          "TNYTR",
        ]);
      }).pipe(
        Effect.provide(
          catalogWith({
            experiences: [
              experience("Predi.GG", { start: "2025-09", end: "ongoing" }),
              experience("Bam Karaoke", { start: "2026-01", end: "ongoing" }),
              experience("Favikon", { start: "2023", end: "2025" }),
              experience("The Tricks Network", { start: "2021", end: "2023" }),
              experience("TNYTR", { start: "2021", end: "2021" }),
            ],
          }),
        ),
      ),
  );

  it.effect("puts the ongoing Experience first on equal starts", () =>
    Effect.gen(function* () {
      expect(yield* experienceCompanies).toEqual([
        "Still there",
        "Left the same year",
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          experiences: [
            experience("Left the same year", {
              start: "2024-03",
              end: "2024-09",
            }),
            experience("Still there", { start: "2024-03", end: "ongoing" }),
          ],
        }),
      ),
    ),
  );

  it.effect(
    "returns company, role, contract type, link, texts and Period",
    () =>
      Effect.gen(function* () {
        const experiences = yield* (yield* ContentCatalog).experiences;

        expect(experiences).toEqual([
          {
            company: "Favikon",
            role: text("Fullstack Developer", "Développeur Fullstack"),
            contractType: "work-study",
            link: "https://favikon.com",
            description: text("A SaaS", "Un SaaS"),
            period: { start: "2023", end: "2025" },
          },
        ]);
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

  it.effect("fails on a missing translation or an unknown contract type", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).experiences);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain(
        "content/experiences.json at [0].role.fr: Missing translation",
      );
      expect(error.message).toContain(
        "content/experiences.json at [1].contractType",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          experiences: [
            experience(
              "Favikon",
              { start: "2023", end: "2025" },
              { role: { en: "Fullstack Developer" } },
            ),
            experience(
              "TNYTR",
              { start: "2021", end: "2021" },
              { contractType: "freelance" },
            ),
          ],
        }),
      ),
    ),
  );

  it.effect("fails on a Period that ends before it starts", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).experiences);

      expect(error.message).toContain(
        "content/experiences.json at [0].period.end: End must not precede start",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          experiences: [experience("Favikon", { start: "2025", end: "2023" })],
        }),
      ),
    ),
  );
});

const profileWith = (changes: object) => ({ ...testProfile, ...changes });

describe("ContentCatalog.profile", () => {
  it.effect(
    "returns the social links, YouTube channel, Discord account and Resumes",
    () =>
      Effect.gen(function* () {
        const profile = yield* (yield* ContentCatalog).profile;

        expect(profile).toEqual({
          links: {
            github: "https://github.com/ImJustLucas",
            linkedin: "https://www.linkedin.com/in/lucasbellier/",
            youtube: "https://www.youtube.com/channel/UCLw4N_gccAY1Y4K4S20IPog",
            instagram: "https://www.instagram.com/imjustlucas_/",
          },
          youtubeChannelId: "UCLw4N_gccAY1Y4K4S20IPog",
          discordUserId: "127063570616811520",
          resumes: {
            en: { asset: "/pdf/cv-lucas.pdf", lastUpdated: "2025-05-28" },
            fr: { asset: "/pdf/cv-lucas-fr.pdf", lastUpdated: "2025-10-07" },
          },
        });
      }).pipe(Effect.provide(catalogWith({ profile: testProfile }))),
  );

  it.effect("fails on a Profile missing a Locale's Resume", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).profile);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain(
        "content/profile.json at resumes.fr: Missing Resume for this Locale",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          profile: profileWith({ resumes: { en: testProfile.resumes.en } }),
        }),
      ),
    ),
  );

  it.effect("fails on a Resume date that is not a calendar date", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).profile);

      expect(error.message).toContain(
        "content/profile.json at resumes.en.lastUpdated: Expected a date (YYYY-MM-DD)",
      );
      expect(error.message).toContain(
        "content/profile.json at resumes.fr.lastUpdated: Expected a date (YYYY-MM-DD)",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          profile: profileWith({
            resumes: {
              en: { asset: "/pdf/cv-lucas.pdf", lastUpdated: "May 28, 2025" },
              fr: { asset: "/pdf/cv-lucas-fr.pdf", lastUpdated: "2025-02-30" },
            },
          }),
        }),
      ),
    ),
  );

  it.effect("fails on a missing social link", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).profile);

      expect(error.message).toContain(
        "content/profile.json at links.instagram",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          profile: profileWith({
            links: { ...testProfile.links, instagram: undefined },
          }),
        }),
      ),
    ),
  );

  it.effect("fails when the YouTube link is not the Profile's channel", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).profile);

      expect(error.message).toContain(
        "content/profile.json at links.youtube: Expected https://www.youtube.com/channel/UCLw4N_gccAY1Y4K4S20IPog",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          profile: profileWith({
            links: {
              ...testProfile.links,
              youtube: "https://youtube.com/@imjustlucas",
            },
          }),
        }),
      ),
    ),
  );
});

describe("asset paths", () => {
  const ongoing = { start: "2024", end: "ongoing" };

  it.effect(
    "accept Project images and Resumes where the Admin stores them",
    () =>
      Effect.gen(function* () {
        const catalog = yield* ContentCatalog;

        expect((yield* catalog.projects).map((p) => p.image)).toEqual([
          "/images/projects/tricks-network-0a1b2c3d.webp",
          "/images/projects/predi.png",
        ]);
        expect((yield* catalog.profile).resumes.fr.asset).toBe(
          "/pdf/cv-lucas-fr.pdf",
        );
      }).pipe(
        Effect.provide(
          catalogWith({
            projects: [
              project("Tricks Network", ongoing, {
                image: "/images/projects/tricks-network-0a1b2c3d.webp",
              }),
              project(
                "Predi",
                { start: "2023", end: "2023" },
                {
                  image: "/images/projects/predi.png",
                },
              ),
            ],
          }),
        ),
      ),
  );

  it.effect(
    "refuse a Project image outside its folder, traversing, or not an image",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).projects);

        expect(error._tag).toBe("ContentInvalid");
        for (const at of [0, 1, 2, 3, 4])
          expect(error.message).toContain(
            `content/projects.json at [${at}].image: Expected an image (PNG, JPEG, WebP or AVIF) in /images/projects/`,
          );
      }).pipe(
        Effect.provide(
          catalogWith({
            projects: [
              "/images/projects/../../../package.json",
              "/images/projects/../../pdf/cv-lucas.png",
              "/pdf/cv-lucas.pdf",
              "/images/projects/nested/predi.png",
              "/images/projects/logo.svg",
            ].map((image) => project("Bad", ongoing, { image })),
          }),
        ),
      ),
  );

  it.effect(
    "refuse a Resume outside its folder, traversing, or not a PDF",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).profile);

        expect(error._tag).toBe("ContentInvalid");
        for (const locale of ["en", "fr"])
          expect(error.message).toContain(
            `content/profile.json at resumes.${locale}.asset: Expected a PDF in /pdf/`,
          );
      }).pipe(
        Effect.provide(
          catalogWith({
            profile: {
              ...testProfile,
              resumes: {
                en: { asset: "/pdf/../../.env.pdf", lastUpdated: "2025-05-28" },
                fr: { asset: "/images/cv.png", lastUpdated: "2025-10-07" },
              },
            },
          }),
        ),
      ),
  );
});
