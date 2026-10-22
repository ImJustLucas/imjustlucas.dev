import { Clock, Context, Effect, Layer, Schema, SchemaIssue } from "effect";

import type { Locale } from "@/i18n/routing";
import { parisDay } from "@/lib/paris-time";

import {
  ContentInvalid,
  type ContentIssue,
  type ContentNotFound,
  type ContentRepositoryError,
  type VideosUnavailable,
} from "./errors";
import { orOnColdBuild } from "./external-source";
import {
  GitHubContributions,
  type GitHubContributionsUnavailable,
} from "./github-contributions";
import { GitHubStars, type GitHubStarsUnavailable } from "./github-stars";
import { byVersionNewestFirst } from "./patch-version";
import { byStartMostRecentFirst, type Period } from "./period";
import { type PlayerLevel, playerLevel } from "./player-level";
import { ContentRepository, type Revision } from "./repository";
import {
  type Achievement,
  Content,
  DOCUMENT_PATHS,
  type Experience,
  type Hobby,
  type HobbyPose,
  type LocalizedText,
  type Patch,
  type PatchTag,
  type Profile,
  type Project,
  type Rarity,
  type Resume,
  type Tech,
} from "./schema";
import { type ChannelVideo, YouTubeChannel } from "./youtube-channel";

/** A Video as pages render it. */
export type Video = ChannelVideo & {
  /** Only the most recent Video, while less than 30 days old. */
  readonly isNew: boolean;
};

const NEW_VIDEO_AGE = 30 * 24 * 60 * 60 * 1000;

/** A Project as pages render it: its Techs resolved, its links checked. */
export type ResolvedProject = {
  /** Its page's last path segment: `/what/<slug>`. */
  readonly slug: string;
  readonly title: string;
  readonly description: LocalizedText;
  readonly image?: string;
  readonly wip: boolean;
  readonly period: Period;
  readonly techs: ReadonlyArray<Tech>;
  readonly externalLink?: string;
  /**
   * Only for an open-source Project: its repository, or else the Profile's
   * GitHub link.
   */
  readonly repository?: string;
  /** The repository's GitHub star count, only when there is at least one. */
  readonly stars?: number;
  readonly rarity: Rarity;
  /** Its place on the home page, 1 first; absent: not featured. */
  readonly featured?: number;
  /** What Lucas was on it. */
  readonly role?: LocalizedText;
  /** Long texts of its page, paragraphs separated by a blank line. */
  readonly context?: LocalizedText;
  readonly built?: LocalizedText;
  readonly outcome?: LocalizedText;
  /** More screenshots, after the main image; none: empty. */
  readonly gallery: ReadonlyArray<string>;
};

/** The texts of a Project that are in every Locale. */
type ProjectTexts = "description" | "role" | "context" | "built" | "outcome";

/** How many Projects the home page features, at most. */
const FEATURED_PROJECTS = 3;

/**
 * A Project as the quick menu lists it: enough to find it and open its page,
 * read without any star count.
 */
export type ProjectEntry = Pick<Project, "slug" | "title" | "rarity">;

/** An Experience as pages render it. */
export type ResolvedExperience = Experience;

/** A Project in one Locale: its texts in that Locale. */
export type ProjectInLocale = Omit<ResolvedProject, ProjectTexts> & {
  readonly description: string;
  readonly role?: string;
  readonly context?: string;
  readonly built?: string;
  readonly outcome?: string;
};

/** An Experience in one Locale: its role and description in that Locale. */
export type ExperienceInLocale = Omit<
  ResolvedExperience,
  "role" | "description"
> & {
  readonly role: string;
  readonly description: string;
};

/** An Achievement in one Locale: its name and description in that Locale. */
export type AchievementInLocale = {
  readonly name: string;
  readonly description: string;
  readonly year: number;
  readonly rarity: Rarity;
  /** A page of the site (without Locale, e.g. `/mdf-2025`) or a URL. */
  readonly link: string;
  /** The art's URL path, under `public/`. */
  readonly art: string;
};

/** A Hobby in one Locale: its label in that Locale. */
export type HobbyInLocale = {
  readonly label: string;
  readonly pose: HobbyPose;
};

/** A Patch in one Locale: its title and lines in that Locale. */
export type PatchInLocale = {
  readonly version: string;
  /** `YYYY-MM-DD`. */
  readonly date: string;
  readonly title: string;
  readonly entries: ReadonlyArray<{
    readonly tag: PatchTag;
    readonly text: string;
  }>;
  readonly link?: string;
};

/**
 * The content of one Locale, as pages render it: every descriptive text in
 * that Locale; proper nouns (titles, Tech names) as they are.
 */
export type CatalogInLocale = {
  /** Ordered by Period start, most recent first; ongoing first on ties. */
  readonly projects: Effect.Effect<
    ReadonlyArray<ProjectInLocale>,
    CatalogError | GitHubStarsUnavailable
  >;
  /**
   * The Projects the home page features, at most 3: by their `featured`
   * place, then by Period like `projects`.
   */
  readonly featuredProjects: Effect.Effect<
    ReadonlyArray<ProjectInLocale>,
    CatalogError | GitHubStarsUnavailable
  >;
  /**
   * The Project with this slug, for its page (star count read for it only);
   * none for an unknown slug.
   */
  readonly project: (
    slug: string,
  ) => Effect.Effect<
    ProjectInLocale | undefined,
    CatalogError | GitHubStarsUnavailable
  >;
  /** Ordered by Period start, most recent first; ongoing first on ties. */
  readonly experiences: Effect.Effect<
    ReadonlyArray<ExperienceInLocale>,
    CatalogError
  >;
  /** In stored order, the order the Owner gave them. */
  readonly achievements: Effect.Effect<
    ReadonlyArray<AchievementInLocale>,
    CatalogError
  >;
  /** In stored order, the order the Owner gave them. */
  readonly hobbies: Effect.Effect<ReadonlyArray<HobbyInLocale>, CatalogError>;
  /** By version, newest first. */
  readonly patchNotes: Effect.Effect<
    ReadonlyArray<PatchInLocale>,
    CatalogError
  >;
  /** The Profile's Resume in this Locale. */
  readonly resume: Effect.Effect<Resume, CatalogError>;
  /** What the recruiter mode says of Lucas, from the Profile, in this Locale. */
  readonly recruiter: Effect.Effect<RecruiterInLocale, CatalogError>;
};

/** The Profile's recruiter texts in one Locale. */
export type RecruiterInLocale = {
  readonly summary: string;
  readonly availability: string;
  readonly languages: ReadonlyArray<{
    readonly code: string;
    readonly name: string;
    readonly level: string;
  }>;
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
    /** Ordered by Period start, most recent first; ongoing first on ties. */
    readonly projects: Effect.Effect<
      ReadonlyArray<ResolvedProject>,
      CatalogError | GitHubStarsUnavailable
    >;
    /** Every Project's slug, ordered like `projects`; reads no star count. */
    readonly projectSlugs: Effect.Effect<ReadonlyArray<string>, CatalogError>;
    /** Every Project's slug, title and rarity, ordered like `projects`; reads no star count. */
    readonly projectEntries: Effect.Effect<
      ReadonlyArray<ProjectEntry>,
      CatalogError
    >;
    /** Ordered by Period start, most recent first; ongoing first on ties. */
    readonly experiences: Effect.Effect<
      ReadonlyArray<ResolvedExperience>,
      CatalogError
    >;
    /** In stored order. */
    readonly achievements: Effect.Effect<
      ReadonlyArray<Achievement>,
      CatalogError
    >;
    /** In stored order. */
    readonly hobbies: Effect.Effect<ReadonlyArray<Hobby>, CatalogError>;
    /** By version, newest first. */
    readonly patchNotes: Effect.Effect<ReadonlyArray<Patch>, CatalogError>;
    /** The Profile's channel's latest Videos, most recent first. */
    readonly videos: Effect.Effect<
      ReadonlyArray<Video>,
      VideosUnavailable | CatalogError
    >;
    /**
     * Lucas's Level, from the Contributions of the Profile's GitHub account,
     * with his Streak on today in Paris; none without a GitHub token.
     */
    readonly level: Effect.Effect<
      PlayerLevel | undefined,
      GitHubContributionsUnavailable | CatalogError
    >;
    /** Lucas's public identity: links, channel, Discord account, Resumes. */
    readonly profile: Effect.Effect<Profile, CatalogError>;
    /** The same content with its texts in one Locale, for public pages. */
    readonly inLocale: (locale: Locale) => CatalogInLocale;
  }
>()("content/ContentCatalog") {
  /**
   * Needs a `ContentRepository` and the external sources `GitHubStars`,
   * `GitHubContributions` and `YouTubeChannel`. A failing source fails the
   * catalog, except on a cold build (see `PageGeneration`).
   */
  static readonly layer = Layer.effect(
    ContentCatalog,
    Effect.gen(function* () {
      const repository = yield* ContentRepository;
      const stars = yield* GitHubStars;
      const channel = yield* YouTubeChannel;
      const contributions = yield* GitHubContributions;
      const load = loadContent(repository);

      /**
       * Resolves the Projects `select` picks from those ordered by Period,
       * reading star counts for those only.
       */
      const resolvedProjects = (
        select: (byPeriod: ReadonlyArray<Project>) => ReadonlyArray<Project> = (
          byPeriod,
        ) => byPeriod,
      ) =>
        Effect.flatMap(load, (content) => {
          const resolve = techResolver(content);
          const byPeriod = projectsByPeriod(content);
          return Effect.forEach(
            select(byPeriod),
            (project) => {
              // Stars only for the Project's own repository, never for the
              // Profile's GitHub link it falls back to.
              const repository = project.openSource
                ? project.repository
                : undefined;
              const resolved: ResolvedProject = {
                slug: project.slug,
                title: project.title,
                description: project.description,
                ...(project.image && { image: project.image }),
                wip: project.wip,
                period: project.period,
                techs: project.techs.map(resolve),
                ...(project.externalLink && {
                  externalLink: project.externalLink,
                }),
                ...(project.openSource && {
                  repository: repository ?? content.profile.links.github,
                }),
                rarity: project.rarity,
                ...(project.featured !== undefined && {
                  featured: project.featured,
                }),
                ...(project.role && { role: project.role }),
                ...(project.context && { context: project.context }),
                ...(project.built && { built: project.built }),
                ...(project.outcome && { outcome: project.outcome }),
                gallery: project.gallery ?? [],
              };
              if (!repository) return Effect.succeed(resolved);
              // No star count shown for a repository GitHub fails to give
              // on a cold build.
              return Effect.map(
                stars.count(repository).pipe(orOnColdBuild(0)),
                (count): ResolvedProject =>
                  count > 0 ? { ...resolved, stars: count } : resolved,
              );
            },
            { concurrency: "unbounded" },
          );
        });

      const projects = resolvedProjects();

      // The sort is stable: equal places keep their Period order.
      const featuredProjects = resolvedProjects((byPeriod) =>
        byPeriod
          .filter((project) => project.featured !== undefined)
          .sort((a, b) => a.featured! - b.featured!)
          .slice(0, FEATURED_PROJECTS),
      );

      const projectSlugs = Effect.map(load, (content) =>
        projectsByPeriod(content).map((project) => project.slug),
      );

      const projectEntries = Effect.map(load, (content) =>
        projectsByPeriod(content).map(
          ({ slug, title, rarity }): ProjectEntry => ({ slug, title, rarity }),
        ),
      );

      const experiences = Effect.map(load, (content) =>
        [...content.experiences].sort((a, b) =>
          byStartMostRecentFirst(a.period, b.period),
        ),
      );

      const videos = Effect.gen(function* () {
        const { profile } = yield* load;
        // No Videos (the page's empty state) on a cold build.
        const videos = yield* channel
          .latestVideos(profile.youtubeChannelId)
          .pipe(orOnColdBuild([]));
        const now = yield* Clock.currentTimeMillis;
        return [...videos]
          .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
          .map((video, i) => ({
            ...video,
            isNew:
              i === 0 && now - Date.parse(video.publishedAt) < NEW_VIDEO_AGE,
          }));
      });

      const level = Effect.gen(function* () {
        const { profile } = yield* load;
        const login = new URL(profile.links.github).pathname.split("/")[1]!;
        // No Level shown on a cold build.
        const history = yield* contributions
          .history(login)
          .pipe(orOnColdBuild(undefined));
        if (!history) return undefined;
        const now = yield* Clock.currentTimeMillis;
        return playerLevel(history, parisDay(new Date(now)));
      });

      const profile = Effect.map(load, (content) => content.profile);
      const achievements = Effect.map(load, (content) => content.achievements);
      const hobbies = Effect.map(load, (content) => content.hobbies);
      const patchNotes = Effect.map(load, (content) =>
        [...content.patchNotes].sort((a, b) =>
          byVersionNewestFirst(a.version, b.version),
        ),
      );

      return {
        projects,
        projectSlugs,
        projectEntries,
        experiences,
        videos,
        level,
        profile,
        achievements,
        hobbies,
        patchNotes,
        inLocale: (locale): CatalogInLocale => {
          const projectInLocale = ({
            description,
            role,
            context,
            built,
            outcome,
            ...project
          }: ResolvedProject): ProjectInLocale => ({
            ...project,
            description: description[locale],
            ...(role && { role: role[locale] }),
            ...(context && { context: context[locale] }),
            ...(built && { built: built[locale] }),
            ...(outcome && { outcome: outcome[locale] }),
          });
          return {
            projects: Effect.map(projects, (all) => all.map(projectInLocale)),
            featuredProjects: Effect.map(featuredProjects, (all) =>
              all.map(projectInLocale),
            ),
            project: (slug) =>
              Effect.map(
                resolvedProjects((byPeriod) =>
                  byPeriod.filter((project) => project.slug === slug),
                ),
                ([project]) => project && projectInLocale(project),
              ),
            experiences: Effect.map(experiences, (all) =>
              all.map((experience) => ({
                ...experience,
                role: experience.role[locale],
                description: experience.description[locale],
              })),
            ),
            achievements: Effect.map(achievements, (all) =>
              all.map((achievement) => ({
                ...achievement,
                name: achievement.name[locale],
                description: achievement.description[locale],
              })),
            ),
            hobbies: Effect.map(hobbies, (all) =>
              all.map((hobby) => ({ ...hobby, label: hobby.label[locale] })),
            ),
            patchNotes: Effect.map(patchNotes, (all) =>
              all.map((patch) => ({
                ...patch,
                title: patch.title[locale],
                entries: patch.entries.map((entry) => ({
                  tag: entry.tag,
                  text: entry.text[locale],
                })),
              })),
            ),
            resume: Effect.map(profile, (profile) => profile.resumes[locale]),
            recruiter: Effect.map(profile, (profile) => ({
              summary: profile.summary[locale],
              availability: profile.availability[locale],
              languages: profile.languages.map((language) => ({
                code: language.code,
                name: language.name[locale],
                level: language.level[locale],
              })),
            })),
          };
        },
      };
    }),
  );
}

/** The stored Projects ordered by Period, most recent first. */
const projectsByPeriod = (content: Content) =>
  [...content.projects].sort((a, b) =>
    byStartMostRecentFirst(a.period, b.period),
  );

/** Every id exists: `Content` rejects unknown Techs. */
const techResolver = (content: Content) => {
  const techs = new Map(content.techs.map((tech) => [tech.id, tech]));
  return (id: Tech["id"]) => techs.get(id)!;
};

type Kind = keyof typeof DOCUMENT_PATHS;
const KINDS = Object.keys(DOCUMENT_PATHS) as ReadonlyArray<Kind>;

/**
 * Reads every content document, at `revision` (by default the current one),
 * and decodes them as one `Content`. The Admin reads through it too, so it
 * edits exactly what the catalog validates.
 */
export const loadContent = (
  repository: ContentRepository["Service"],
  revision?: Revision,
): Effect.Effect<Content, CatalogError> =>
  Effect.gen(function* () {
    const documents: Partial<Record<Kind, unknown>> = {};
    const issues: Array<ContentIssue> = [];

    for (const kind of KINDS) {
      const path = DOCUMENT_PATHS[kind];
      const text = yield* repository.read(path, revision);
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
