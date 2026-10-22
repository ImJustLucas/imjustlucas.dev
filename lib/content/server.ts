import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { Effect, Layer, ManagedRuntime } from "effect";

import type { Locale } from "@/i18n/routing";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubContributions } from "./github-contributions";
import { GitHubStars } from "./github-stars";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import "server-only";

/**
 * Entry point for pages (server components). Runs the content catalog over
 * the local content folder and the external sources (GitHub stars and
 * Contributions, YouTube channel feed), and returns plain data, so React code never imports Effect
 * (ADR-0002). A rejection fails the build, or, when a page revalidates, keeps
 * the previous page being served.
 *
 * The content folder is read from `process.cwd()` at runtime too: pages that
 * revalidate need it traced into their function (`outputFileTracingIncludes`
 * in `next.config.ts`).
 */
const runtime = ManagedRuntime.make(
  ContentCatalog.layer.pipe(
    Layer.provide(layerLocalFilesystem(process.cwd())),
    Layer.provide(GitHubStars.layer(process.env.GITHUB_TOKEN)),
    Layer.provide(GitHubContributions.layer(process.env.GITHUB_TOKEN)),
    Layer.provide(YouTubeChannel.layer),
  ),
);

/**
 * `next build` is prerendering: a cold build, with no previous page to keep.
 * Anything else (a runtime revalidation, `next dev`) is a revalidation.
 */
const pageGeneration = (): PageGeneration =>
  process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
    ? "cold-build"
    : "revalidation";

const fromCatalog = <A, E>(
  select: (catalog: ContentCatalog["Service"]) => Effect.Effect<A, E>,
) =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* select(yield* ContentCatalog);
    }).pipe(Effect.provideService(PageGeneration, pageGeneration())),
  );

/**
 * Projects, their descriptions in the Locale, with live star counts, omitted
 * on a cold build when GitHub fails. The page declares
 * `dynamic = "force-static"` and `revalidate = 86400` (see
 * `fetchExternalText`).
 */
export const getProjects = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).projects);

/**
 * The Projects the home page features (at most 3, by their place, then by
 * Period), their descriptions in the Locale, with live star counts like
 * `getProjects`, so the page revalidates the same way.
 */
export const getFeaturedProjects = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).featuredProjects);

/**
 * The Project with this slug, its texts in the Locale, with its live star
 * count like `getProjects`, so its page revalidates the same way; none for
 * an unknown slug.
 */
export const getProject = (locale: Locale, slug: string) =>
  fromCatalog((catalog) => catalog.inLocale(locale).project(slug));

/** Every Project's slug, for the Project pages' static params. */
export const getProjectSlugs = () =>
  fromCatalog((catalog) => catalog.projectSlugs);

/**
 * Every Project's slug, title and rarity, for the quick menu in the Locale
 * layout; reads no star count, so the layout never revalidates.
 */
export const getProjectEntries = () =>
  fromCatalog((catalog) => catalog.projectEntries);

/** Experiences, their roles and descriptions in the Locale. */
export const getExperiences = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).experiences);

/**
 * Achievements, their names and descriptions in the Locale, in the order the
 * Owner gave them.
 */
export const getAchievements = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).achievements);

/** Hobbies, their labels in the Locale, in the order the Owner gave them. */
export const getHobbies = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).hobbies);

/** The site's patch notes, newest version first, their texts in the Locale. */
export const getPatchNotes = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).patchNotes);

/** The site's current version: the newest Patch's; none without one. */
export const getCurrentVersion = () =>
  fromCatalog((catalog) =>
    Effect.map(catalog.patchNotes, ([latest]) => latest?.version),
  );

/** Lucas's public identity: social links, channel, Discord account, Resumes. */
export const getProfile = () => fromCatalog((catalog) => catalog.profile);

/** The Profile's Resume in the Locale: its PDF and last-updated date. */
export const getResume = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).resume);

/**
 * The Profile's channel's latest Videos, most recent first; none (the page's
 * empty state) when the channel cannot be read on a cold build. The page
 * declares `dynamic = "force-static"` and `revalidate = 86400`. Video titles
 * are not translated.
 */
export const getVideos = () => fromCatalog((catalog) => catalog.videos);

/**
 * Lucas's Level, Streak and recent weeks from his GitHub Contributions; none
 * without a `GITHUB_TOKEN` or, on a cold build, when GitHub fails. The home
 * page declares `dynamic = "force-static"` and `revalidate = 3600`, so the
 * Streak follows the day within the hour.
 */
export const getLevel = () => fromCatalog((catalog) => catalog.level);
