import { Effect } from "effect";
import { TestClock } from "effect/testing";

import { beat } from "./lobby";
import { layerInMemory } from "./lobby-in-memory";
import { HEARTBEAT_MS, LOBBY_TTL_MS } from "./rules";

import { describe, expect, it } from "@effect/vitest";

const LEA = "3f2b1c9e-8d7a-4b6c-9e5f-1a2b3c4d5e6f";
const TOM = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const ZOE = "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e";

describe("the lobby", () => {
  it.effect("counts the first visitor alone, then each new one", () =>
    Effect.gen(function* () {
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 1 });
      expect(yield* beat(TOM)).toEqual({ kind: "lobby", count: 2 });
      expect(yield* beat(ZOE)).toEqual({ kind: "lobby", count: 3 });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("counts a visitor once however often they beat", () =>
    Effect.gen(function* () {
      yield* beat(LEA);
      yield* beat(TOM);
      yield* TestClock.adjust(HEARTBEAT_MS);
      yield* beat(LEA);
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 2 });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("keeps a visitor who keeps beating", () =>
    Effect.gen(function* () {
      yield* beat(TOM);
      for (let i = 0; i < 10; i++) {
        yield* TestClock.adjust(HEARTBEAT_MS);
        yield* beat(TOM);
      }
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 2 });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("lets a visitor go once their last beat is a minute old", () =>
    Effect.gen(function* () {
      yield* beat(TOM);
      yield* TestClock.adjust(LOBBY_TTL_MS - 1);
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 2 });
      yield* TestClock.adjust(1);
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 1 });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("keeps a visitor who missed one beat", () =>
    Effect.gen(function* () {
      yield* beat(TOM);
      yield* TestClock.adjust(HEARTBEAT_MS * 1.5);
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 2 });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("refuses anything but a random id, and counts nobody for it", () =>
    Effect.gen(function* () {
      expect(yield* beat("1.2.3.4")).toEqual({ kind: "refused" });
      expect(yield* beat(42)).toEqual({ kind: "refused" });
      expect(yield* beat(undefined)).toEqual({ kind: "refused" });
      expect(yield* beat(LEA)).toEqual({ kind: "lobby", count: 1 });
    }).pipe(Effect.provide(layerInMemory())),
  );
});
