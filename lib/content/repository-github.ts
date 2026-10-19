import { Effect, Layer } from "effect";

import {
  ContentConflict,
  ContentNotFound,
  ContentRepositoryError,
} from "./errors";
import { type ContentChange, ContentRepository } from "./repository";

export type GitHubRepositoryOptions = {
  readonly owner: string;
  readonly repo: string;
  /** The branch saves are committed to (`main`). */
  readonly branch: string;
  /** The Owner's GitHub token: commits are authored by him. */
  readonly token: string;
  /** Defaults to the global `fetch`; tests pass a fake GitHub. */
  readonly fetch?: typeof globalThis.fetch;
};

type GitHubResponse = { readonly status: number; readonly response: Response };

/**
 * Content repository over the GitHub REST API, used by the Admin. The
 * revision is the commit sha of the branch. A commit goes through the Git
 * Data API (blobs, one tree, one commit, then a fast-forward of the branch),
 * so a save of several files, text or binary, is a single commit; the branch
 * only moves if it still points at the revision the save was based on.
 */
export const makeGitHubRepository = (
  options: GitHubRepositoryOptions,
): ContentRepository["Service"] => {
  const fetch = options.fetch ?? globalThis.fetch;
  const base = `https://api.github.com/repos/${options.owner}/${options.repo}`;
  const branchRef = `heads/${options.branch}`;

  const request = (
    method: string,
    path: string,
    body?: unknown,
    accept = "application/vnd.github+json",
  ): Effect.Effect<GitHubResponse, ContentRepositoryError> =>
    Effect.tryPromise({
      try: async (signal) => {
        const response = await fetch(`${base}${path}`, {
          method,
          signal,
          cache: "no-store",
          headers: {
            accept,
            authorization: `Bearer ${options.token}`,
            "x-github-api-version": "2022-11-28",
            "user-agent": "imjustlucas.dev-admin",
            ...(body === undefined
              ? {}
              : { "content-type": "application/json" }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        return { status: response.status, response };
      },
      catch: (cause) =>
        new ContentRepositoryError({
          message: `GitHub could not be reached (${method} ${path})`,
          cause,
        }),
    });

  /** Fails unless GitHub answered with a 2xx status, then reads the JSON. */
  const ok =
    <A>(
      method: string,
      path: string,
    ): ((r: GitHubResponse) => Effect.Effect<A, ContentRepositoryError>) =>
    (r) =>
      r.status >= 200 && r.status < 300
        ? Effect.tryPromise({
            try: () => r.response.json() as Promise<A>,
            catch: (cause) =>
              new ContentRepositoryError({
                message: `GitHub sent an unreadable answer (${method} ${path})`,
                cause,
              }),
          })
        : refused(method, path, r);

  const refused = (method: string, path: string, r: GitHubResponse) =>
    Effect.flatMap(
      Effect.promise(() =>
        r.response
          .json()
          .then((body: { message?: string }) => body?.message)
          .catch(() => undefined),
      ),
      (detail) =>
        Effect.fail(
          new ContentRepositoryError({
            message: `GitHub refused ${method} ${path}: ${r.status}${detail ? ` ${detail}` : ""}`,
          }),
        ),
    );

  const call = <A>(method: string, path: string, body?: unknown) =>
    Effect.flatMap(request(method, path, body), ok<A>(method, path));

  const head = Effect.map(
    call<{ object: { sha: string } }>("GET", `/git/ref/${branchRef}`),
    (ref) => ref.object.sha,
  );

  const read = (path: string) =>
    Effect.flatMap(
      request(
        "GET",
        `/contents/${encodePath(path)}?ref=${encodeURIComponent(options.branch)}`,
        undefined,
        "application/vnd.github.raw+json",
      ),
      (r): Effect.Effect<string, ContentNotFound | ContentRepositoryError> =>
        r.status === 404
          ? Effect.fail(new ContentNotFound({ path }))
          : r.status >= 200 && r.status < 300
            ? Effect.promise(() => r.response.text())
            : refused("GET", `/contents/${path}`, r),
    );

  const blob = (change: ContentChange & { content: string | Uint8Array }) =>
    Effect.map(
      call<{ sha: string }>(
        "POST",
        "/git/blobs",
        typeof change.content === "string"
          ? { content: change.content, encoding: "utf-8" }
          : {
              content: Buffer.from(change.content).toString("base64"),
              encoding: "base64",
            },
      ),
      (created) => created.sha,
    );

  return {
    head,
    read,
    commit: ({ revision, message, changes }) =>
      Effect.gen(function* () {
        // Fail fast, before writing any object, when main already moved.
        const before = yield* head;
        if (before !== revision)
          return yield* new ContentConflict({ revision, head: before });

        const base = yield* call<{ tree: { sha: string } }>(
          "GET",
          `/git/commits/${revision}`,
        );
        const entries = yield* Effect.forEach(
          changes,
          (change): Effect.Effect<TreeEntry, ContentRepositoryError> =>
            change.content === null
              ? Effect.succeed({ path: change.path, sha: null })
              : Effect.map(
                  blob({ path: change.path, content: change.content }),
                  (sha) => ({ path: change.path, sha }),
                ),
          { concurrency: 4 },
        );
        const tree = yield* call<{ sha: string }>("POST", "/git/trees", {
          base_tree: base.tree.sha,
          tree: entries.map((entry) => ({
            path: entry.path,
            mode: "100644",
            type: "blob",
            sha: entry.sha,
          })),
        });
        // No author: GitHub attributes the commit to the token's owner.
        const commit = yield* call<{ sha: string }>("POST", "/git/commits", {
          message,
          tree: tree.sha,
          parents: [revision],
        });

        // Fast-forward only: refused when main moved since `revision`, and
        // never retried, so nothing pushed from elsewhere is overwritten.
        const path = `/git/refs/${branchRef}`;
        const update = yield* request("PATCH", path, {
          sha: commit.sha,
          force: false,
        });
        if (update.status === 422 || update.status === 409) {
          const now = yield* head;
          return yield* new ContentConflict({ revision, head: now });
        }
        yield* ok<unknown>("PATCH", path)(update);
        return commit.sha;
      }),
  };
};

type TreeEntry = { readonly path: string; readonly sha: string | null };

/** Each path segment URL-encoded, the slashes kept. */
const encodePath = (path: string) =>
  path.split("/").map(encodeURIComponent).join("/");

export const layerGitHub = (options: GitHubRepositoryOptions) =>
  Layer.succeed(ContentRepository, makeGitHubRepository(options));
