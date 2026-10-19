import { Effect, Layer } from "effect";

import { ContentCatalog } from "./catalog";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const repositoryRoot = new URL("../..", import.meta.url).pathname;

describe("the content folder", () => {
  it.effect("is valid content", () =>
    Effect.gen(function* () {
      const categories = yield* (yield* ContentCatalog).techCategories;

      expect(categories.length).toBeGreaterThan(0);
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
