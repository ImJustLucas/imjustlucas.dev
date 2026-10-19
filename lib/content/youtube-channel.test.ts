import { Effect } from "effect";

import { YouTubeChannel } from "./youtube-channel";

import { afterEach, describe, expect, it, vi } from "@effect/vitest";

const CHANNEL = "UCLw4N_gccAY1Y4K4S20IPog";

const entry = (id: string, title: string, published: string, host = "i2") => `
 <entry>
  <id>yt:video:${id}</id>
  <yt:videoId>${id}</yt:videoId>
  <yt:channelId>${CHANNEL}</yt:channelId>
  <title>${title}</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=${id}"/>
  <author><name>Lucas・ImJustLucas</name></author>
  <published>${published}</published>
  <updated>2026-10-05T13:09:13+00:00</updated>
  <media:group>
   <media:title>${title}</media:title>
   <media:content url="https://www.youtube.com/v/${id}?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
   <media:thumbnail url="https://${host}.ytimg.com/vi/${id}/hqdefault.jpg" width="480" height="360"/>
   <media:description>Description</media:description>
  </media:group>
 </entry>`;

/** The channel's Atom feed, in the shape YouTube serves it. */
const feed = (
  ...entries: ReadonlyArray<string>
) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <link rel="self" href="http://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}"/>
 <id>yt:channel:Lw4N_gccAY1Y4K4S20IPog</id>
 <yt:channelId>Lw4N_gccAY1Y4K4S20IPog</yt:channelId>
 <title>Lucas・ImJustLucas</title>
 <link rel="alternate" href="https://www.youtube.com/channel/${CHANNEL}"/>
 <published>2017-10-11T16:55:32+00:00</published>${entries.join("")}
</feed>`;

/** Serves `body` with `status` for the channel's feed URL only. */
const serveFeed = (status: number, body: string) => {
  const fetch = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    return url ===
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`
      ? new Response(body, { status })
      : new Response("Not Found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

const latestVideos = (channelId: string) =>
  Effect.gen(function* () {
    return yield* (yield* YouTubeChannel).latestVideos(channelId);
  }).pipe(Effect.provide(YouTubeChannel.layer));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("YouTubeChannel.layer (channel feed)", () => {
  it.live("reads each Video's title, thumbnail, date and own link", () =>
    Effect.gen(function* () {
      serveFeed(
        200,
        feed(
          entry(
            "y02_MMDQw5g",
            "Day in my life – Predi.GG &amp; friends &#39;24",
            "2026-01-04T12:01:44+00:00",
          ),
          entry("2024", "2024", "2024-11-24T10:00:00+00:00", "i1"),
        ),
      );

      expect(yield* latestVideos(CHANNEL)).toEqual([
        {
          id: "y02_MMDQw5g",
          title: "Day in my life – Predi.GG & friends '24",
          thumbnail: "https://i2.ytimg.com/vi/y02_MMDQw5g/hqdefault.jpg",
          publishedAt: "2026-01-04T12:01:44+00:00",
          url: "https://www.youtube.com/watch?v=y02_MMDQw5g",
        },
        {
          id: "2024",
          title: "2024",
          thumbnail: "https://i1.ytimg.com/vi/2024/hqdefault.jpg",
          publishedAt: "2024-11-24T10:00:00+00:00",
          url: "https://www.youtube.com/watch?v=2024",
        },
      ]);
    }),
  );

  it.live("reads a single Video", () =>
    Effect.gen(function* () {
      serveFeed(200, feed(entry("a", "Only one", "2025-01-05T10:00:00Z")));

      const videos = yield* latestVideos(CHANNEL);

      expect(videos.map((v) => v.id)).toEqual(["a"]);
    }),
  );

  it.live("reads a channel without Videos", () =>
    Effect.gen(function* () {
      serveFeed(200, feed());

      expect(yield* latestVideos(CHANNEL)).toEqual([]);
    }),
  );

  it.live("fails with VideosUnavailable when the feed keeps failing", () =>
    Effect.gen(function* () {
      const fetch = serveFeed(500, "Internal Error");

      const error = yield* Effect.flip(latestVideos(CHANNEL));

      expect(error._tag).toBe("VideosUnavailable");
      expect(fetch.mock.calls.length).toBeGreaterThan(1);
    }),
  );

  it.live("fails with VideosUnavailable for an unknown channel", () =>
    Effect.gen(function* () {
      serveFeed(200, feed());

      const error = yield* Effect.flip(latestVideos("UCunknown"));

      expect(error._tag).toBe("VideosUnavailable");
    }),
  );

  it.live("fails with VideosUnavailable when the feed is not a feed", () =>
    Effect.gen(function* () {
      serveFeed(200, "<html><body>Consent required</body></html>");

      const error = yield* Effect.flip(latestVideos(CHANNEL));

      expect(error._tag).toBe("VideosUnavailable");
    }),
  );

  it.live("fails with VideosUnavailable when the host is unreachable", () =>
    Effect.gen(function* () {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          throw new TypeError("fetch failed");
        }),
      );

      const error = yield* Effect.flip(latestVideos(CHANNEL));

      expect(error._tag).toBe("VideosUnavailable");
    }),
  );
});
