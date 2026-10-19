import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { layerInMemory } from "./repository-in-memory";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const typescript = { id: "typescript", name: "TypeScript", color: "#3b82f6" };
const react = { id: "react", name: "React", color: "#60a5fa" };
const docker = { id: "docker", name: "Docker", color: "#3b82f6" };

const text = (en: string, fr: string) => ({ en, fr });

const catalogWith = (documents: {
  techs?: unknown;
  techCategories?: unknown;
}) =>
  ContentCatalog.layer.pipe(
    Layer.provide(
      layerInMemory({
        "content/techs.json": JSON.stringify(documents.techs ?? []),
        "content/tech-categories.json": JSON.stringify(
          documents.techCategories ?? [],
        ),
      }),
    ),
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
            }),
          ),
          Layer.provide(YouTubeChannel.layerTest({})),
        ),
      ),
    ),
  );
});
