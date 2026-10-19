import { Clock, Context, Effect, Layer, Schema, SchemaIssue } from "effect";

import {
  ContentInvalid,
  type ContentIssue,
  type ContentNotFound,
  type ContentRepositoryError,
  type VideosUnavailable,
} from "./errors";
import { ContentRepository } from "./repository";
import {
  Content,
  DOCUMENT_PATHS,
  type LocalizedText,
  type Tech,
} from "./schema";
import { type ChannelVideo, YouTubeChannel } from "./youtube-channel";

/** The YouTube channel the Videos come from. Moves to the Profile (#13). */
export const YOUTUBE_CHANNEL_ID = "UCLw4N_gccAY1Y4K4S20IPog";

/** A Video as pages render it. */
export type Video = ChannelVideo & {
  /** Only the most recent Video, while less than 30 days old. */
  readonly isNew: boolean;
};

const NEW_VIDEO_AGE = 30 * 24 * 60 * 60 * 1000;

/** A Tech category as pages render it: its Techs resolved, in order. */
export type ResolvedTechCategory = {
  readonly name: LocalizedText;
  readonly description: LocalizedText;
  readonly techs: ReadonlyArray<Tech>;
};

export type CatalogError =
  | ContentInvalid
  | ContentNotFound
  | ContentRepositoryError;

/**
 * The only way pages obtain content. Reads the content documents, validates
 * them (schemas and cross-document rules) and returns ready-to-render data.
 */
export class ContentCatalog extends Context.Service<
  ContentCatalog,
  {
    readonly techCategories: Effect.Effect<
      ReadonlyArray<ResolvedTechCategory>,
      CatalogError
    >;
    /** The channel's latest Videos, most recent first. */
    readonly videos: Effect.Effect<ReadonlyArray<Video>, VideosUnavailable>;
  }
>()("content/ContentCatalog") {
  /** Needs a `ContentRepository` and the `YouTubeChannel` source. */
  static readonly layer = Layer.effect(
    ContentCatalog,
    Effect.gen(function* () {
      const repository = yield* ContentRepository;
      const channel = yield* YouTubeChannel;
      const load = loadContent(repository);

      return {
        techCategories: Effect.map(load, (content) => {
          const techs = new Map(content.techs.map((tech) => [tech.id, tech]));
          return content.techCategories.map((category) => ({
            name: category.name,
            description: category.description,
            // Every id exists: `Content` rejects unknown Techs.
            techs: category.techs.map((id) => techs.get(id)!),
          }));
        }),

        videos: Effect.gen(function* () {
          const videos = yield* channel.latestVideos(YOUTUBE_CHANNEL_ID);
          const now = yield* Clock.currentTimeMillis;
          return [...videos]
            .sort(
              (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
            )
            .map((video, i) => ({
              ...video,
              isNew:
                i === 0 && now - Date.parse(video.publishedAt) < NEW_VIDEO_AGE,
            }));
        }),
      };
    }),
  );
}

type Kind = keyof typeof DOCUMENT_PATHS;
const KINDS = Object.keys(DOCUMENT_PATHS) as ReadonlyArray<Kind>;

/** Reads every content document and decodes them as one `Content`. */
const loadContent = (
  repository: ContentRepository["Service"],
): Effect.Effect<Content, CatalogError> =>
  Effect.gen(function* () {
    const documents: Partial<Record<Kind, unknown>> = {};
    const issues: Array<ContentIssue> = [];

    for (const kind of KINDS) {
      const path = DOCUMENT_PATHS[kind];
      const text = yield* repository.read(path);
      try {
        documents[kind] = JSON.parse(text);
      } catch (error) {
        issues.push({ path, at: "", message: String(error) });
      }
    }
    if (issues.length > 0) return yield* new ContentInvalid({ issues });

    return yield* Schema.decodeUnknownEffect(Content)(documents, {
      errors: "all",
    }).pipe(
      Effect.mapError(
        (error) => new ContentInvalid({ issues: toContentIssues(error) }),
      ),
    );
  });

const formatter = SchemaIssue.makeFormatterStandardSchemaV1();

/** Maps schema issues to the content file and location they come from. */
const toContentIssues = (
  error: Schema.SchemaError,
): ReadonlyArray<ContentIssue> =>
  formatter(error.issue).issues.map((issue) => {
    const [kind, ...rest] = (issue.path ?? []).map((segment) =>
      typeof segment === "object" ? segment.key : segment,
    );
    return {
      path: DOCUMENT_PATHS[kind as Kind] ?? "content",
      at: rest
        .map((segment) =>
          typeof segment === "number" ? `[${segment}]` : `.${String(segment)}`,
        )
        .join("")
        .replace(/^\./, ""),
      message: issue.message,
    };
  });
