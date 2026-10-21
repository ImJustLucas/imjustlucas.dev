import { Effect } from "effect";

import type {
  Board,
  LeaderboardGame,
  StartedRun,
  SubmittedRun,
} from "@/lib/arcade/board";
import {
  leaderboard,
  removeEntry,
  Scores,
  ScoresUnavailable,
  startRun,
  submitRun,
} from "@/lib/arcade/leaderboard";
import { layerUpstash } from "@/lib/arcade/leaderboard-upstash";

import "server-only";

/**
 * Entry point for the Arcade's Server Actions and the Admin, and the only
 * place the leaderboards' Effect code runs: against Upstash. It returns plain
 * data (ADR-0002); when Upstash cannot be reached, the game still plays and
 * the board says it is resting.
 */
const run = <A, B>(
  effect: Effect.Effect<A, ScoresUnavailable, Scores>,
  unavailable: B,
): Promise<A | B> =>
  Effect.runPromise(
    effect.pipe(
      Effect.provide(layerUpstash),
      Effect.catchTag("ScoresUnavailable", (error) =>
        Effect.sync(() => {
          console.error("Arcade leaderboard unavailable:", error.message);
          return unavailable;
        }),
      ),
    ),
  );

export type ArcadeUnavailable = { readonly kind: "unavailable" };
const UNAVAILABLE: ArcadeUnavailable = { kind: "unavailable" };

/** Hands out a run of `game` to the visitor at `client` (an IP address). */
export const startArcadeRun = (
  game: LeaderboardGame,
  client: string,
): Promise<StartedRun | ArcadeUnavailable> =>
  run(startRun(game, client), UNAVAILABLE);

/** Takes a run's result, sent by the visitor at `client`. */
export const submitArcadeRun = (
  input: unknown,
  client: string,
): Promise<SubmittedRun | ArcadeUnavailable> =>
  run(submitRun(input, client), UNAVAILABLE);

/** A game's leaderboard, best first. */
export const getArcadeBoard = (game: LeaderboardGame): Promise<Board> =>
  run(
    Effect.map(leaderboard(game), (top): Board => ({ kind: "board", top })),
    UNAVAILABLE,
  );

/** Takes a player off a game's leaderboard; the caller checks the Owner. */
export const removeArcadeEntry = (
  game: LeaderboardGame,
  playerId: string,
): Promise<{ readonly kind: "removed" } | ArcadeUnavailable> =>
  run(
    Effect.as(removeEntry(game, playerId), { kind: "removed" } as const),
    UNAVAILABLE,
  );
