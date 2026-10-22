import { Effect, Layer, Schema } from "effect";

import { routing } from "@/i18n/routing";
import { type UpstashCommand, upstashPipeline } from "@/lib/upstash";

import { EMOTES } from "./emotes";
import { POKE_TTL_SECONDS } from "./limits";
import { PokeStore, PokeUnavailable, type StoredPoke } from "./poke";
import type { RecentPoke } from "./result";

/**
 * The Pokes on Upstash Redis (`lib/upstash.ts`). Keys: `poke:limit:<key>`
 * (a visitor's day, the hour's count), `poke:sent:<id>` (a Poke, a week),
 * `poke:waved:<id>` (Lucas waved back, a week) and `poke:recent` (the newest
 * ids, for the Admin).
 */

const pipeline = (commands: ReadonlyArray<UpstashCommand>) =>
  Effect.mapError(
    upstashPipeline(commands),
    (error) => new PokeUnavailable({ message: error.message, cause: error }),
  );

const limitKey = (key: string) => `poke:limit:${key}`;
const sentKey = (id: string) => `poke:sent:${id}`;
const wavedKey = (id: string) => `poke:waved:${id}`;
const RECENT = "poke:recent";

const Stored = Schema.fromJsonString(
  Schema.Struct({
    id: Schema.String,
    emote: Schema.Literals(EMOTES),
    page: Schema.String,
    locale: Schema.Literals(routing.locales),
    at: Schema.Number,
  }),
);
const decodeStored = Schema.decodeUnknownOption(Stored);

export const layerStoreUpstash = Layer.succeed(PokeStore, {
  claim: (key, seconds) =>
    Effect.map(
      pipeline([["SET", limitKey(key), 1, "NX", "EX", seconds]]),
      ([result]) => result === "OK",
    ),

  release: (key) => Effect.asVoid(pipeline([["DEL", limitKey(key)]])),

  // The key names its window (`hour:<n>`), so it only needs to expire
  count: (key, seconds) =>
    Effect.map(
      pipeline([
        ["INCR", limitKey(key)],
        ["EXPIRE", limitKey(key), seconds],
      ]),
      ([count]) => Number(count),
    ),

  save: (poke: StoredPoke) =>
    Effect.asVoid(
      pipeline([
        ["SET", sentKey(poke.id), JSON.stringify(poke), "EX", POKE_TTL_SECONDS],
        ["LPUSH", RECENT, poke.id],
        ["LTRIM", RECENT, 0, 199],
      ]),
    ),

  recent: (count) =>
    Effect.gen(function* () {
      const [listed] = yield* pipeline([["LRANGE", RECENT, 0, count - 1]]);
      const ids = Array.isArray(listed) ? listed.map(String) : [];
      if (ids.length === 0) return [];
      const [pokes, waved] = yield* pipeline([
        ["MGET", ...ids.map(sentKey)],
        ["MGET", ...ids.map(wavedKey)],
      ]);
      // A Poke past its week is gone from the store, and from the list
      return ids.flatMap((_, i): ReadonlyArray<RecentPoke> => {
        const stored = decodeStored(Array.isArray(pokes) ? pokes[i] : null);
        if (stored._tag === "None") return [];
        const wavedBack = Array.isArray(waved) && waved[i] != null;
        return [{ ...stored.value, wavedBack }];
      });
    }),

  answer: (id) =>
    Effect.map(
      pipeline([
        ["EXISTS", sentKey(id)],
        ["EXISTS", wavedKey(id)],
      ]),
      ([kept, waved]) => (Number(kept) === 1 ? Number(waved) === 1 : undefined),
    ),

  waveBack: (id) =>
    Effect.gen(function* () {
      const [kept] = yield* pipeline([["EXISTS", sentKey(id)]]);
      if (Number(kept) !== 1) return false;
      yield* pipeline([["SET", wavedKey(id), 1, "EX", POKE_TTL_SECONDS]]);
      return true;
    }),
});
