import type { CafeAction } from "@/lib/arcade/cafe";
import type { Move } from "@/lib/arcade/merge";

/**
 * The Arcade's leaderboards as plain data: what the server returns and the
 * cabinet shows. No Effect (ADR-0002), so client components can import it;
 * the rules are in `leaderboard.ts`.
 */

/** The games with a leaderboard. */
export const LEADERBOARD_GAMES = ["ollie", "surf", "cafe", "merge"] as const;
export type LeaderboardGame = (typeof LEADERBOARD_GAMES)[number];

export const isLeaderboardGame = (game: string): game is LeaderboardGame =>
  (LEADERBOARD_GAMES as ReadonlyArray<string>).includes(game);

/**
 * Which way a game's scores go: points, the highest best, or a time, the
 * lowest best (Café's clear time, in hundredths). The store, the board and
 * the visitor's own best all follow it.
 */
export type ScoreOrder = "highest" | "lowest";
export const SCORE_ORDER: { readonly [G in LeaderboardGame]: ScoreOrder } = {
  ollie: "highest",
  surf: "highest",
  cafe: "lowest",
  merge: "highest",
};

/** Whether `score` beats `than` in a game going `order`. */
export const beats = (order: ScoreOrder, score: number, than: number) =>
  order === "lowest" ? score < than : score > than;

/** A time in hundredths as the Arcade shows it: `1:07.42`. */
export const formatTime = (hundredths: number) => {
  const whole = Math.max(0, Math.round(hundredths));
  const minutes = Math.floor(whole / 6000);
  const seconds = String(Math.floor(whole / 100) % 60).padStart(2, "0");
  return `${minutes}:${seconds}.${String(whole % 100).padStart(2, "0")}`;
};

/** A score as the Arcade shows it: five digits, or a time. */
export const formatScore = (game: LeaderboardGame, score: number) =>
  SCORE_ORDER[game] === "lowest"
    ? formatTime(score)
    : String(score).padStart(5, "0");

/**
 * What a run sends back: a press or release at the step it landed on
 * (Ollie, Surf), an action on a cell (Café), or a move (Merge).
 */
export type PressInput = { readonly step: number; readonly press: boolean };
export type CellInput = {
  readonly step: number;
  readonly cell: number;
  readonly action: CafeAction;
};
export type MoveInput = { readonly step: number; readonly move: Move };
export type RunInput = PressInput | CellInput | MoveInput;

/** How many players a leaderboard shows. */
export const LEADERBOARD_SIZE = 10;

export type LeaderboardEntry = {
  readonly playerId: string;
  readonly name: string;
  readonly score: number;
};

export type StartedRun =
  | { readonly kind: "started"; readonly runId: string; readonly seed: number }
  | { readonly kind: "limited" };

export type SubmittedRun =
  /** Kept: the player's place on the board, from 1, and the board. */
  | {
      readonly kind: "ranked";
      readonly score: number;
      readonly rank: number;
      readonly top: ReadonlyArray<LeaderboardEntry>;
    }
  /** A fair run, not good enough for the board (or not their best). */
  | {
      readonly kind: "unranked";
      readonly score: number;
      readonly top: ReadonlyArray<LeaderboardEntry>;
    }
  /** The name cannot stand on the board; nothing kept. */
  | { readonly kind: "bad-name" }
  /** The run is unknown, already sent or expired; nothing kept. */
  | { readonly kind: "expired" }
  /** The presses do not make a run that could have been played; nothing kept. */
  | { readonly kind: "refused" }
  | { readonly kind: "limited" };

/** A leaderboard as the cabinet reads it. */
export type Board =
  | { readonly kind: "board"; readonly top: ReadonlyArray<LeaderboardEntry> }
  | { readonly kind: "unavailable" };

/**
 * Whether a run would stand on the board: it is the player's best and it
 * beats the last of the ten (or the board has room). A score of 0 never
 * stands (no point, or a table not cleared). The cabinet asks for a first
 * name only then; the server decides for itself.
 */
export const wouldRank = (
  top: ReadonlyArray<LeaderboardEntry>,
  playerId: string | null,
  points: number,
  order: ScoreOrder = "highest",
) => {
  if (points <= 0) return false;
  const own = top.find((entry) => entry.playerId === playerId);
  if (own) return beats(order, points, own.score);
  return (
    top.length < LEADERBOARD_SIZE ||
    beats(order, points, top[top.length - 1].score)
  );
};
