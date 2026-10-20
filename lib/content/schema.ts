import { Schema } from "effect";

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

/** Stable identifier of a Tech, referenced by Projects and Tech categories. */
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

export const TechCategory = Schema.Struct({
  name: LocalizedText,
  description: LocalizedText,
  /** Techs in display order. */
  techs: Schema.Array(TechId),
});
export type TechCategory = typeof TechCategory.Type;

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

export const Project = Schema.Struct({
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

/**
 * Lucas's public identity, defined once: social links, the YouTube channel
 * the Videos come from, the Discord account Presence follows, and one Resume
 * per Locale. The YouTube link is the channel's own URL, so they can't drift.
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
}).check(
  Schema.makeFilter((profile) => {
    const expected = youtubeChannelUrl(profile.youtubeChannelId);
    return profile.links.youtube === expected
      ? undefined
      : { path: ["links", "youtube"], issue: `Expected ${expected}` };
  }),
);
export type Profile = typeof Profile.Type;

/**
 * Every content document, keyed by kind, with the rules that span documents:
 * a Tech is defined once, and every referenced Tech exists.
 */
export const Content = Schema.Struct({
  techs: Schema.Array(Tech),
  techCategories: Schema.Array(TechCategory),
  projects: Schema.Array(Project),
  experiences: Schema.Array(Experience),
  profile: Profile,
  achievements: Schema.Array(Achievement),
  hobbies: Schema.Array(Hobby),
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
    const unknownIn = (
      kind: "techCategories" | "projects",
      documents: ReadonlyArray<{ readonly techs: ReadonlyArray<string> }>,
    ) =>
      documents.flatMap((document, i) =>
        document.techs.flatMap((id, j) =>
          seen.has(id)
            ? []
            : [
                {
                  path: [kind, i, "techs", j],
                  issue: `Unknown Tech identifier: ${id}`,
                },
              ],
        ),
      );
    return [
      ...duplicates,
      ...unknownIn("techCategories", content.techCategories),
      ...unknownIn("projects", content.projects),
    ];
  }),
);
export type Content = typeof Content.Type;

/** Where each content document lives in the content repository. */
export const DOCUMENT_PATHS: { readonly [K in keyof Content]: string } = {
  techs: "content/techs.json",
  techCategories: "content/tech-categories.json",
  projects: "content/projects.json",
  experiences: "content/experiences.json",
  profile: "content/profile.json",
  achievements: "content/achievements.json",
  hobbies: "content/hobbies.json",
};
