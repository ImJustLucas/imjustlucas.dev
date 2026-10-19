import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { layerInMemory } from "./repository-in-memory";

import { describe, expect, it } from "@effect/vitest";

const typescript = { id: "typescript", name: "TypeScript", color: "#3b82f6" };
const react = { id: "react", name: "React", color: "#60a5fa" };
const docker = { id: "docker", name: "Docker", color: "#3b82f6" };

const text = (en: string, fr: string) => ({ en, fr });

const catalogWith = (documents: {
  techs?: unknown;
  techCategories?: unknown;
  projects?: unknown;
}) =>
  ContentCatalog.layer.pipe(
    Layer.provide(
      layerInMemory({
        "content/techs.json": JSON.stringify(documents.techs ?? []),
        "content/tech-categories.json": JSON.stringify(
          documents.techCategories ?? [],
        ),
        "content/projects.json": JSON.stringify(documents.projects ?? []),
      }),
    ),
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
            }),
          ),
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

  it.effect("links the repository of open-source Projects only", () =>
    Effect.gen(function* () {
      const projects = yield* (yield* ContentCatalog).projects;

      expect(projects.map((p) => [p.title, p.repository])).toEqual([
        ["Open", "https://github.com/ImJustLucas/open"],
        ["Closed", undefined],
        ["Open, no repository", undefined],
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
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
        }),
      ),
    ),
  );

  it.effect("omits a zero star count", () =>
    Effect.gen(function* () {
      const projects = yield* (yield* ContentCatalog).projects;

      expect(projects.map((p) => [p.title, p.stars])).toEqual([
        ["Starred", 16],
        ["Unstarred", undefined],
      ]);
    }).pipe(
      Effect.provide(
        catalogWith({
          projects: [
            project(
              "Starred",
              { start: "2024", end: "2024" },
              {
                openSource: true,
                repository: "https://github.com/ImJustLucas/starred",
                stars: 16,
              },
            ),
            project(
              "Unstarred",
              { start: "2023", end: "2023" },
              {
                openSource: true,
                repository: "https://github.com/ImJustLucas/unstarred",
                stars: 0,
              },
            ),
          ],
        }),
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
