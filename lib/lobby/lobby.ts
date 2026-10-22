import { Clock, Context, Data, Effect } from "effect";

import { isSessionId, LOBBY_TTL_MS, type LobbyBeat } from "./rules";

/**
 * The lobby's server side (ADR-0002): a beat records its visitor at the
 * current time, lets go of everyone whose last beat is `LOBBY_TTL_MS` old,
 * and counts who is left, in one call to the store. The plain rules are in
 * `rules.ts`.
 */

/** The lobby's store could not be reached. */
export class LobbyUnavailable extends Data.TaggedError("LobbyUnavailable")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The one seam under the lobby. Adapters: Upstash Redis (production), in
 * memory (tests).
 */
export class LobbyStore extends Context.Service<
  LobbyStore,
  {
    /**
     * Records `sessionId` as seen at `now`, forgets every visitor last seen
     * at or before `expiredAt`, and returns how many are left.
     */
    readonly beat: (
      sessionId: string,
      now: number,
      expiredAt: number,
    ) => Effect.Effect<number, LobbyUnavailable>;
  }
>()("lobby/LobbyStore") {}

/** Takes a visitor's beat, unchecked, and answers with the lobby's count. */
export const beat = (sessionId: unknown) =>
  Effect.gen(function* () {
    if (!isSessionId(sessionId)) return { kind: "refused" } as LobbyBeat;
    const store = yield* LobbyStore;
    const now = yield* Clock.currentTimeMillis;
    const count = yield* store.beat(sessionId, now, now - LOBBY_TTL_MS);
    return { kind: "lobby", count } as LobbyBeat;
  });
