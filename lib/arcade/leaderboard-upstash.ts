import { Effect, Layer, Schema } from "effect";

import { type LeaderboardEntry, type LeaderboardGame } from "./board";
import {
  OpenRun,
  RUN_TTL_SECONDS,
  Scores,
  ScoresUnavailable,
} from "./leaderboard";

/**
 * The leaderboards on Upstash Redis (Vercel Marketplace, store
 * `imjustlucas-arcade`), through its REST API, so no client library ships.
 * Keys: `arcade:run:<id>` (an open run, expiring), `arcade:<game>:scores`
 * (a sorted set of player ids by best score), `arcade:<game>:names` (a hash
 * of player id to name) and `arcade:limit:<key>:<window>` (rate limits).
 */

type Command = ReadonlyArray<string | number>;

const credentials = () => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : undefined;
};

const Reply = Schema.Union([
  Schema.Struct({ result: Schema.Unknown }),
  Schema.Struct({ error: Schema.String }),
]);

const unavailable = (message: string, cause?: unknown) =>
  new ScoresUnavailable({ message, cause });

/** Sends commands in one round trip and returns their results, in order. */
const pipeline = (commands: ReadonlyArray<Command>) =>
  Effect.gen(function* () {
    const keys = credentials();
    if (!keys) {
      return yield* Effect.fail(unavailable("Upstash is not configured"));
    }
    const body = yield* Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${keys.url}/pipeline`, {
          method: "POST",
          headers: { Authorization: `Bearer ${keys.token}` },
          body: JSON.stringify(commands),
          cache: "no-store",
        });
        if (!response.ok)
          throw new Error(`Upstash answered ${response.status}`);
        return (await response.json()) as unknown;
      },
      catch: (cause) => unavailable("Upstash could not be reached", cause),
    });
    const replies = yield* Effect.mapError(
      Schema.decodeUnknownEffect(Schema.Array(Reply))(body),
      (cause) => unavailable("Upstash answered something unexpected", cause),
    );
    const failed = replies.find((reply) => "error" in reply);
    if (failed && "error" in failed) {
      return yield* Effect.fail(unavailable(failed.error));
    }
    return replies.map((reply) => ("result" in reply ? reply.result : null));
  });

const one = (command: Command) =>
  Effect.map(pipeline([command]), ([result]) => result);

const scoresKey = (game: LeaderboardGame) => `arcade:${game}:scores`;
const namesKey = (game: LeaderboardGame) => `arcade:${game}:names`;
const runKey = (id: string) => `arcade:run:${id}`;

const OpenRunJson = Schema.fromJsonString(OpenRun);

export const layerUpstash = Layer.succeed(Scores, {
  openRun: (id, run) =>
    Effect.asVoid(
      one(["SET", runKey(id), JSON.stringify(run), "EX", RUN_TTL_SECONDS]),
    ),

  takeRun: (id) =>
    Effect.flatMap(one(["GETDEL", runKey(id)]), (stored) =>
      typeof stored === "string"
        ? Effect.mapError(
            Schema.decodeUnknownEffect(OpenRunJson)(stored),
            (cause) => unavailable("A stored run is unreadable", cause),
          )
        : Effect.succeed(undefined),
    ),

  top: (game, count) =>
    Effect.gen(function* () {
      const flat = yield* one([
        "ZRANGE",
        scoresKey(game),
        0,
        count - 1,
        "REV",
        "WITHSCORES",
      ]);
      const pairs = Array.isArray(flat) ? flat.map(String) : [];
      const ids = pairs.filter((_, i) => i % 2 === 0);
      if (ids.length === 0) return [];
      const names = yield* one(["HMGET", namesKey(game), ...ids]);
      return ids.map(
        (playerId, i): LeaderboardEntry => ({
          playerId,
          name: Array.isArray(names) ? String(names[i] ?? "?") : "?",
          score: Number(pairs[i * 2 + 1]),
        }),
      );
    }),

  record: (game, entry) =>
    Effect.asVoid(
      pipeline([
        ["ZADD", scoresKey(game), "GT", entry.score, entry.playerId],
        ["HSET", namesKey(game), entry.playerId, entry.name],
      ]),
    ),

  remove: (game, playerId) =>
    Effect.asVoid(
      pipeline([
        ["ZREM", scoresKey(game), playerId],
        ["HDEL", namesKey(game), playerId],
      ]),
    ),

  // A fixed window per key: count, and let the window's key expire
  allow: (key, limit) => {
    const window = Math.floor(Date.now() / 1000 / limit.windowSeconds);
    const counter = `arcade:limit:${key}:${window}`;
    return Effect.map(
      pipeline([
        ["INCR", counter],
        ["EXPIRE", counter, limit.windowSeconds],
      ]),
      ([count]) => Number(count) <= limit.count,
    );
  },
});
