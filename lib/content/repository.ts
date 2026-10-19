import { Context, Effect } from "effect";

import type {
  ContentConflict,
  ContentNotFound,
  ContentRepositoryError,
} from "./errors";

/**
 * A point in the content repository's history. For the GitHub adapter it is
 * the commit sha of `main`; adapters without history use a constant.
 */
export type Revision = string;

/** One file changed by a commit. `content: null` deletes the file. */
export type ContentChange = {
  /** Repository-relative path, e.g. `content/techs.json` or `public/cv.pdf`. */
  readonly path: string;
  readonly content: string | Uint8Array | null;
};

/** One save: every change lands in a single commit, or none does. */
export type ContentCommit = {
  /** The revision the changes were based on (the one that was read). */
  readonly revision: Revision;
  readonly message: string;
  readonly changes: ReadonlyArray<ContentChange>;
};

/**
 * The one seam under content: reads and writes content documents and assets.
 * Adapters: local filesystem (build time), in memory (tests), GitHub (Admin).
 */
export class ContentRepository extends Context.Service<
  ContentRepository,
  {
    /** The revision the repository is currently at. */
    readonly head: Effect.Effect<Revision, ContentRepositoryError>;
    /** The text of the file at `path`, at the current revision. */
    readonly read: (
      path: string,
    ) => Effect.Effect<string, ContentNotFound | ContentRepositoryError>;
    /**
     * Applies the changes as one commit and returns the new revision. Fails
     * with `ContentConflict`, committing nothing, when the repository moved
     * since `commit.revision`.
     */
    readonly commit: (
      commit: ContentCommit,
    ) => Effect.Effect<Revision, ContentConflict | ContentRepositoryError>;
  }
>()("content/ContentRepository") {}
