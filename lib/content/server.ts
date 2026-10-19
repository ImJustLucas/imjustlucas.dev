import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { Effect, Layer, ManagedRuntime } from "effect";

import { ContentCatalog } from "./catalog";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import "server-only";

/**
 * Entry point for pages (server components). Runs the content catalog over
 * the local content folder and the YouTube channel feed, and returns plain
 * data, so React code never imports Effect (ADR-0002). A rejection fails the
 * build, or, when a page revalidates, keeps the previous page being served.
 */
const runtime = ManagedRuntime.make(
  ContentCatalog.layer.pipe(
    Layer.provide(layerLocalFilesystem(process.cwd())),
    Layer.provide(YouTubeChannel.layer),
  ),
);

const fromCatalog = <A, E>(
  select: (catalog: ContentCatalog["Service"]) => Effect.Effect<A, E>,
) =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* select(yield* ContentCatalog);
    }),
  );

/** `next build` is prerendering, as opposed to a runtime revalidation. */
const isBuilding = () => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

export const getTechCategories = () =>
  fromCatalog((catalog) => catalog.techCategories);

export const getProjects = () => fromCatalog((catalog) => catalog.projects);

export const getExperiences = () =>
  fromCatalog((catalog) => catalog.experiences);

/** Lucas's public identity: social links, channel, Discord account, Resumes. */
export const getProfile = () => fromCatalog((catalog) => catalog.profile);

/**
 * The Profile's channel's latest Videos, most recent first. If the channel cannot be
 * read during a build there is no previous page to keep, so the page gets no
 * Videos (its empty state) instead of failing the build.
 */
export const getVideos = () =>
  fromCatalog((catalog) =>
    catalog.videos.pipe(
      Effect.catchTag("VideosUnavailable", (error) =>
        isBuilding()
          ? Effect.as(
              Effect.logWarning(`${error.message}; building without Videos`),
              [],
            )
          : Effect.fail(error),
      ),
    ),
  );
