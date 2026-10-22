import { Effect, Layer } from "effect";

import { PokeNotifier, PokeUnavailable } from "./poke";

/** The webhook into Lucas's private channel; unset, nobody can wave. */
export const pokeWebhookUrl = () => process.env.DISCORD_POKE_WEBHOOK_URL;

/** Lucas's Discord through the webhook: plain `fetch`, no client library. */
export const layerNotifierDiscord = Layer.succeed(PokeNotifier, {
  notify: (message) =>
    Effect.tryPromise({
      try: async () => {
        const url = pokeWebhookUrl();
        if (!url) throw new Error("DISCORD_POKE_WEBHOOK_URL is not set");
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          throw new Error(`Discord answered ${response.status}`);
        }
      },
      catch: (cause) =>
        new PokeUnavailable({ message: "Discord could not be reached", cause }),
    }),
});
