import { Effect, Layer, Ref } from "effect";

import { ContentConflict, ContentNotFound } from "./errors";
import { type ContentCommit, ContentRepository } from "./repository";

type State = {
  readonly head: number;
  readonly files: ReadonlyMap<string, string | Uint8Array>;
  readonly commits: ReadonlyArray<ContentCommit>;
};

const revisionOf = (head: number) => `memory-${head}`;

/**
 * In-memory content repository, for tests. Starts at revision `memory-0`
 * with the given files; each commit moves it to the next revision. Besides
 * the `ContentRepository` interface it lists the commits applied so far.
 */
export const makeInMemoryRepository = (
  files: Readonly<Record<string, string | Uint8Array>>,
) =>
  Effect.gen(function* () {
    const state = yield* Ref.make<State>({
      head: 0,
      files: new Map(Object.entries(files)),
      commits: [],
    });

    const repository: ContentRepository["Service"] = {
      head: Effect.map(Ref.get(state), (s) => revisionOf(s.head)),

      read: (path: string) =>
        Effect.flatMap(Ref.get(state), (s) => {
          const file = s.files.get(path);
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
              const next = new Map(s.files);
              for (const change of commit.changes) {
                if (change.content === null) next.delete(change.path);
                else next.set(change.path, change.content);
              }
              return [
                Effect.succeed(revisionOf(s.head + 1)),
                {
                  head: s.head + 1,
                  files: next,
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
