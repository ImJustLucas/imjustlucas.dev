import { Effect, Layer, ManagedRuntime } from "effect";

import { ContentCatalog } from "./catalog";
import { layerLocalFilesystem } from "./repository-local-filesystem";

import "server-only";

/**
 * Entry point for pages (server components). Runs the content catalog over
 * the local content folder and returns plain data, so React code never
 * imports Effect (ADR-0002). A rejection fails the build.
 */
const runtime = ManagedRuntime.make(
  ContentCatalog.layer.pipe(Layer.provide(layerLocalFilesystem(process.cwd()))),
);

const fromCatalog = <A, E>(
  select: (catalog: ContentCatalog["Service"]) => Effect.Effect<A, E>,
) =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* select(yield* ContentCatalog);
    }),
  );

export const getTechCategories = () =>
  fromCatalog((catalog) => catalog.techCategories);

export const getProjects = () => fromCatalog((catalog) => catalog.projects);
