import { Clock, Context, Data, Effect, Schema } from "effect";

import { parseName } from "@/lib/arcade/player-name";

import { type Emote, isEmote } from "./emotes";
import { POKE_LIMITS, pokeHour, RECENT_POKES } from "./limits";
import { pokeMessage, pokePage, type PokePlace } from "./message";
import type { PokeReply, RecentPoke, SentPoke } from "./result";

/**
 * The Pokes (DESIGN.md, Wave): a visitor waves at Lucas with an emote, and
 * Lucas gets it on Discord; he may wave back from the Admin, which the
 * visitor sees on their next visit. Each visitor waves once a day and the
 * whole site twenty times an hour, so a Poke can never flood his Discord.
 * The plain shapes are in `result.ts`.
 */

/** Upstash or Discord could not be reached. */
export class PokeUnavailable extends Data.TaggedError("PokeUnavailable")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/** A Poke as kept for the Admin and its answer. */
export type StoredPoke = Omit<RecentPoke, "wavedBack">;

/**
 * Where Pokes and their limits are kept. Adapters: Upstash Redis
 * (production), in memory (tests).
 */
export class PokeStore extends Context.Service<
  PokeStore,
  {
    /** Takes `key` for `seconds` unless it is taken; false when it was. */
    readonly claim: (
      key: string,
      seconds: number,
    ) => Effect.Effect<boolean, PokeUnavailable>;
    readonly release: (key: string) => Effect.Effect<void, PokeUnavailable>;
    /** Counts one more use of `key`, kept `seconds`: the count so far. */
    readonly count: (
      key: string,
      seconds: number,
    ) => Effect.Effect<number, PokeUnavailable>;
    /** Keeps a Poke for a week, newest first among the recent ones. */
    readonly save: (poke: StoredPoke) => Effect.Effect<void, PokeUnavailable>;
    readonly recent: (
      count: number,
    ) => Effect.Effect<ReadonlyArray<RecentPoke>, PokeUnavailable>;
    /** Whether Lucas waved back; undefined for a Poke no longer kept. */
    readonly answer: (
      id: string,
    ) => Effect.Effect<boolean | undefined, PokeUnavailable>;
    /** Marks a kept Poke as waved back; false when it is no longer kept. */
    readonly waveBack: (id: string) => Effect.Effect<boolean, PokeUnavailable>;
  }
>()("poke/PokeStore") {}

/** Lucas's Discord: a webhook into a private channel of his server. */
export class PokeNotifier extends Context.Service<
  PokeNotifier,
  {
    readonly notify: (
      message: ReturnType<typeof pokeMessage>,
    ) => Effect.Effect<void, PokeUnavailable>;
  }
>()("poke/PokeNotifier") {}

/** What the visitor's browser sends, unchecked. */
const Submission = Schema.Struct({
  emote: Schema.String,
  page: Schema.String,
  /** The visitor's first name, if they gave one. */
  name: Schema.optional(Schema.String),
  /** The honeypot: a field no person sees, so only a bot fills it. */
  website: Schema.optional(Schema.String),
});

/** What the server knows of the request, beside what the browser sent. */
export type PokeRequest = {
  /** The visitor's keyed hash (`visitor.ts`), never their address. */
  readonly visitor: string;
  /** Every path the site serves (`knownPaths`). */
  readonly known: ReadonlySet<string>;
  /** From Vercel's geo headers; told to Lucas, never kept. */
  readonly place: PokePlace | null;
  /** The Admin's row of a Poke, where Lucas waves back. */
  readonly waveBackUrl: (id: string) => string;
};

const sent = (pokeId: string, at: number): SentPoke => ({
  kind: "sent",
  pokeId,
  at,
});

/**
 * Sends a Poke to Lucas's Discord: the emote must be one of the set, the
 * page one the site serves, and a first name, if given, one the Arcade would
 * take (`parseName`). The visitor's day is taken first and given back
 * if the Poke does not go out, so a busy hour or a Discord hiccup never
 * costs them their wave.
 */
export const sendPoke = (input: unknown, request: PokeRequest) =>
  Effect.gen(function* () {
    const store = yield* PokeStore;
    const notifier = yield* PokeNotifier;
    const now = yield* Clock.currentTimeMillis;

    const submission = yield* Effect.option(
      Schema.decodeUnknownEffect(Submission)(input),
    );
    if (submission._tag === "None") return { kind: "refused" } as SentPoke;
    // A bot is told it worked, and nothing is sent
    if (submission.value.website) return sent(crypto.randomUUID(), now);
    const { emote } = submission.value;
    const page = pokePage(submission.value.page, request.known);
    if (!isEmote(emote) || !page) return { kind: "refused" } as SentPoke;
    // A first name is optional, and held to the Arcade's rule when given
    const typed = submission.value.name?.trim() ?? "";
    const parsed = typed ? parseName(typed) : null;
    if (parsed && !parsed.ok) return { kind: "refused" } as SentPoke;
    const name = parsed?.ok ? parsed.name : null;

    const day = `visitor:${request.visitor}`;
    if (!(yield* store.claim(day, POKE_LIMITS.visitor.seconds))) {
      return { kind: "limited" } as SentPoke;
    }
    const { count, windowSeconds } = POKE_LIMITS.everyone;
    const used = yield* store.count(`hour:${pokeHour(now)}`, windowSeconds);
    if (used > count) {
      yield* store.release(day);
      return { kind: "busy" } as SentPoke;
    }

    const id = crypto.randomUUID();
    yield* notifier
      .notify(
        pokeMessage({
          emote: emote as Emote,
          name,
          ...page,
          place: request.place,
          waveBackUrl: request.waveBackUrl(id),
          at: now,
        }),
      )
      .pipe(Effect.tapError(() => Effect.ignore(store.release(day))));
    // Lucas has it: a Poke the Admin cannot list only loses its answer
    yield* Effect.ignore(
      store.save({ id, emote: emote as Emote, name, ...page, at: now }),
      { log: true, message: "A Poke could not be kept" },
    );
    return sent(id, now);
  });

const POKE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Whether Lucas waved back at the visitor's Poke `id`. */
export const pokeReply = (id: unknown) =>
  Effect.gen(function* () {
    if (typeof id !== "string" || !POKE_ID.test(id)) {
      return { kind: "gone" } as PokeReply;
    }
    const answer = yield* (yield* PokeStore).answer(id);
    return (
      answer === undefined
        ? { kind: "gone" }
        : answer
          ? { kind: "waved" }
          : { kind: "waiting" }
    ) as PokeReply;
  });

/** The Pokes of the last week, newest first, for the Admin. */
export const recentPokes = Effect.gen(function* () {
  return yield* (yield* PokeStore).recent(RECENT_POKES);
});

/** Lucas waves back at Poke `id`; the caller checks the Owner. */
export const waveBack = (id: string) =>
  Effect.gen(function* () {
    if (!POKE_ID.test(id)) return { kind: "gone" } as const;
    return (yield* (yield* PokeStore).waveBack(id))
      ? ({ kind: "waved" } as const)
      : ({ kind: "gone" } as const);
  });
