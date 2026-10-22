import { Effect } from "effect";

import { beat } from "./lobby";
import { layerUpstash } from "./lobby-upstash";
import type { LobbyBeat } from "./rules";

import "server-only";

/**
 * Entry point for the lobby's Server Action, and the only place its Effect
 * code runs: against Upstash. It returns plain data (ADR-0002); when Upstash
 * cannot be reached it answers `unavailable` and the counter hides.
 */
export const beatLobby = (sessionId: unknown): Promise<LobbyBeat> =>
  Effect.runPromise(
    beat(sessionId).pipe(
      Effect.provide(layerUpstash),
      Effect.catchTag("LobbyUnavailable", (error) =>
        Effect.sync((): LobbyBeat => {
          console.error("Lobby unavailable:", error.message);
          return { kind: "unavailable" };
        }),
      ),
    ),
  );
