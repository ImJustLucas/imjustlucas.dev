import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubContributions } from "./github-contributions";
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
    projects?: unknown;
    experiences?: unknown;
    profile?: unknown;
    achievements?: unknown;
    hobbies?: unknown;
    patchNotes?: unknown;
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
        "content/projects.json": JSON.stringify(documents.projects ?? []),
        "content/experiences.json": JSON.stringify(documents.experiences ?? []),
        "content/achievements.json": JSON.stringify(
          documents.achievements ?? [],
        ),
        "content/hobbies.json": JSON.stringify(documents.hobbies ?? []),
        "content/patch-notes.json": JSON.stringify(documents.patchNotes ?? []),
        "content/profile.json": JSON.stringify(
          documents.profile ?? testProfile,
        ),
      }),
    ),
    Layer.provide(GitHubStars.layerTest(sources.stars ?? {})),
    Layer.provide(GitHubContributions.layerTest({})),
    Layer.provide(YouTubeChannel.layerTest({})),
  );

describe("the Tech registry", () => {
  it.effect(
    "resolves each of a Project's Tech identifiers to its Tech, in the Project's order",
    () =>
      Effect.gen(function* () {
        const projects = yield* (yield* ContentCatalog).projects;

        expect(projects.map((p) => p.techs)).toEqual([[docker, typescript]]);
      }).pipe(
        Effect.provide(
          catalogWith({
            techs: [typescript, react, docker],
            projects: [
              {
                slug: "portfolio",
                title: "Portfolio",
                description: text("A portfolio", "Un portfolio"),
                wip: false,
                period: { start: "2024", end: "2024" },
                techs: ["docker", "typescript"],
                openSource: false,
                rarity: "common",
              },
            ],
          }),
        ),
      ),
  );

  it.effect("fails when a Tech is defined more than once", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).projects);

      expect(error.message).toContain(
        "content/techs.json at [2].id: Tech identifier defined more than once: react",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          techs: [typescript, react, { ...react, name: "React.js" }],
        }),
      ),
    ),
  );

  it.effect("fails when a content document is not valid JSON", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).projects);

      expect(error._tag).toBe("ContentInvalid");
      expect(error.message).toContain("content/techs.json");
    }).pipe(
      Effect.provide(
        ContentCatalog.layer.pipe(
          Layer.provide(
            layerInMemory({
              "content/techs.json": "[{",
              "content/projects.json": "[]",
              "content/experiences.json": "[]",
              "content/achievements.json": "[]",
              "content/hobbies.json": "[]",
              "content/patch-notes.json": "[]",
              "content/profile.json": JSON.stringify(testProfile),
            }),
          ),
          Layer.provide(GitHubStars.layerTest({})),
          Layer.provide(GitHubContributions.layerTest({})),
          Layer.provide(YouTubeChannel.layerTest({})),
        ),
      ),
    ),
  );
});

const project = (title: string, period: unknown, rest: object = {}) => ({
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title,
  description: text(`${title} in English`, `${title} en français`),
  wip: false,
  period,
  techs: [],
  openSource: false,
  rarity: "common",
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

  it.effect(
    "resolves each Tech identifier and keeps the Period and Rarity",
    () =>
      Effect.gen(function* () {
        const [qotum] = yield* (yield* ContentCatalog).projects;

        expect(qotum).toEqual({
          slug: "qotum",
          title: "Qotum",
          description: text("Qotum in English", "Qotum en français"),
          image: "/images/projects/qotum.png",
          wip: true,
          period: { start: "2024", end: "ongoing" },
          techs: [react, typescript],
          externalLink: "https://qotum.com",
          rarity: "rare",
          featured: 2,
          gallery: [],
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
                  rarity: "rare",
                  featured: 2,
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

  it.effect(
    "fails on an unknown or missing Rarity and a place that is not a whole number from 1",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).projects);

        expect(error._tag).toBe("ContentInvalid");
        expect(error.message).toContain("content/projects.json at [0].rarity");
        expect(error.message).toContain("content/projects.json at [1].rarity");
        for (const at of [2, 3, 4])
          expect(error.message).toContain(
            `content/projects.json at [${at}].featured: Expected a whole number from 1`,
          );
      }).pipe(
        Effect.provide(
          catalogWith({
            projects: [
              project(
                "Mythic",
                { start: "2024", end: "2024" },
                { rarity: "mythic" },
              ),
              {
                ...project("None", { start: "2024", end: "2024" }),
                rarity: undefined,
              },
              ...[0, 1.5, -1].map((featured) =>
                project(
                  "Bad place",
                  { start: "2024", end: "2024" },
                  { featured },
                ),
              ),
            ],
          }),
        ),
      ),
  );
});

describe("ContentCatalog.projectEntries", () => {
  it.effect(
    "lists slug, title and rarity in Period order without asking GitHub",
    () =>
      Effect.gen(function* () {
        const entries = yield* (yield* ContentCatalog).projectEntries;

        expect(entries).toEqual([
          { slug: "predi-gg", title: "Predi.GG", rarity: "epic" },
          {
            slug: "next-13-boilerplate",
            title: "Next 13 Boilerplate",
            rarity: "common",
          },
        ]);
      }).pipe(
        Effect.provide(
          // GitHub knows no repository: reading a star count would fail.
          catalogWith({
            projects: [
              openSource("Next 13 Boilerplate", "2023", NEXT_13),
              project(
                "Predi.GG",
                { start: "2025", end: "ongoing" },
                { rarity: "epic" },
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

  it.effect("keeps an Experience's emoji", () =>
    Effect.gen(function* () {
      const [favikon] = yield* (yield* ContentCatalog).experiences;

      expect(favikon.emoji).toBe("💜");
    }).pipe(
      Effect.provide(
        catalogWith({
          experiences: [
            experience(
              "Favikon",
              { start: "2023", end: "2025" },
              { emoji: "💜" },
            ),
          ],
        }),
      ),
    ),
  );

  it.effect("fails on an empty emoji or one longer than 8 characters", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).experiences);

      for (const at of [0, 1])
        expect(error.message).toContain(
          `content/experiences.json at [${at}].emoji: Expected an emoji (at most 8 characters)`,
        );
    }).pipe(
      Effect.provide(
        catalogWith({
          experiences: ["", "🔮🎤💜🤙🔥"].map((emoji) =>
            experience("Favikon", { start: "2023", end: "2025" }, { emoji }),
          ),
        }),
      ),
    ),
  );
});

const profileWith = (changes: object) => ({ ...testProfile, ...changes });

describe("ContentCatalog.profile", () => {
  it.effect(
    "returns the social links, YouTube channel, Discord account, Resumes and recruiter texts",
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
          summary: testProfile.summary,
          availability: testProfile.availability,
          languages: testProfile.languages,
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

const achievement = (rest: object = {}) => ({
  name: text("MasterDevFrance 2025", "MasterDevFrance 2025"),
  description: text("national winner", "vainqueur national"),
  year: 2025,
  rarity: "legendary",
  link: "/mdf-2025",
  art: "/images/chibi/trophy.webp",
  ...rest,
});

describe("ContentCatalog.achievements", () => {
  it.effect("returns the Achievements in stored order", () =>
    Effect.gen(function* () {
      const achievements = yield* (yield* ContentCatalog).achievements;

      expect(achievements.map((a) => [a.year, a.link])).toEqual([
        [2023, "https://hackathon.example"],
        [2025, "/mdf-2025"],
        [2024, "/"],
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          achievements: [
            achievement({ year: 2023, link: "https://hackathon.example" }),
            achievement(),
            achievement({ year: 2024, link: "/" }),
          ],
        }),
      ),
    ),
  );

  it.effect(
    "fails on a year outside 2000 to 2100, an unknown Rarity or a link that is neither a page nor a URL",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).achievements);

        expect(error._tag).toBe("ContentInvalid");
        for (const at of [0, 1, 2])
          expect(error.message).toContain(
            `content/achievements.json at [${at}].year: Expected a year from 2000 to 2100`,
          );
        expect(error.message).toContain(
          "content/achievements.json at [3].rarity",
        );
        for (const at of [4, 5, 6])
          expect(error.message).toContain(
            `content/achievements.json at [${at}].link: Expected a page of the site (/…) or an http(s) URL`,
          );
        expect(error.message).toContain(
          "content/achievements.json at [7].name.fr: Missing translation",
        );
      }).pipe(
        Effect.provide(
          catalogWith({
            achievements: [
              achievement({ year: 1999 }),
              achievement({ year: 2101 }),
              achievement({ year: 2025.5 }),
              achievement({ rarity: "mythic" }),
              achievement({ link: "mdf-2025" }),
              achievement({ link: "/MDF 2025" }),
              achievement({ link: "/mdf-2025/" }),
              achievement({ name: { en: "MasterDevFrance 2025" } }),
            ],
          }),
        ),
      ),
  );
});

describe("ContentCatalog.hobbies", () => {
  it.effect("returns the Hobbies in stored order", () =>
    Effect.gen(function* () {
      const hobbies = yield* (yield* ContentCatalog).hobbies;

      expect(hobbies).toEqual([
        { label: text("music on", "de la musique"), pose: "music" },
        { label: text("surf", "surf"), pose: "surf" },
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          hobbies: [
            { label: text("music on", "de la musique"), pose: "music" },
            { label: text("surf", "surf"), pose: "surf" },
          ],
        }),
      ),
    ),
  );

  it.effect("fails on an unknown pose or a missing translation", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).hobbies);

      expect(error.message).toContain("content/hobbies.json at [0].pose");
      expect(error.message).toContain(
        "content/hobbies.json at [1].label.en: Missing translation",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          hobbies: [
            { label: text("chess", "échecs"), pose: "chess" },
            { label: text("", "surf"), pose: "surf" },
          ],
        }),
      ),
    ),
  );
});

describe("ContentCatalog.patchNotes", () => {
  const patch = (version: string, extra: object = {}) => ({
    version,
    date: "2026-10-21",
    title: text(`patch ${version}`, `patch ${version}`),
    entries: [{ tag: "new", text: text("a thing", "un truc") }],
    ...extra,
  });

  it.effect("returns the Patches by version, newest first, numerically", () =>
    Effect.gen(function* () {
      const patchNotes = yield* (yield* ContentCatalog).patchNotes;

      expect(patchNotes.map((p) => p.version)).toEqual([
        "2.10",
        "2.9",
        "2.4.1",
        "2.4",
        "1.0",
      ]);
      expect(patchNotes[0]).toEqual(
        patch("2.10", { link: "https://github.com/o/r/pull/43" }),
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          patchNotes: [
            patch("1.0"),
            patch("2.4"),
            patch("2.9"),
            patch("2.10", { link: "https://github.com/o/r/pull/43" }),
            patch("2.4.1"),
          ],
        }),
      ),
    ),
  );

  it.effect(
    "fails on a bad version, date, tag or link, no lines, or a missing translation",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).patchNotes);
        const at = (location: string) =>
          `content/patch-notes.json at ${location}`;

        expect(error.message).toContain(
          `${at("[0].version")}: Expected a version (e.g. 2.4 or 2.4.1)`,
        );
        expect(error.message).toContain(
          `${at("[1].date")}: Expected a date (YYYY-MM-DD)`,
        );
        expect(error.message).toContain(at("[2].entries[0].tag"));
        expect(error.message).toContain(
          `${at("[3].entries")}: Expected at least one line`,
        );
        expect(error.message).toContain(
          `${at("[4].entries[0].text.fr")}: Missing translation`,
        );
        expect(error.message).toContain(
          `${at("[5].link")}: Expected an http(s) URL`,
        );
      }).pipe(
        Effect.provide(
          catalogWith({
            patchNotes: [
              patch("v2"),
              patch("2.1", { date: "2026-13-01" }),
              patch("2.2", {
                entries: [{ tag: "nerfed", text: text("a", "b") }],
              }),
              patch("2.3", { entries: [] }),
              patch("2.4", {
                entries: [{ tag: "fixed", text: text("a bug", "") }],
              }),
              patch("2.5", { link: "github.com/o/r/pull/1" }),
            ],
          }),
        ),
      ),
  );

  it.effect("fails on a version two Patches share", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).patchNotes);

      expect(error.message).toContain(
        "content/patch-notes.json at [2].version: Patch version used more than once: 2.4",
      );
    }).pipe(
      Effect.provide(
        catalogWith({
          patchNotes: [patch("2.4"), patch("2.5"), patch("2.4")],
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

  it.effect(
    "accept Achievement art where the Admin stores it, or a chibi pose",
    () =>
      Effect.gen(function* () {
        const achievements = yield* (yield* ContentCatalog).achievements;

        expect(achievements.map((a) => a.art)).toEqual([
          "/images/achievements/hackathon-0a1b2c3d.avif",
          "/images/achievements/mdf.jpg",
          "/images/chibi/trophy.webp",
          "/images/chibi/surf.png",
        ]);
      }).pipe(
        Effect.provide(
          catalogWith({
            achievements: [
              "/images/achievements/hackathon-0a1b2c3d.avif",
              "/images/achievements/mdf.jpg",
              "/images/chibi/trophy.webp",
              "/images/chibi/surf.png",
            ].map((art) => achievement({ art })),
          }),
        ),
      ),
  );

  it.effect(
    "refuse Achievement art outside its folders, traversing, or not an image of its folder",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).achievements);

        expect(error._tag).toBe("ContentInvalid");
        for (const at of [0, 1, 2, 3, 4, 5])
          expect(error.message).toContain(
            `content/achievements.json at [${at}].art: Expected an image (PNG, JPEG, WebP or AVIF) in /images/achievements/, or a WebP or PNG in /images/chibi/`,
          );
      }).pipe(
        Effect.provide(
          catalogWith({
            achievements: [
              "/images/achievements/../../../package.json",
              "/images/chibi/../projects/predi.png",
              "/images/projects/predi.png",
              "/images/chibi/trophy.avif",
              "/images/achievements/nested/mdf.png",
              "/images/achievements/logo.svg",
            ].map((art) => achievement({ art })),
          }),
        ),
      ),
  );
});
