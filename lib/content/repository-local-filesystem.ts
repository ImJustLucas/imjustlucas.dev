import { Effect, Layer } from "effect";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ContentNotFound, ContentRepositoryError } from "./errors";
import { ContentRepository } from "./repository";

/** The working tree has no history: its revision never changes. */
const WORKING_TREE: string = "working-tree";

/**
 * Content repository over the files of a local checkout, rooted at `root`
 * (the repository root). Used at build time; read-only.
 */
export const layerLocalFilesystem = (root: string) =>
  Layer.succeed(ContentRepository, {
    head: Effect.succeed(WORKING_TREE),

    read: (path) =>
      Effect.tryPromise({
        try: () => readFile(join(root, path), "utf8"),
        catch: (cause) =>
          (cause as NodeJS.ErrnoException)?.code === "ENOENT"
            ? new ContentNotFound({ path })
            : new ContentRepositoryError({
                message: `Could not read ${path}`,
                cause,
              }),
      }),

    commit: () =>
      Effect.fail(
        new ContentRepositoryError({
          message: "The local filesystem content repository is read-only",
        }),
      ),
  });
