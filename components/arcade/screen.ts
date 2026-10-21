import type { Player } from "@/components/arcade/use-player";
import type { Board, LeaderboardEntry } from "@/lib/arcade/board";

/** What the floor hands each cabinet's screen: its board and the player. */
export type ScreenProps = {
  /** The cabinet's leaderboard, null while it loads. */
  readonly board: Board | null;
  readonly player: Player | null;
  /** The board as the server returned it after a result. */
  readonly onBoard: (top: ReadonlyArray<LeaderboardEntry>) => void;
  /** Keeps the first name the player typed. */
  readonly remember: (name: string) => void;
};
