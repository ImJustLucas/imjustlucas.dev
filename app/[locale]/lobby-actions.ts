"use server";

import { beatLobby } from "@/lib/lobby/server";

/**
 * The lobby's Server Action: a visible tab's beat, which answers with how
 * many visitors are on the site. Public, so `lib/lobby/lobby.ts` checks the
 * id; nothing about the visitor but that random id is read or kept.
 */
export async function lobbyBeatAction(sessionId: unknown) {
  return beatLobby(sessionId);
}
