/**
 * The Arcade's leaderboards as plain data: what the server returns and the
 * cabinet shows. No Effect (ADR-0002), so client components can import it;
 * the rules are in `leaderboard.ts`.
 */

/** The games with a leaderboard. */
export const LEADERBOARD_GAMES = ["ollie"] as const;
export type LeaderboardGame = (typeof LEADERBOARD_GAMES)[number];

export const isLeaderboardGame = (game: string): game is LeaderboardGame =>
  (LEADERBOARD_GAMES as ReadonlyArray<string>).includes(game);

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
 * beats the last of the ten (or the board has room). The cabinet asks for a
 * first name only then; the server decides for itself.
 */
export const wouldRank = (
  top: ReadonlyArray<LeaderboardEntry>,
  playerId: string | null,
  points: number,
) => {
  if (points <= 0) return false;
  const own = top.find((entry) => entry.playerId === playerId);
  if (own) return points > own.score;
  return top.length < LEADERBOARD_SIZE || points > top[top.length - 1].score;
};
