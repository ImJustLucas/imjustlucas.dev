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

/** An absolute `http(s)` URL. */
export const Url = Schema.String.check(
  Schema.isPattern(/^https?:\/\/\S+$/, { message: "Expected an http(s) URL" }),
);

/** A public GitHub repository, as `https://github.com/<owner>/<name>`. */
export const GitHubRepository = Schema.String.check(
  Schema.isPattern(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, {
    message: "Expected https://github.com/<owner>/<repository>",
  }),
);

/** A file of the public assets folder, by its URL path, e.g. `/images/a.png`. */
export const AssetPath = Schema.String.check(
  Schema.isPattern(/^\/\S+$/, {
    message: "Expected a path under public/, starting with /",
  }),
);

export const Project = Schema.Struct({
  /** Not translated: a proper noun. */
  title: Schema.NonEmptyString,
  description: LocalizedText,
  image: Schema.optionalKey(AssetPath),
  /** Work in progress. */
  wip: Schema.Boolean,
  period: Period,
  techs: Schema.Array(TechId),
  /** The Project's site. */
  externalLink: Schema.optionalKey(Url),
  /** Its star count is read from GitHub, never stored. */
  repository: Schema.optionalKey(GitHubRepository),
  openSource: Schema.Boolean,
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
});
export type Experience = typeof Experience.Type;

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
  asset: AssetPath,
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
};
