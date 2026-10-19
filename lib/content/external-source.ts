import { Context, Effect } from "effect";

/**
 * When a page is being generated, which decides what a failing external
 * source (GitHub stars, YouTube Videos) does to the content catalog:
 *
 * - `"cold-build"`: no earlier page exists (`next build`, or `next dev`). The
 *   catalog falls back (stars omitted, no Videos) so the build never fails.
 * - `"revalidation"`: a page generated earlier is being refreshed. The
 *   catalog fails, so Next keeps serving the previous page and retries on a
 *   later request.
 */
export type PageGeneration = "cold-build" | "revalidation";

export const PageGeneration = Context.Reference<PageGeneration>(
  "content/PageGeneration",
  { defaultValue: () => "revalidation" },
);

/**
 * The page generation of the running Next process: `next build` sets
 * `NEXT_PHASE`, the production server (`next start`, Vercel Functions) runs
 * with `NODE_ENV=production`, and anything else (`next dev`) has no earlier
 * page to keep.
 */
export const pageGenerationOf = (env: {
  readonly NEXT_PHASE?: string;
  readonly NODE_ENV?: string;
}): PageGeneration =>
  env.NEXT_PHASE !== "phase-production-build" && env.NODE_ENV === "production"
    ? "revalidation"
    : "cold-build";

/**
 * The body of `url`, fetched fresh on every page generation. A non-2xx status
 * fails, as does the network.
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
): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    try: async (signal) => {
      const response = await fetch(url, {
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
            "External source failed on a cold build, falling back",
            error,
          ),
          fallback,
        ),
      );
    });
