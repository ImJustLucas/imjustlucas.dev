import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const repositoryRoot = new URL("../..", import.meta.url).pathname;

describe("the content folder", () => {
  it.effect("is valid content", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;
      const categories = yield* catalog.techCategories;
      const projects = yield* catalog.projects;
      const experiences = yield* catalog.experiences;

      expect(categories.length).toBeGreaterThan(0);
      expect(projects.length).toBeGreaterThan(0);
      expect(experiences.length).toBeGreaterThan(0);
    }).pipe(
      Effect.provide(
        ContentCatalog.layer.pipe(
          Layer.provide(layerLocalFilesystem(repositoryRoot)),
          Layer.provide(YouTubeChannel.layerTest({})),
        ),
      ),
    ),
  );
});
