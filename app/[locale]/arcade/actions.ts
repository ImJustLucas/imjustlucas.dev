"use server";

import { headers } from "next/headers";

import { type Board, isLeaderboardGame } from "@/lib/arcade/board";
import {
  getArcadeBoard,
  startArcadeRun,
  submitArcadeRun,
} from "@/lib/arcade/server";

/**
 * The Arcade's Server Actions: public endpoints, so every input is checked
 * by `lib/arcade/leaderboard.ts`, and each visitor is rate limited by IP.
 */

/** The visitor's address, as Vercel's proxy reports it. */
const client = async () =>
  (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

export async function startRunAction(game: string) {
  if (!isLeaderboardGame(game)) return { kind: "unavailable" } as const;
  return startArcadeRun(game, await client());
}

export async function submitRunAction(input: unknown) {
  return submitArcadeRun(input, await client());
}

export async function boardAction(game: string): Promise<Board> {
  if (!isLeaderboardGame(game)) return { kind: "unavailable" };
  return getArcadeBoard(game);
}
