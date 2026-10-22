import { Effect, Layer } from "effect";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubContributions } from "./github-contributions";
import { GitHubStars } from "./github-stars";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const repositoryRoot = new URL("../..", import.meta.url).pathname;

const catalog = ContentCatalog.layer.pipe(
  Layer.provide(layerLocalFilesystem(repositoryRoot)),
  Layer.provide(GitHubStars.layerTest({})),
  Layer.provide(GitHubContributions.layerTest({})),
  Layer.provide(YouTubeChannel.layerTest({})),
);

describe("the content folder", () => {
  it.effect("is valid content", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog;
      const projects = yield* catalog.projects;
      const experiences = yield* catalog.experiences;

      expect(projects.length).toBeGreaterThan(0);
      expect(experiences.length).toBeGreaterThan(0);
    }).pipe(
      // Offline: no star count is known, as on a cold build without GitHub.
      Effect.provideService(PageGeneration, "cold-build"),
      Effect.provide(catalog),
    ),
  );

  it.effect("has every Locale's Resume in the public assets folder", () =>
    Effect.gen(function* () {
      const { resumes } = yield* (yield* ContentCatalog).profile;

      for (const resume of Object.values(resumes)) {
        expect(
          existsSync(join(repositoryRoot, "public", resume.asset)),
          resume.asset,
        ).toBe(true);
      }
    }).pipe(Effect.provide(catalog)),
  );

  it.effect("has every Achievement's art in the public assets folder", () =>
    Effect.gen(function* () {
      const achievements = yield* (yield* ContentCatalog).achievements;

      for (const achievement of achievements) {
        expect(
          existsSync(join(repositoryRoot, "public", achievement.art)),
          achievement.art,
        ).toBe(true);
      }
    }).pipe(Effect.provide(catalog)),
  );
});
