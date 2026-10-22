import { Clock, Effect, Layer, Ref } from "effect";

import {
  PokeNotifier,
  PokeStore,
  type PokeStore as Store,
  PokeUnavailable,
  type StoredPoke,
} from "./poke";
import type { RecentPoke } from "./result";

type State = {
  /** Claimed keys and counters, with when they expire (milliseconds). */
  readonly keys: ReadonlyMap<string, { value: number; until: number }>;
  readonly pokes: ReadonlyArray<StoredPoke>;
  readonly waved: ReadonlySet<string>;
};

/**
 * Pokes in memory, for tests: keys expire on the test clock; kept Pokes
 * never do.
 */
export const layerStoreInMemory = () =>
  Layer.effect(
    PokeStore,
    Effect.map(
      Ref.make<State>({ keys: new Map(), pokes: [], waved: new Set() }),
      (state): Store["Service"] => {
        /** The keys still alive at `now`. */
        const alive = (s: State, now: number) =>
          new Map([...s.keys].filter(([, key]) => key.until > now));

        return {
          claim: (key, seconds) =>
            Effect.flatMap(Clock.currentTimeMillis, (now) =>
              Ref.modify(state, (s) => {
                const keys = alive(s, now);
                if (keys.has(key)) return [false, { ...s, keys }] as const;
                keys.set(key, { value: 1, until: now + seconds * 1000 });
                return [true, { ...s, keys }] as const;
              }),
            ),
          release: (key) =>
            Ref.update(state, (s) => {
              const keys = new Map(s.keys);
              keys.delete(key);
              return { ...s, keys };
            }),
          count: (key, seconds) =>
            Effect.flatMap(Clock.currentTimeMillis, (now) =>
              Ref.modify(state, (s) => {
                const keys = alive(s, now);
                const value = (keys.get(key)?.value ?? 0) + 1;
                keys.set(key, {
                  value,
                  until: keys.get(key)?.until ?? now + seconds * 1000,
                });
                return [value, { ...s, keys }] as const;
              }),
            ),
          save: (poke) =>
            Ref.update(state, (s) => ({ ...s, pokes: [poke, ...s.pokes] })),
          recent: (count) =>
            Effect.map(Ref.get(state), (s) =>
              s.pokes.slice(0, count).map(
                (poke): RecentPoke => ({
                  ...poke,
                  wavedBack: s.waved.has(poke.id),
                }),
              ),
            ),
          answer: (id) =>
            Effect.map(Ref.get(state), (s) =>
              s.pokes.some((poke) => poke.id === id)
                ? s.waved.has(id)
                : undefined,
            ),
          waveBack: (id) =>
            Ref.modify(state, (s) =>
              s.pokes.some((poke) => poke.id === id)
                ? ([true, { ...s, waved: new Set(s.waved).add(id) }] as const)
                : ([false, s] as const),
            ),
        };
      },
    ),
  );

/** A Discord that keeps what it was sent, or is down when `down` says so. */
export const notifierInMemory = (
  sent: Array<unknown>,
  down: () => boolean = () => false,
) =>
  Layer.succeed(PokeNotifier, {
    notify: (message) =>
      down()
        ? Effect.fail(new PokeUnavailable({ message: "Discord is down" }))
        : Effect.sync(() => {
            sent.push(message);
          }),
  });
