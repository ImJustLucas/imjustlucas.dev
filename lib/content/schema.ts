import { Schema } from "effect";

import { PATCH_VERSION } from "./patch-version";
import { Period } from "./period";

/** A translation: a non-empty string, reported as missing otherwise. */
const Translation = Schema.String.check(
  Schema.isNonEmpty({ message: "Missing translation" }),
).pipe(Schema.annotateKey({ messageMissingKey: "Missing translation" }));

/** Descriptive text, in every Locale. */
export const LocalizedText = Schema.Struct({
  en: Translation,
  fr: Translation,
});
export type LocalizedText = typeof LocalizedText.Type;

/** Stable identifier of a Tech, referenced by Projects. */
export const TechId = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: "Expected a lowercase kebab-case identifier",
  }),
).pipe(Schema.brand("TechId"));
export type TechId = typeof TechId.Type;

/** Display colour, as a `#rrggbb` hex string. */
export const Color = Schema.String.check(
  Schema.isPattern(/^#[0-9a-fA-F]{6}$/, {
    message: "Expected a #rrggbb colour",
  }),
);

export const Tech = Schema.Struct({
  id: TechId,
  name: Schema.NonEmptyString,
  color: Color,
});
export type Tech = typeof Tech.Type;

const HTTP_URL = /^https?:\/\/\S+$/;

/** An absolute `http(s)` URL. */
export const Url = Schema.String.check(
  Schema.isPattern(HTTP_URL, { message: "Expected an http(s) URL" }),
);

/** A public GitHub repository, as `https://github.com/<owner>/<name>`. */
export const GitHubRepository = Schema.String.check(
  Schema.isPattern(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, {
    message: "Expected https://github.com/<owner>/<repository>",
  }),
);

/**
 * A file of one folder of the public assets, by its URL path: a plain file
 * name (no sub-folder, no `..`) with one of `extensions`. The Admin commits
 * uploads to `public<path>`, so nothing else under the repository is ever
 * reachable through one.
 */
const assetIn = (
  folder: string,
  extensions: string,
  message: string,
): Schema.Codec<string> =>
  Schema.String.check(
    Schema.isPattern(new RegExp(`^${assetPattern(folder, extensions)}$`), {
      message,
    }),
  );

/** The pattern of a plain file of `folder` with one of `extensions`. */
const assetPattern = (folder: string, extensions: string) =>
  `${folder}(?!.*\\.\\.)[a-z0-9][a-z0-9._-]*\\.(${extensions})`;

/** A Project image, e.g. `/images/projects/predi.png`. */
export const ProjectImagePath = assetIn(
  "/images/projects/",
  "png|jpe?g|webp|avif",
  "Expected an image (PNG, JPEG, WebP or AVIF) in /images/projects/",
);

/** A Resume PDF, e.g. `/pdf/cv-lucas.pdf`. */
export const ResumePath = assetIn("/pdf/", "pdf", "Expected a PDF in /pdf/");

/**
 * What kind of thing a Project or Achievement is, set by the Owner: a common
 * side project, rare shipped work, an epic founded product, a legendary
 * national win. Never a quality score.
 */
export const Rarity = Schema.Literals(["common", "rare", "epic", "legendary"]);
export type Rarity = typeof Rarity.Type;

/** A place in a list, from 1 (the first). */
const Place = Schema.Number.check(
  Schema.makeFilter((place) =>
    Number.isInteger(place) && place > 0
      ? undefined
      : "Expected a whole number from 1",
  ),
);

/**
 * Stable identifier of a Project: its page's last path segment, e.g.
 * `predi-gg` for `/what/predi-gg`.
 */
export const ProjectSlug = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: "Expected a lowercase kebab-case identifier",
  }),
);

export const Project = Schema.Struct({
  slug: ProjectSlug,
  /** Not translated: a proper noun. */
  title: Schema.NonEmptyString,
  description: LocalizedText,
  image: Schema.optionalKey(ProjectImagePath),
  /** Work in progress. */
  wip: Schema.Boolean,
  period: Period,
  techs: Schema.Array(TechId),
  /** The Project's site. */
  externalLink: Schema.optionalKey(Url),
  /** Its star count is read from GitHub, never stored. */
  repository: Schema.optionalKey(GitHubRepository),
  openSource: Schema.Boolean,
  rarity: Rarity,
  /**
   * Its place among the Projects the home page features, 1 first; absent:
   * not featured.
   */
  featured: Schema.optionalKey(Place),
  /*
   * The Project's own page. Every field is optional: the page reads well with
   * none of them. Long texts are paragraphs separated by a blank line.
   */
  /** What Lucas was on it, e.g. "Founder and lead developer". */
  role: Schema.optionalKey(LocalizedText),
  /** Why it exists: the context or problem. */
  context: Schema.optionalKey(LocalizedText),
  /** What Lucas built. */
  built: Schema.optionalKey(LocalizedText),
  /** Where it got: users, results, what was learnt. */
  outcome: Schema.optionalKey(LocalizedText),
  /** More screenshots, after the main image, in order. */
  gallery: Schema.optionalKey(Schema.Array(ProjectImagePath)),
});
export type Project = typeof Project.Type;

/** How an Experience was held; its label lives in the message dictionaries. */
export const ContractType = Schema.Literals([
  "entrepreneurship",
  "permanent",
  "work-study",
  "internship",
]);
export type ContractType = typeof ContractType.Type;

export const Experience = Schema.Struct({
  /** Not translated: a proper noun. */
  company: Schema.NonEmptyString,
  role: LocalizedText,
  contractType: ContractType,
  /** The company's site. */
  link: Url,
  description: LocalizedText,
  period: Period,
  /** Shown before the company on the home page, e.g. `🔮`. */
  emoji: Schema.optionalKey(
    Schema.String.check(
      Schema.makeFilter((emoji) =>
        emoji.length > 0 && emoji.length <= 8
          ? undefined
          : "Expected an emoji (at most 8 characters)",
      ),
    ),
  ),
});
export type Experience = typeof Experience.Type;

/** What Lucas does when he isn't working, as his chibi avatar shows it. */
export const HobbyPose = Schema.Literals([
  "surf",
  "skate",
  "lol",
  "coding",
  "coffee",
  "series",
  "music",
  "football",
  "tennis",
]);
export type HobbyPose = typeof HobbyPose.Type;

export const Hobby = Schema.Struct({
  label: LocalizedText,
  pose: HobbyPose,
});
export type Hobby = typeof Hobby.Type;

/**
 * An Achievement's art: an image of `/images/achievements/` (what the Admin
 * uploads), or a chibi pose of `/images/chibi/` (WebP or PNG).
 */
export const AchievementArtPath = Schema.String.check(
  Schema.isPattern(
    new RegExp(
      `^(${assetPattern("/images/achievements/", "png|jpe?g|webp|avif")}|${assetPattern("/images/chibi/", "webp|png")})$`,
    ),
    {
      message:
        "Expected an image (PNG, JPEG, WebP or AVIF) in /images/achievements/, or a WebP or PNG in /images/chibi/",
    },
  ),
);

/** A page of the site, by its path without Locale, e.g. `/mdf-2025`. */
const SITE_PATH = /^\/[a-z0-9-]*(\/[a-z0-9-]+)*$/;

export const Achievement = Schema.Struct({
  name: LocalizedText,
  description: LocalizedText,
  year: Schema.Number.check(
    Schema.makeFilter((year) =>
      Number.isInteger(year) && year >= 2000 && year <= 2100
        ? undefined
        : "Expected a year from 2000 to 2100",
    ),
  ),
  rarity: Rarity,
  /** A page of the site (e.g. `/mdf-2025`) or an http(s) URL. */
  link: Schema.String.check(
    Schema.makeFilter((link) =>
      SITE_PATH.test(link) || HTTP_URL.test(link)
        ? undefined
        : "Expected a page of the site (/…) or an http(s) URL",
    ),
  ),
  art: AchievementArtPath,
});
export type Achievement = typeof Achievement.Type;

/** A calendar day, as `YYYY-MM-DD`. */
export const CalendarDate = Schema.String.check(
  Schema.makeFilter((date) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().startsWith(date)
      ? undefined
      : "Expected a date (YYYY-MM-DD)",
  ),
);

/** One Locale's Resume: a PDF of the public assets folder. */
export const Resume = Schema.Struct({
  asset: ResumePath,
  lastUpdated: CalendarDate,
}).pipe(
  Schema.annotateKey({ messageMissingKey: "Missing Resume for this Locale" }),
);
export type Resume = typeof Resume.Type;

/** A YouTube channel identifier, e.g. `UCLw4N_gccAY1Y4K4S20IPog`. */
export const YouTubeChannelId = Schema.String.check(
  Schema.isPattern(/^UC[\w-]{22}$/, {
    message: "Expected a YouTube channel identifier (UC…)",
  }),
);

/** A Discord account identifier (a snowflake), e.g. `127063570616811520`. */
export const DiscordUserId = Schema.String.check(
  Schema.isPattern(/^\d{17,20}$/, {
    message: "Expected a Discord account identifier",
  }),
);

/** The canonical URL of a YouTube channel. */
export const youtubeChannelUrl = (channelId: string) =>
  `https://www.youtube.com/channel/${channelId}`;

/** A language's code (BCP 47), e.g. `fr`, `en` or `pt-BR`. */
export const LanguageCode = Schema.String.check(
  Schema.isPattern(/^[a-z]{2,3}(-[A-Z]{2})?$/, {
    message: "Expected a language code (BCP 47)",
  }),
);

/**
 * A language Lucas speaks, as the recruiter mode lists it: its name and his
 * level in every Locale, and its code for structured data.
 */
export const SpokenLanguage = Schema.Struct({
  code: LanguageCode,
  name: LocalizedText,
  level: LocalizedText,
});
export type SpokenLanguage = typeof SpokenLanguage.Type;

/**
 * Lucas's public identity, defined once: social links, the YouTube channel
 * the Videos come from, the Discord account Presence follows, one Resume
 * per Locale, and what the recruiter mode says of him (his summary, his
 * availability, the languages he speaks). The YouTube link is the channel's
 * own URL, so they can't drift.
 */
export const Profile = Schema.Struct({
  links: Schema.Struct({
    github: Url,
    linkedin: Url,
    youtube: Url,
    instagram: Url,
  }),
  youtubeChannelId: YouTubeChannelId,
  discordUserId: DiscordUserId,
  resumes: Schema.Struct({ en: Resume, fr: Resume }),
  summary: LocalizedText,
  availability: LocalizedText,
  languages: Schema.Array(SpokenLanguage),
}).check(
  Schema.makeFilter((profile) => {
    const expected = youtubeChannelUrl(profile.youtubeChannelId);
    return profile.links.youtube === expected
      ? undefined
      : { path: ["links", "youtube"], issue: `Expected ${expected}` };
  }),
);
export type Profile = typeof Profile.Type;

/** What a Patch's line is: something new, something changed, a fix. */
export const PatchTag = Schema.Literals(["new", "changed", "fixed"]);
export type PatchTag = typeof PatchTag.Type;

/** A Patch's version, `<season>.<patch>` or `<season>.<patch>.<hotfix>`. */
export const PatchVersion = Schema.String.check(
  Schema.isPattern(PATCH_VERSION, {
    message: "Expected a version (e.g. 2.4 or 2.4.1)",
  }),
);

export const PatchEntry = Schema.Struct({
  tag: PatchTag,
  text: LocalizedText,
});
export type PatchEntry = typeof PatchEntry.Type;

/**
 * One version of the site in its patch notes: what shipped, in the Owner's
 * voice, tagged line by line.
 */
export const Patch = Schema.Struct({
  version: PatchVersion,
  date: CalendarDate,
  title: LocalizedText,
  entries: Schema.Array(PatchEntry).check(
    Schema.makeFilter((entries) =>
      entries.length > 0 ? undefined : "Expected at least one line",
    ),
  ),
  /** Where to read more, e.g. the pull request that shipped it. */
  link: Schema.optionalKey(Url),
});
export type Patch = typeof Patch.Type;

/**
 * Every content document, keyed by kind, with the rules that span documents:
 * a Tech is defined once, every referenced Tech exists, a Project slug names
 * one Project only, and a version names one Patch only.
 */
export const Content = Schema.Struct({
  techs: Schema.Array(Tech),
  projects: Schema.Array(Project),
  experiences: Schema.Array(Experience),
  profile: Profile,
  achievements: Schema.Array(Achievement),
  hobbies: Schema.Array(Hobby),
  patchNotes: Schema.Array(Patch),
}).check(
  Schema.makeFilter((content) => {
    const seen = new Set<string>();
    const duplicates = content.techs.flatMap((tech, i) => {
      if (!seen.has(tech.id)) {
        seen.add(tech.id);
        return [];
      }
      return [
        {
          path: ["techs", i, "id"],
          issue: `Tech identifier defined more than once: ${tech.id}`,
        },
      ];
    });
    const unknown = content.projects.flatMap((project, i) =>
      project.techs.flatMap((id, j) =>
        seen.has(id)
          ? []
          : [
              {
                path: ["projects", i, "techs", j],
                issue: `Unknown Tech identifier: ${id}`,
              },
            ],
      ),
    );
    const slugs = new Set<string>();
    const sharedSlugs = content.projects.flatMap((project, i) => {
      if (!slugs.has(project.slug)) {
        slugs.add(project.slug);
        return [];
      }
      return [
        {
          path: ["projects", i, "slug"],
          issue: `Project slug used more than once: ${project.slug}`,
        },
      ];
    });
    const versions = new Set<string>();
    const sharedVersions = content.patchNotes.flatMap((patch, i) => {
      if (!versions.has(patch.version)) {
        versions.add(patch.version);
        return [];
      }
      return [
        {
          path: ["patchNotes", i, "version"],
          issue: `Patch version used more than once: ${patch.version}`,
        },
      ];
    });
    return [...duplicates, ...unknown, ...sharedSlugs, ...sharedVersions];
  }),
);
export type Content = typeof Content.Type;

/** Where each content document lives in the content repository. */
export const DOCUMENT_PATHS: { readonly [K in keyof Content]: string } = {
  techs: "content/techs.json",
  projects: "content/projects.json",
  experiences: "content/experiences.json",
  profile: "content/profile.json",
  achievements: "content/achievements.json",
  hobbies: "content/hobbies.json",
  patchNotes: "content/patch-notes.json",
};
