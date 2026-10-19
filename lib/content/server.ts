import { Effect, Layer, ManagedRuntime } from "effect";

import { ContentCatalog } from "./catalog";
import { PageGeneration, pageGenerationOf } from "./external-source";
import { GitHubStars } from "./github-stars";
import { layerLocalFilesystem } from "./repository-local-filesystem";

import "server-only";

/**
 * Entry point for pages (server components). Runs the content catalog over
 * the local content folder and the live external sources, and returns plain
 * data, so React code never imports Effect (ADR-0002). A rejection fails the
 * build, or during revalidation keeps the previously generated page.
 *
 * The content folder is read from `process.cwd()` at runtime too: pages that
 * revalidate need it traced into their function (`outputFileTracingIncludes`
 * in `next.config.ts`).
 */
const runtime = ManagedRuntime.make(
  ContentCatalog.layer.pipe(
    Layer.provide(
      Layer.merge(layerLocalFilesystem(process.cwd()), GitHubStars.layer),
    ),
  ),
);

const fromCatalog = <A, E>(
  select: (catalog: ContentCatalog["Service"]) => Effect.Effect<A, E>,
) =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* select(yield* ContentCatalog);
    }).pipe(
      Effect.provideService(PageGeneration, pageGenerationOf(process.env)),
    ),
  );

export const getTechCategories = () =>
  fromCatalog((catalog) => catalog.techCategories);

/**
 * With live star counts: the page declares `dynamic = "force-static"` and
 * `revalidate = 86400` (see `fetchExternalText`).
 */
export const getProjects = () => fromCatalog((catalog) => catalog.projects);
