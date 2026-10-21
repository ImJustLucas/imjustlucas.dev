"use server";

import { refresh } from "next/cache";

import { field, type FormState } from "@/app/admin/action-form";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { currentOwnerAccess } from "@/lib/admin/session";
import { isLeaderboardGame } from "@/lib/arcade/board";
import { removeArcadeEntry } from "@/lib/arcade/server";

/**
 * Takes a player off an Arcade leaderboard. Nothing is committed: the
 * leaderboards live in Upstash, not in the content.
 */
export async function removeArcadeEntryAction(
  _: FormState,
  form: FormData,
): Promise<AdminActionResult> {
  const access = await currentOwnerAccess();
  if (access.kind !== "owner") return { kind: "not-owner" };
  const game = field(form, "game");
  if (!isLeaderboardGame(game)) {
    return { kind: "failed", reason: "Ce jeu n'a pas de classement." };
  }
  const removed = await removeArcadeEntry(game, field(form, "playerId"));
  if (removed.kind === "unavailable") {
    return {
      kind: "failed",
      reason: "Upstash ne répond pas, réessaie dans un instant.",
    };
  }
  refresh();
  return { kind: "saved", revision: "" };
}
