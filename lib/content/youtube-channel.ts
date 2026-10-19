import { Context, Effect, Layer, Schedule, Schema } from "effect";
import { XMLParser } from "fast-xml-parser";

import { VideosUnavailable } from "./errors";

/** A Video as the channel publishes it. */
export type ChannelVideo = {
  /** YouTube video identifier. */
  readonly id: string;
  /** Left untranslated. */
  readonly title: string;
  /** Thumbnail image URL, on a `*.ytimg.com` host. */
  readonly thumbnail: string;
  /** Publication time, ISO 8601. */
  readonly publishedAt: string;
  /** The Video's own YouTube page. */
  readonly url: string;
};

/** A response body, failing on any non-2xx status. */
const fetchText = (url: string) =>
  Effect.tryPromise({
    // Next's fetch: the page's `revalidate` governs caching.
    try: async (signal) => {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return response.text();
    },
    catch: (cause) => cause,
  });

const parser = new XMLParser({
  // `link@href` and `media:thumbnail@url` are attributes.
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep every value a string: a title "2024" must not become a number.
  parseTagValue: false,
  // Decode numeric references such as `&#39;` too.
  htmlEntities: true,
  // A feed with a single entry still yields an array.
  isArray: (_name, jpath) => jpath === "feed.entry",
});

const Entry = Schema.Struct({
  "yt:videoId": Schema.NonEmptyString,
  title: Schema.String,
  published: Schema.String.check(
    Schema.makeFilter((s) => !Number.isNaN(Date.parse(s)) || "Invalid date"),
  ),
  link: Schema.Struct({ "@_href": Schema.NonEmptyString }),
  "media:group": Schema.Struct({
    "media:thumbnail": Schema.Struct({ "@_url": Schema.NonEmptyString }),
  }),
});

/** The parts of the channel's Atom feed the Videos are read from. */
const Feed = Schema.Struct({
  // No `entry` at all when the channel has no Videos.
  feed: Schema.Struct({ entry: Schema.optionalKey(Schema.Array(Entry)) }),
});

const toChannelVideo = (entry: typeof Entry.Type): ChannelVideo => ({
  id: entry["yt:videoId"],
  title: entry.title,
  thumbnail: entry["media:group"]["media:thumbnail"]["@_url"],
  publishedAt: entry.published,
  url: entry.link["@_href"],
});

/**
 * The YouTube Videos source: the latest Videos of a channel. Consumed only by
 * the content catalog.
 */
export class YouTubeChannel extends Context.Service<
  YouTubeChannel,
  {
    readonly latestVideos: (
      channelId: string,
    ) => Effect.Effect<ReadonlyArray<ChannelVideo>, VideosUnavailable>;
  }
>()("content/YouTubeChannel") {
  /**
   * Production layer: the channel's public Atom feed (its 15 most recent
   * uploads, no API key). Any failure (unreachable, non-2xx, unexpected
   * shape) is `VideosUnavailable`.
   */
  static readonly layer = Layer.succeed(YouTubeChannel, {
    latestVideos: (channelId) =>
      fetchText(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      ).pipe(
        Effect.timeout("5 seconds"),
        Effect.retry({
          times: 2,
          schedule: Schedule.exponential("200 millis"),
        }),
        Effect.flatMap((xml) => Effect.try(() => parser.parse(xml) as unknown)),
        Effect.flatMap(Schema.decodeUnknownEffect(Feed)),
        Effect.map((doc) => (doc.feed.entry ?? []).map(toChannelVideo)),
        Effect.mapError(
          (cause) =>
            new VideosUnavailable({
              message: `Could not read the YouTube channel ${channelId}: ${String(cause)}`,
              cause,
            }),
        ),
      ),
  });

  /**
   * Test layer: the Videos of each known channel. Any other channel fails
   * with `VideosUnavailable`, as the feed does for an unknown channel.
   */
  static readonly layerTest = (
    channels: Readonly<Record<string, ReadonlyArray<ChannelVideo>>>,
  ) =>
    Layer.succeed(YouTubeChannel, {
      latestVideos: (channelId) =>
        Object.hasOwn(channels, channelId)
          ? Effect.succeed(channels[channelId]!)
          : Effect.fail(
              new VideosUnavailable({
                message: `No feed for the YouTube channel ${channelId}`,
              }),
            ),
    });
}
