import { Effect, Layer } from "effect";
import { TestClock } from "effect/testing";

import { POKE_LIMITS } from "./limits";
import { knownPaths } from "./message";
import { pokeReply, recentPokes, sendPoke, waveBack } from "./poke";
import { layerStoreInMemory, notifierInMemory } from "./poke-in-memory";
import type { SentPoke } from "./result";

import { describe, expect, it } from "@effect/vitest";

const request = (visitor: string) => ({
  visitor,
  known: knownPaths(["sweetch"]),
  place: { city: "Lyon", country: "FR" },
  waveBackUrl: (id: string) => `https://www.imjustlucas.dev/admin/pokes#${id}`,
});

const WAVE = { emote: "wave", page: "/fr/arcade" };

/** The rules over an in-memory store and a Discord that keeps its messages. */
const setup = (down: () => boolean = () => false) => {
  const discord: Array<unknown> = [];
  const layer = Layer.merge(
    layerStoreInMemory(),
    notifierInMemory(discord, down),
  );
  return { discord, layer };
};

const pokeId = (result: SentPoke) => {
  if (result.kind !== "sent") throw new Error(`not sent: ${result.kind}`);
  return result.pokeId;
};

describe("a Poke", () => {
  it.effect("reaches Lucas's Discord and the Admin", () => {
    const { discord, layer } = setup();
    return Effect.gen(function* () {
      const result = yield* sendPoke(WAVE, request("léa"));
      const id = pokeId(result);
      expect(discord).toHaveLength(1);
      expect(JSON.stringify(discord[0])).toContain("/fr/arcade");
      expect(JSON.stringify(discord[0])).toContain(id);
      expect(yield* recentPokes).toEqual([
        {
          id,
          emote: "wave",
          page: "/fr/arcade",
          locale: "fr",
          at: expect.any(Number),
          wavedBack: false,
        },
      ]);
    }).pipe(Effect.provide(layer));
  });

  it.effect("never keeps where the visitor was", () =>
    Effect.gen(function* () {
      yield* sendPoke(WAVE, request("léa"));
      expect(JSON.stringify(yield* recentPokes)).not.toContain("Lyon");
    }).pipe(Effect.provide(setup().layer)),
  );
});

describe("what a Poke may carry", () => {
  it.effect("refuses an emote or a page outside the set", () => {
    const { discord, layer } = setup();
    return Effect.gen(function* () {
      for (const input of [
        { emote: "🖕", page: "/fr/arcade" },
        { emote: "wave", page: "/fr/hire-me" },
        { emote: "wave" },
        "wave",
        null,
      ]) {
        expect(yield* sendPoke(input, request("léa"))).toEqual({
          kind: "refused",
        });
      }
      expect(discord).toEqual([]);
    }).pipe(Effect.provide(layer));
  });

  it.effect(
    "tells a bot that filled the honeypot it worked, sends nothing",
    () => {
      const { discord, layer } = setup();
      return Effect.gen(function* () {
        const result = yield* sendPoke(
          { ...WAVE, website: "https://spam.example" },
          request("bot"),
        );
        expect(result.kind).toBe("sent");
        expect(discord).toEqual([]);
        expect(yield* recentPokes).toEqual([]);
        // And the bot's address still has its day
        expect((yield* sendPoke(WAVE, request("bot"))).kind).toBe("sent");
      }).pipe(Effect.provide(layer));
    },
  );
});

describe("the limits", () => {
  it.effect("give each visitor one wave a day", () => {
    const { discord, layer } = setup();
    return Effect.gen(function* () {
      expect((yield* sendPoke(WAVE, request("léa"))).kind).toBe("sent");
      expect(yield* sendPoke(WAVE, request("léa"))).toEqual({
        kind: "limited",
      });
      expect((yield* sendPoke(WAVE, request("tom"))).kind).toBe("sent");
      yield* TestClock.adjust("23 hours");
      expect((yield* sendPoke(WAVE, request("léa"))).kind).toBe("limited");
      yield* TestClock.adjust("1 hour");
      expect((yield* sendPoke(WAVE, request("léa"))).kind).toBe("sent");
      expect(discord).toHaveLength(3);
    }).pipe(Effect.provide(layer));
  });

  it.effect("let twenty Pokes an hour through, from everyone together", () => {
    const { discord, layer } = setup();
    return Effect.gen(function* () {
      const { count } = POKE_LIMITS.everyone;
      for (let i = 0; i < count; i++) {
        expect((yield* sendPoke(WAVE, request(`v${i}`))).kind).toBe("sent");
      }
      expect(yield* sendPoke(WAVE, request("late"))).toEqual({ kind: "busy" });
      expect(discord).toHaveLength(count);
      // The busy hour did not cost the late visitor their day
      yield* TestClock.adjust("1 hour");
      expect((yield* sendPoke(WAVE, request("late"))).kind).toBe("sent");
    }).pipe(Effect.provide(layer));
  });

  it.effect("give the visitor's day back when Discord is down", () => {
    let down = true;
    const { discord, layer } = setup(() => down);
    return Effect.gen(function* () {
      const failed = yield* Effect.flip(sendPoke(WAVE, request("léa")));
      expect(failed._tag).toBe("PokeUnavailable");
      down = false;
      expect((yield* sendPoke(WAVE, request("léa"))).kind).toBe("sent");
      expect(discord).toHaveLength(1);
    }).pipe(Effect.provide(layer));
  });
});

describe("waving back", () => {
  it.effect("is what the visitor finds on their next visit", () =>
    Effect.gen(function* () {
      const id = pokeId(yield* sendPoke(WAVE, request("léa")));
      expect(yield* pokeReply(id)).toEqual({ kind: "waiting" });
      expect(yield* waveBack(id)).toEqual({ kind: "waved" });
      expect(yield* pokeReply(id)).toEqual({ kind: "waved" });
      expect((yield* recentPokes)[0].wavedBack).toBe(true);
    }).pipe(Effect.provide(setup().layer)),
  );

  it.effect("has no answer for a Poke that was never kept", () =>
    Effect.gen(function* () {
      const unknown = "3f2b1c9e-8d7a-4b6c-9e5f-1a2b3c4d5e6f";
      expect(yield* pokeReply(unknown)).toEqual({ kind: "gone" });
      expect(yield* pokeReply("../admin")).toEqual({ kind: "gone" });
      expect(yield* pokeReply(42)).toEqual({ kind: "gone" });
      expect(yield* waveBack(unknown)).toEqual({ kind: "gone" });
    }).pipe(Effect.provide(setup().layer)),
  );
});
