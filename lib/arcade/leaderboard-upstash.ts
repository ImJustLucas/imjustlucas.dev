import { Effect, Layer, Schema } from "effect";

import { type UpstashCommand, upstashPipeline } from "@/lib/upstash";

import { type LeaderboardEntry, type LeaderboardGame } from "./board";
import {
  OpenRun,
  RUN_TTL_SECONDS,
  Scores,
  ScoresUnavailable,
} from "./leaderboard";

/**
 * The leaderboards on Upstash Redis (`lib/upstash.ts`). Keys:
 * `arcade:run:<id>` (an open run, expiring), `arcade:<game>:scores` (a
 * sorted set of player ids by best score), `arcade:<game>:names` (a hash of
 * player id to name) and `arcade:limit:<key>:<window>` (rate limits).
 */

const unavailable = (message: string, cause?: unknown) =>
  new ScoresUnavailable({ message, cause });

/** Sends commands in one round trip and returns their results, in order. */
const pipeline = (commands: ReadonlyArray<UpstashCommand>) =>
  Effect.mapError(upstashPipeline(commands), (error) =>
    unavailable(error.message, error.cause),
  );

const one = (command: UpstashCommand) =>
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
