import { Effect } from "effect";

import { ContentRepository } from "./repository";
import { layerInMemory } from "./repository-in-memory";

import { describe, expect, it } from "@effect/vitest";

const seeded = layerInMemory({
  "content/techs.json": "[]",
  "public/old.png": "old",
});

describe("in-memory ContentRepository", () => {
  it.effect("applies a commit based on the head and moves the head", () =>
    Effect.gen(function* () {
      const repository = yield* ContentRepository;
      const revision = yield* repository.head;

      const next = yield* repository.commit({
        revision,
        message: "Update Techs",
        changes: [
          { path: "content/techs.json", content: "[1]" },
          { path: "public/old.png", content: null },
        ],
      });

      expect(next).not.toBe(revision);
      expect(yield* repository.head).toBe(next);
      expect(yield* repository.read("content/techs.json")).toBe("[1]");
      const deleted = yield* Effect.flip(repository.read("public/old.png"));
      expect(deleted._tag).toBe("ContentNotFound");
    }).pipe(Effect.provide(seeded)),
  );

  it.effect("refuses a commit on a stale revision and changes nothing", () =>
    Effect.gen(function* () {
      const repository = yield* ContentRepository;
      const stale = yield* repository.head;
      yield* repository.commit({
        revision: stale,
        message: "Pushed from elsewhere",
        changes: [{ path: "content/techs.json", content: "[1]" }],
      });
      const head = yield* repository.head;

      const error = yield* Effect.flip(
        repository.commit({
          revision: stale,
          message: "Admin save",
          changes: [{ path: "content/techs.json", content: "[2]" }],
        }),
      );

      expect(error._tag).toBe("ContentConflict");
      expect(yield* repository.head).toBe(head);
      expect(yield* repository.read("content/techs.json")).toBe("[1]");
    }).pipe(Effect.provide(seeded)),
  );
});
