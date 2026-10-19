import { Context, Effect, Layer, Schema, SchemaIssue } from "effect";

import {
  ContentInvalid,
  type ContentIssue,
  type ContentNotFound,
  type ContentRepositoryError,
} from "./errors";
import { byStartMostRecentFirst, type Period } from "./period";
import { ContentRepository } from "./repository";
import {
  Content,
  DOCUMENT_PATHS,
  type Experience,
  type LocalizedText,
  type Tech,
} from "./schema";

/** A Tech category as pages render it: its Techs resolved, in order. */
export type ResolvedTechCategory = {
  readonly name: LocalizedText;
  readonly description: LocalizedText;
  readonly techs: ReadonlyArray<Tech>;
};

/** A Project as pages render it: its Techs resolved, its links checked. */
export type ResolvedProject = {
  readonly title: string;
  readonly description: LocalizedText;
  readonly image?: string;
  readonly wip: boolean;
  readonly period: Period;
  readonly techs: ReadonlyArray<Tech>;
  readonly externalLink?: string;
  /** Only for an open-source Project with a repository link. */
  readonly repository?: string;
  /** Only when there is at least one star. */
  readonly stars?: number;
};

/** An Experience as pages render it. */
export type ResolvedExperience = Experience;

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
    /** Ordered by Period start, most recent first; ongoing first on ties. */
    readonly projects: Effect.Effect<
      ReadonlyArray<ResolvedProject>,
      CatalogError
    >;
    /** Ordered by Period start, most recent first; ongoing first on ties. */
    readonly experiences: Effect.Effect<
      ReadonlyArray<ResolvedExperience>,
      CatalogError
    >;
  }
>()("content/ContentCatalog") {
  /** Needs a `ContentRepository`. */
  static readonly layer = Layer.effect(
    ContentCatalog,
    Effect.gen(function* () {
      const repository = yield* ContentRepository;
      const load = loadContent(repository);

      return {
        techCategories: Effect.map(load, (content) => {
          const resolve = techResolver(content);
          return content.techCategories.map((category) => ({
            name: category.name,
            description: category.description,
            techs: category.techs.map(resolve),
          }));
        }),

        projects: Effect.map(load, (content) => {
          const resolve = techResolver(content);
          return [...content.projects]
            .sort((a, b) => byStartMostRecentFirst(a.period, b.period))
            .map(
              (project): ResolvedProject => ({
                title: project.title,
                description: project.description,
                ...(project.image && { image: project.image }),
                wip: project.wip,
                period: project.period,
                techs: project.techs.map(resolve),
                ...(project.externalLink && {
                  externalLink: project.externalLink,
                }),
                ...(project.openSource &&
                  project.repository && { repository: project.repository }),
                ...(project.stars && { stars: project.stars }),
              }),
            );
        }),

        experiences: Effect.map(load, (content) =>
          [...content.experiences].sort((a, b) =>
            byStartMostRecentFirst(a.period, b.period),
          ),
        ),
      };
    }),
  );
}

/** Every id exists: `Content` rejects unknown Techs. */
const techResolver = (content: Content) => {
  const techs = new Map(content.techs.map((tech) => [tech.id, tech]));
  return (id: Tech["id"]) => techs.get(id)!;
};

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
