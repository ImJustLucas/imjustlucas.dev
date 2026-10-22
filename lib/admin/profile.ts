import { Clock, Effect } from "effect";

import type { Locale } from "@/i18n/routing";
import {
  type AdminAction,
  commitMessage,
  documents,
  openEditor,
  readUpload,
  saveContent,
  type Saved,
  type Upload,
} from "@/lib/admin/admin-action";
import { checkUpload } from "@/lib/admin/upload";

/** Admin actions on the Profile, the one document of Lucas's identity. */

/** The Profile's identity fields as the Owner types them (unvalidated). */
type ProfileFields = {
  readonly links: {
    readonly github: string;
    readonly linkedin: string;
    readonly youtube: string;
    readonly instagram: string;
  };
  readonly youtubeChannelId: string;
  readonly discordUserId: string;
};

/** Edits the social links and account identifiers; Resumes are uploaded. */
export const updateProfile = (input: Saved & ProfileFields): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage("update Profile"),
    documents: documents(content, {
      profile: {
        ...content.profile,
        links: {
          github: input.links.github,
          linkedin: input.links.linkedin,
          youtube: input.links.youtube,
          instagram: input.links.instagram,
        },
        youtubeChannelId: input.youtubeChannelId,
        discordUserId: input.discordUserId,
      },
    }),
    entry: ["profile"],
  }));

/** A text in both Locales as the Owner types it (unvalidated). */
type LocalizedFields = { readonly en: string; readonly fr: string };

/** What the recruiter mode says of Lucas, as the Owner types it (unvalidated). */
type RecruiterFields = {
  readonly summary: LocalizedFields;
  readonly availability: LocalizedFields;
  readonly languages: ReadonlyArray<{
    readonly code: string;
    readonly name: LocalizedFields;
    readonly level: LocalizedFields;
  }>;
};

/** Edits the recruiter mode's summary, availability and languages. */
export const updateRecruiter = (input: Saved & RecruiterFields): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage("update the recruiter mode"),
    documents: documents(content, {
      profile: {
        ...content.profile,
        summary: input.summary,
        availability: input.availability,
        languages: input.languages,
      },
    }),
    entry: ["profile"],
  }));

/** How a commit message names a Locale's Resume. */
const RESUME_NAMES: { readonly [L in Locale]: string } = {
  en: "the English Resume",
  fr: "the French Resume",
};

/**
 * The Owner's calendar day at `millis`: he lives in France, so a Resume
 * uploaded just after midnight there is dated that day, not UTC's.
 */
const dayInParis = (millis: number) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(millis);

/**
 * Replaces a Locale's Resume: the PDF is committed over the Locale's current
 * file, and the Profile dates that Resume to the upload day, in one save.
 */
export const uploadResume = (
  input: Saved & { readonly locale: Locale; readonly file: Upload },
): AdminAction =>
  Effect.flatMap(Clock.currentTimeMillis, (now) =>
    saveContent(input.revision, (content) =>
      Effect.map(readUpload(input.file), (file) => {
        const current = content.profile.resumes[input.locale];
        const checked = checkUpload("pdf", file);
        if (checked.kind === "invalid")
          return {
            kind: "edited",
            message: "",
            documents: content,
            fieldErrors: { file: checked.error },
          };
        return {
          kind: "edited",
          message: commitMessage(`upload ${RESUME_NAMES[input.locale]}`),
          documents: documents(content, {
            profile: {
              ...content.profile,
              resumes: {
                ...content.profile.resumes,
                [input.locale]: {
                  asset: current.asset,
                  lastUpdated: dayInParis(now),
                },
              },
            },
          }),
          entry: ["profile"],
          assets: [{ path: `public${current.asset}`, content: file }],
        };
      }),
    ),
  );

/** What the Profile editor shows: the Profile. */
export const openProfileEditor = openEditor((content) => ({
  profile: content.profile,
}));
