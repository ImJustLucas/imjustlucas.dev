import { Effect, Layer } from "effect";
import { TestClock } from "effect/testing";

import { ContentCatalog, YOUTUBE_CHANNEL_ID } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubStars } from "./github-stars";
import { layerInMemory } from "./repository-in-memory";
import { type ChannelVideo, YouTubeChannel } from "./youtube-channel";

import { describe, expect, it } from "@effect/vitest";

const video = (id: string, publishedAt: string): ChannelVideo => ({
  id,
  title: `Video ${id}`,
  thumbnail: `https://i2.ytimg.com/vi/${id}/hqdefault.jpg`,
  publishedAt,
  url: `https://www.youtube.com/watch?v=${id}`,
});

/** A catalog whose channel holds these Videos, in the feed's order. */
const catalogWithChannel = (
  channels: Readonly<Record<string, ReadonlyArray<ChannelVideo>>>,
) =>
  ContentCatalog.layer.pipe(
    Layer.provide(layerInMemory({})),
    Layer.provide(GitHubStars.layerTest({})),
    Layer.provide(YouTubeChannel.layerTest(channels)),
  );

describe("ContentCatalog.videos", () => {
  it.effect("returns the channel's Videos, most recent first", () =>
    Effect.gen(function* () {
      const videos = yield* (yield* ContentCatalog).videos;

      expect(videos.map((v) => v.id)).toEqual(["c", "b", "a"]);
    }).pipe(
      Effect.provide(
        catalogWithChannel({
          [YOUTUBE_CHANNEL_ID]: [
            video("b", "2025-02-02T10:00:00+00:00"),
            video("a", "2024-11-24T10:00:00+00:00"),
            video("c", "2026-01-04T12:01:44+00:00"),
          ],
        }),
      ),
    ),
  );

  it.effect("returns each Video's title, thumbnail, date and own link", () =>
    Effect.gen(function* () {
      const [latest] = yield* (yield* ContentCatalog).videos;

      expect(latest).toMatchObject({
        id: "y02_MMDQw5g",
        title: "Day in my life – dev web chomage edition",
        thumbnail: "https://i2.ytimg.com/vi/y02_MMDQw5g/hqdefault.jpg",
        publishedAt: "2026-01-04T12:01:44+00:00",
        url: "https://www.youtube.com/watch?v=y02_MMDQw5g",
      });
    }).pipe(
      Effect.provide(
        catalogWithChannel({
          [YOUTUBE_CHANNEL_ID]: [
            {
              id: "y02_MMDQw5g",
              title: "Day in my life – dev web chomage edition",
              thumbnail: "https://i2.ytimg.com/vi/y02_MMDQw5g/hqdefault.jpg",
              publishedAt: "2026-01-04T12:01:44+00:00",
              url: "https://www.youtube.com/watch?v=y02_MMDQw5g",
            },
          ],
        }),
      ),
    ),
  );

  describe("marks the most recent Video new", () => {
    const published = "2026-10-01T08:00:00+00:00";
    const channel = catalogWithChannel({
      [YOUTUBE_CHANNEL_ID]: [
        video("older", "2026-09-30T08:00:00+00:00"),
        video("latest", published),
      ],
    });
    const newIds = Effect.gen(function* () {
      const videos = yield* (yield* ContentCatalog).videos;
      return videos.filter((v) => v.isNew).map((v) => v.id);
    });

    it.effect("when published less than 30 days ago, and only it", () =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.parse("2026-10-31T07:59:59.999Z"));

        expect(yield* newIds).toEqual(["latest"]);
      }).pipe(Effect.provide(channel)),
    );

    it.effect("not once 30 days have passed", () =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.parse("2026-10-31T08:00:00Z"));

        expect(yield* newIds).toEqual([]);
      }).pipe(Effect.provide(channel)),
    );
  });

  it.effect(
    "fails with VideosUnavailable during revalidation when the channel cannot be read",
    () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip((yield* ContentCatalog).videos);

        expect(error._tag).toBe("VideosUnavailable");
      }).pipe(
        Effect.provideService(PageGeneration, "revalidation"),
        Effect.provide(catalogWithChannel({})),
      ),
  );

  it.effect("returns no Videos on a cold build when the channel fails", () =>
    Effect.gen(function* () {
      expect(yield* (yield* ContentCatalog).videos).toEqual([]);
    }).pipe(
      Effect.provideService(PageGeneration, "cold-build"),
      Effect.provide(catalogWithChannel({})),
    ),
  );

  it.effect("marks no Video new when the channel has none", () =>
    Effect.gen(function* () {
      expect(yield* (yield* ContentCatalog).videos).toEqual([]);
    }).pipe(Effect.provide(catalogWithChannel({ [YOUTUBE_CHANNEL_ID]: [] }))),
  );
});
