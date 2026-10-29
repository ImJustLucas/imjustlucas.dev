import { Effect, Layer, Ref } from "effect";

import {
  beats,
  type LeaderboardEntry,
  type LeaderboardGame,
  SCORE_ORDER,
} from "./board";
import { type OpenRun, Scores } from "./leaderboard";

type State = {
  readonly runs: ReadonlyMap<string, OpenRun>;
  readonly boards: ReadonlyMap<
    LeaderboardGame,
    ReadonlyMap<string, LeaderboardEntry>
  >;
  readonly uses: ReadonlyMap<string, number>;
};

/**
 * In-memory leaderboards, for tests. Rate limits count uses without ever
 * resetting their window.
 */
export const layerInMemory = () =>
  Layer.effect(
    Scores,
    Effect.map(
      Ref.make<State>({ runs: new Map(), boards: new Map(), uses: new Map() }),
      (state): Scores["Service"] => {
        const board = (s: State, game: LeaderboardGame) =>
          s.boards.get(game) ?? new Map<string, LeaderboardEntry>();
        const withBoard = (
          s: State,
          game: LeaderboardGame,
          next: ReadonlyMap<string, LeaderboardEntry>,
        ): State => ({ ...s, boards: new Map(s.boards).set(game, next) });

        return {
          openRun: (id, run) =>
            Ref.update(state, (s) => ({
              ...s,
              runs: new Map(s.runs).set(id, run),
            })),
          takeRun: (id) =>
            Ref.modify(state, (s) => {
              const runs = new Map(s.runs);
              const run = runs.get(id);
              runs.delete(id);
              return [run, { ...s, runs }] as const;
            }),
          top: (game, count) =>
            Effect.map(Ref.get(state), (s) =>
              [...board(s, game).values()]
                .sort((a, b) =>
                  SCORE_ORDER[game] === "lowest"
                    ? a.score - b.score
                    : b.score - a.score,
                )
                .slice(0, count),
            ),
          record: (game, entry) =>
            Ref.update(state, (s) => {
              const current = board(s, game).get(entry.playerId);
              const best =
                current && !beats(SCORE_ORDER[game], entry.score, current.score)
                  ? current.score
                  : entry.score;
              return withBoard(
                s,
                game,
                new Map(board(s, game)).set(entry.playerId, {
                  ...entry,
                  score: best,
                }),
              );
            }),
          remove: (game, playerId) =>
            Ref.update(state, (s) => {
              const next = new Map(board(s, game));
              next.delete(playerId);
              return withBoard(s, game, next);
            }),
          allow: (key, limit) =>
            Ref.modify(state, (s) => {
              const used = (s.uses.get(key) ?? 0) + 1;
              return [
                used <= limit.count,
                { ...s, uses: new Map(s.uses).set(key, used) },
              ] as const;
            }),
        };
      },
    ),
  );
