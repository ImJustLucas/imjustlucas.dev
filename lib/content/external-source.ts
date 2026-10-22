import { Context, Effect } from "effect";

/**
 * How a page is being generated, which decides what a failing external
 * source (GitHub stars and Contributions, YouTube Videos) does to the content
 * catalog:
 *
 * - `"cold-build"`: `next build`, with no earlier page to keep. The catalog
 *   falls back (stars omitted, no Videos, no Level) so the build never fails.
 * - `"revalidation"` (the default): anything else, e.g. a page generated
 *   earlier being refreshed at runtime. The catalog fails, so Next keeps
 *   serving the previous page and retries on a later request.
 *
 * `lib/content/server.ts` sets it from `NEXT_PHASE`.
 */
export type PageGeneration = "cold-build" | "revalidation";

export const PageGeneration = Context.Reference<PageGeneration>(
  "content/PageGeneration",
  { defaultValue: () => "revalidation" },
);

/**
 * The body of `url`, fetched fresh on every page generation: a GET, or a POST
 * of `body` when given (GitHub's GraphQL API). A non-2xx status fails, as
 * does the network.
 *
 * `cache: "no-store"` keeps the response out of Next's Data Cache, which
 * `next build` would otherwise persist in `.next/cache` (restored between
 * deploys) and serve to later builds and revalidations for up to the page's
 * `revalidate`. A page using an external source must therefore declare
 * `dynamic = "force-static"` (so the uncached fetch does not turn it dynamic)
 * and `revalidate = 86400` (24 hours; every deploy regenerates it too).
 */
export const fetchExternalText = (
  url: string,
  headers: Readonly<Record<string, string>> = {},
  body?: string,
): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    try: async (signal) => {
      const response = await fetch(url, {
        ...(body !== undefined && { method: "POST", body }),
        headers,
        signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
      return response.text();
    },
    catch: (cause) =>
      cause instanceof Error ? cause : new Error(String(cause)),
  });

/**
 * Lets an external source fall back to `fallback` when it fails on a cold
 * build; during revalidation its failure propagates.
 */
export const orOnColdBuild =
  <B>(fallback: B) =>
  <A, E, R>(source: Effect.Effect<A, E, R>): Effect.Effect<A | B, E, R> =>
    Effect.gen(function* () {
      if ((yield* PageGeneration) === "revalidation") return yield* source;
      return yield* Effect.catch(source, (error) =>
        Effect.as(
          Effect.logWarning(
            `${error instanceof Error ? error.message : String(error)}; building without it`,
          ),
          fallback,
        ),
      );
    });
