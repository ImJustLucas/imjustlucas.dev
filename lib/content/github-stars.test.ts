import { Effect } from "effect";

import { GitHubStars } from "./github-stars";

import { describe, expect, it, vi } from "@effect/vitest";

/** A fake GitHub REST API answering any repository with 42 stars. */
const fakeRest = () =>
  vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () =>
      new Response(JSON.stringify({ stargazers_count: 42 }), { status: 200 }),
  );

describe("GitHubStars.layer", () => {
  it.effect("reads the star count with the token when one is set", () =>
    Effect.gen(function* () {
      const fetch = fakeRest();
      vi.stubGlobal("fetch", fetch);
      const stars = yield* GitHubStars;

      expect(
        yield* stars.count("https://github.com/ImJustLucas/imjustlucas.dev"),
      ).toBe(42);
      const [url, init] = fetch.mock.calls[0]!;
      expect(url).toBe(
        "https://api.github.com/repos/ImJustLucas/imjustlucas.dev",
      );
      expect(new Headers(init?.headers).get("authorization")).toBe(
        "bearer token",
      );
      vi.unstubAllGlobals();
    }).pipe(Effect.provide(GitHubStars.layer("token"))),
  );

  it.effect("reads it anonymously without a token", () =>
    Effect.gen(function* () {
      const fetch = fakeRest();
      vi.stubGlobal("fetch", fetch);

      expect(
        yield* (yield* GitHubStars).count(
          "https://github.com/ImJustLucas/imjustlucas.dev",
        ),
      ).toBe(42);
      const [, init] = fetch.mock.calls[0]!;
      expect(new Headers(init?.headers).has("authorization")).toBe(false);
      vi.unstubAllGlobals();
    }).pipe(Effect.provide(GitHubStars.layer(undefined))),
  );
});
