import { Effect, Layer } from "effect";
import { TestClock } from "effect/testing";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubContributions } from "./github-contributions";
import { GitHubStars } from "./github-stars";
import type { ContributionHistory } from "./player-level";
import { layerInMemory } from "./repository-in-memory";
import { testProfile } from "./test-profile";
import { YouTubeChannel } from "./youtube-channel";

import { describe, expect, it, vi } from "@effect/vitest";

/** Content whose Profile links this GitHub account. */
const contentWithGitHub = (github: string) =>
  layerInMemory({
    "content/techs.json": "[]",
    "content/projects.json": "[]",
    "content/experiences.json": "[]",
    "content/achievements.json": "[]",
    "content/hobbies.json": "[]",
    "content/profile.json": JSON.stringify({
      ...testProfile,
      links: { ...testProfile.links, github },
    }),
  });

const catalogWith = (
  contributions: Layer.Layer<GitHubContributions>,
  github = testProfile.links.github,
) =>
  ContentCatalog.layer.pipe(
    Layer.provide(contentWithGitHub(github)),
    Layer.provide(GitHubStars.layerTest({})),
    Layer.provide(contributions),
    Layer.provide(YouTubeChannel.layerTest({})),
  );

const history: ContributionHistory = {
  total: 6253,
  days: [
    { date: "2026-10-20", count: 4, intensity: 2 },
    { date: "2026-10-21", count: 9, intensity: 4 },
    { date: "2026-10-22", count: 0, intensity: 0 },
  ],
};

describe("ContentCatalog.level", () => {
  it.effect(
    "derives the Level from the Contributions of the Profile's account",
    () =>
      Effect.gen(function* () {
        // 10:00 in Paris on 2026-10-22.
        yield* TestClock.setTime(Date.parse("2026-10-22T08:00:00Z"));
        const level = yield* (yield* ContentCatalog).level;

        expect(level).toMatchObject({
          xp: 6253,
          level: 11,
          levelXp: 753,
          levelCost: 1100,
          streak: 2,
          streakIncludesToday: false,
          recentContributions: 13,
        });
      }).pipe(
        Effect.provide(
          catalogWith(
            GitHubContributions.layerTest({ ImJustLucas: history }),
            "https://github.com/ImJustLucas",
          ),
        ),
      ),
  );

  it.effect("takes today in Paris, which turns before UTC", () =>
    Effect.gen(function* () {
      // 00:30 in Paris on 2026-10-23, still 2026-10-22 in UTC: the 22nd
      // passed without a Contribution, so the Streak is broken.
      yield* TestClock.setTime(Date.parse("2026-10-22T22:30:00Z"));
      const level = yield* (yield* ContentCatalog).level;

      expect(level?.streak).toBe(0);
    }).pipe(
      Effect.provide(
        catalogWith(GitHubContributions.layerTest({ ImJustLucas: history })),
      ),
    ),
  );

  it.effect("is none without a GitHub token", () =>
    Effect.gen(function* () {
      expect(yield* (yield* ContentCatalog).level).toBeUndefined();
    }).pipe(Effect.provide(catalogWith(GitHubContributions.layer(undefined)))),
  );

  it.effect(
    "fails with GitHubContributionsUnavailable during revalidation when GitHub fails",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).level);

        expect(error._tag).toBe("GitHubContributionsUnavailable");
      }).pipe(
        Effect.provideService(PageGeneration, "revalidation"),
        Effect.provide(catalogWith(GitHubContributions.layerTest({}))),
      ),
  );

  it.effect("is none on a cold build when GitHub fails", () =>
    Effect.gen(function* () {
      expect(yield* (yield* ContentCatalog).level).toBeUndefined();
    }).pipe(
      Effect.provideService(PageGeneration, "cold-build"),
      Effect.provide(catalogWith(GitHubContributions.layerTest({}))),
    ),
  );
});

/** A fake GitHub GraphQL API answering the two queries the source sends. */
const fakeGraphQL = (status = 200) =>
  vi.fn(async (_url: string, init?: RequestInit) => {
    const { query } = JSON.parse(String(init?.body)) as { query: string };
    const data = query.includes("contributionYears")
      ? {
          user: {
            contributionsCollection: {
              contributionYears: [2026, 2025],
              contributionCalendar: {
                weeks: [
                  {
                    contributionDays: [
                      {
                        date: "2026-10-21",
                        contributionCount: 3,
                        contributionLevel: "SECOND_QUARTILE",
                      },
                      {
                        date: "2026-10-22",
                        contributionCount: 0,
                        contributionLevel: "NONE",
                      },
                    ],
                  },
                ],
              },
            },
          },
        }
      : {
          user: {
            y2026: { contributionCalendar: { totalContributions: 40 } },
            y2025: { contributionCalendar: { totalContributions: 2 } },
          },
        };
    return new Response(JSON.stringify({ data }), { status });
  });

describe("GitHubContributions.layer", () => {
  it.effect(
    "sums every year's Contributions and reads the last year day by day",
    () =>
      Effect.gen(function* () {
        const fetch = fakeGraphQL();
        vi.stubGlobal("fetch", fetch);
        const contributions = yield* GitHubContributions;

        expect(yield* contributions.history("ImJustLucas")).toEqual({
          total: 42,
          days: [
            { date: "2026-10-21", count: 3, intensity: 2 },
            { date: "2026-10-22", count: 0, intensity: 0 },
          ],
        });
        const [url, init] = fetch.mock.calls[0]!;
        expect(url).toBe("https://api.github.com/graphql");
        expect(init?.method).toBe("POST");
        expect(new Headers(init?.headers).get("authorization")).toBe(
          "bearer token",
        );
        const { query } = JSON.parse(String(fetch.mock.calls[1]![1]?.body));
        expect(query).toMatch(
          /y2025: contributionsCollection\(from: .2025-01-01T00:00:00Z./,
        );
        vi.unstubAllGlobals();
      }).pipe(Effect.provide(GitHubContributions.layer("token"))),
  );

  // Live: the retries back off on the real clock (about 600ms).
  it.live("fails with GitHubContributionsUnavailable on a refused token", () =>
    Effect.gen(function* () {
      vi.stubGlobal("fetch", fakeGraphQL(401));
      const error = yield* Effect.flip(
        (yield* GitHubContributions).history("ImJustLucas"),
      );

      expect(error._tag).toBe("GitHubContributionsUnavailable");
      vi.unstubAllGlobals();
    }).pipe(Effect.provide(GitHubContributions.layer("token"))),
  );
});
