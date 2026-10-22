import { Effect, Layer } from "effect";

import { upstashPipeline } from "@/lib/upstash";

import { LobbyStore, LobbyUnavailable } from "./lobby";

/**
 * The lobby on Upstash Redis (`lib/upstash.ts`): `lobby:online`, a sorted
 * set of session ids scored by their last beat in milliseconds. A beat is one
 * round trip of three commands: forget the expired, record the beat, count.
 */
const KEY = "lobby:online";

export const layerUpstash = Layer.succeed(LobbyStore, {
  beat: (sessionId, now, expiredAt) =>
    upstashPipeline([
      ["ZREMRANGEBYSCORE", KEY, "-inf", expiredAt],
      ["ZADD", KEY, now, sessionId],
      ["ZCARD", KEY],
    ]).pipe(
      Effect.map(([, , count]) => Number(count)),
      Effect.mapError(
        (error) =>
          new LobbyUnavailable({ message: error.message, cause: error.cause }),
      ),
    ),
});
