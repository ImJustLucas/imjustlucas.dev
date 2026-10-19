import { Effect, Layer, Ref } from "effect";

import {
  ContentConflict,
  ContentNotFound,
  ContentRepositoryError,
} from "./errors";
import { type ContentCommit, ContentRepository } from "./repository";

type Files = ReadonlyMap<string, string | Uint8Array>;

type State = {
  readonly head: number;
  /** The files at every revision so far: `history[n]` is `memory-n`. */
  readonly history: ReadonlyArray<Files>;
  readonly commits: ReadonlyArray<ContentCommit>;
};

const revisionOf = (head: number) => `memory-${head}`;

/**
 * In-memory content repository, for tests. Starts at revision `memory-0`
 * with the given files; each commit moves it to the next revision, and every
 * earlier revision stays readable. Besides the `ContentRepository` interface
 * it lists the commits applied so far.
 */
export const makeInMemoryRepository = (
  files: Readonly<Record<string, string | Uint8Array>>,
) =>
  Effect.gen(function* () {
    const state = yield* Ref.make<State>({
      head: 0,
      history: [new Map(Object.entries(files))],
      commits: [],
    });

    const repository: ContentRepository["Service"] = {
      head: Effect.map(Ref.get(state), (s) => revisionOf(s.head)),

      read: (path, revision) =>
        Effect.flatMap(Ref.get(state), (s) => {
          const at = s.history.findIndex(
            (_, n) => revisionOf(n) === (revision ?? revisionOf(s.head)),
          );
          if (at < 0)
            return Effect.fail(
              new ContentRepositoryError({
                message: `Unknown revision: ${revision}`,
              }),
            );
          const file = s.history[at].get(path);
          if (file === undefined)
            return Effect.fail(new ContentNotFound({ path }));
          return Effect.succeed(
            typeof file === "string" ? file : new TextDecoder().decode(file),
          );
        }),

      commit: (commit) =>
        Effect.flatten(
          Ref.modify(
            state,
            (s): readonly [Effect.Effect<string, ContentConflict>, State] => {
              const head = revisionOf(s.head);
              if (commit.revision !== head)
                return [
                  Effect.fail(
                    new ContentConflict({ revision: commit.revision, head }),
                  ),
                  s,
                ];
              const next = new Map(s.history[s.head]);
              for (const change of commit.changes) {
                if (change.content === null) next.delete(change.path);
                else next.set(change.path, change.content);
              }
              return [
                Effect.succeed(revisionOf(s.head + 1)),
                {
                  head: s.head + 1,
                  history: [...s.history, next],
                  commits: [...s.commits, commit],
                },
              ];
            },
          ),
        ),
    };

    return {
      repository,
      /** Every commit applied, oldest first. */
      commits: Effect.map(Ref.get(state), (s) => s.commits),
    };
  });

/**
 * The in-memory content repository as a layer. Build it per test: its state
 * is not shared between layer instances.
 */
export const layerInMemory = (
  files: Readonly<Record<string, string | Uint8Array>>,
) =>
  Layer.effect(
    ContentRepository,
    Effect.map(makeInMemoryRepository(files), (memory) => memory.repository),
  );
