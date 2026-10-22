import { Effect, Layer, Ref } from "effect";

import { LobbyStore } from "./lobby";

/** The lobby in memory, for tests: each visitor's last beat, by id. */
export const layerInMemory = () =>
  Layer.effect(
    LobbyStore,
    Effect.map(
      Ref.make<ReadonlyMap<string, number>>(new Map()),
      (state): LobbyStore["Service"] => ({
        beat: (sessionId, now, expiredAt) =>
          Ref.modify(state, (seen) => {
            const next = new Map(
              [...seen].filter(([, at]) => at > expiredAt),
            ).set(sessionId, now);
            return [next.size, next] as const;
          }),
      }),
    ),
  );
