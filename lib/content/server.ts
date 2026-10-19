import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { Effect, Layer, ManagedRuntime } from "effect";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubStars } from "./github-stars";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import "server-only";

/**
 * Entry point for pages (server components). Runs the content catalog over
 * the local content folder and the external sources (GitHub stars, YouTube
 * channel feed), and returns plain data, so React code never imports Effect
 * (ADR-0002). A rejection fails the build, or, when a page revalidates, keeps
 * the previous page being served.
 *
 * The content folder is read from `process.cwd()` at runtime too: pages that
 * revalidate need it traced into their function (`outputFileTracingIncludes`
 * in `next.config.ts`).
 */
const runtime = ManagedRuntime.make(
  ContentCatalog.layer.pipe(
    Layer.provide(layerLocalFilesystem(process.cwd())),
    Layer.provide(GitHubStars.layer),
    Layer.provide(YouTubeChannel.layer),
  ),
);

/**
 * `next build` is prerendering: a cold build, with no previous page to keep.
 * Anything else (a runtime revalidation, `next dev`) is a revalidation.
 */
const pageGeneration = (): PageGeneration =>
  process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
    ? "cold-build"
    : "revalidation";

const fromCatalog = <A, E>(
  select: (catalog: ContentCatalog["Service"]) => Effect.Effect<A, E>,
) =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* select(yield* ContentCatalog);
    }).pipe(Effect.provideService(PageGeneration, pageGeneration())),
  );

export const getTechCategories = () =>
  fromCatalog((catalog) => catalog.techCategories);

/**
 * With live star counts, omitted on a cold build when GitHub fails. The page
 * declares `dynamic = "force-static"` and `revalidate = 86400` (see
 * `fetchExternalText`).
 */
export const getProjects = () => fromCatalog((catalog) => catalog.projects);

export const getExperiences = () =>
  fromCatalog((catalog) => catalog.experiences);

/**
 * The channel's latest Videos, most recent first; none (the page's empty
 * state) when the channel cannot be read on a cold build. The page declares
 * `dynamic = "force-static"` and `revalidate = 86400`.
 */
export const getVideos = () => fromCatalog((catalog) => catalog.videos);
