import { Data, Effect, Schema } from "effect";

import "server-only";

/**
 * Upstash Redis (Vercel Marketplace, store `imjustlucas-arcade`) through its
 * REST API, so no client library ships. Shared by the Arcade's leaderboards
 * and the lobby; each maps `UpstashUnavailable` to its own error.
 */

export type UpstashCommand = ReadonlyArray<string | number>;

/** Upstash is not configured, could not be reached, or refused a command. */
export class UpstashUnavailable extends Data.TaggedError("UpstashUnavailable")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

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
  new UpstashUnavailable({ message, cause });

/** Sends commands in one round trip and returns their results, in order. */
export const upstashPipeline = (commands: ReadonlyArray<UpstashCommand>) =>
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
