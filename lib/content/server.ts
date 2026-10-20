import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { Effect, Layer, ManagedRuntime } from "effect";

import type { Locale } from "@/i18n/routing";

import { ContentCatalog } from "./catalog";
import { PageGeneration } from "./external-source";
import { GitHubStars } from "./github-stars";
import { layerLocalFilesystem } from "./repository-local-filesystem";
import { YouTubeChannel } from "./youtube-channel";

import "server-only";

/**
 * Entry point for pages (server components). Runs the content catalog over
 * the local content folder and the external sources (GitHub stars, YouTube
 * channel feed), and returns plain data, so React code never imports Effect
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
    Layer.provide(GitHubStars.layer),
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

/** Tech categories, their names and descriptions in the Locale. */
export const getTechCategories = (locale: Locale) =>
  fromCatalog((catalog) => catalog.inLocale(locale).techCategories);

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
