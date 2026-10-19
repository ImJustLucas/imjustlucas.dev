import { Clock, Effect } from "effect";

import type { AdminActionResult } from "@/lib/admin/action-result";
import { AdminAccess, saveContent } from "@/lib/admin/admin-action";
import { resumePdfError } from "@/lib/admin/resume-pdf";
import { type CatalogError, loadContent } from "@/lib/content/catalog";
import type { Revision } from "@/lib/content/repository";
import type { Profile } from "@/lib/content/schema";

/** Admin actions on the Profile, the one document of Lucas's identity. */

type Saved = { readonly revision: Revision };

/** A Locale the Profile holds a Resume for. */
export type ResumeLocale = keyof Profile["resumes"];

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

const MESSAGE = "📝 Admin:";

/** Edits the social links and account identifiers; Resumes are uploaded. */
export const updateProfile = (
  input: Saved & ProfileFields,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: `${MESSAGE} update Profile`,
    documents: {
      ...content,
      profile: {
        links: {
          github: input.links.github,
          linkedin: input.links.linkedin,
          youtube: input.links.youtube,
          instagram: input.links.instagram,
        },
        youtubeChannelId: input.youtubeChannelId,
        discordUserId: input.discordUserId,
        resumes: content.profile.resumes,
      },
    },
    entry: ["profile"],
  }));

/** How a commit message names a Locale's Resume. */
const RESUME_NAMES: { readonly [L in ResumeLocale]: string } = {
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
  input: Saved & { readonly locale: ResumeLocale; readonly file: Uint8Array },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  Effect.flatMap(Clock.currentTimeMillis, (now) =>
    saveContent(input.revision, (content) => {
      const current = content.profile.resumes[input.locale];
      const error = resumePdfError(input.file);
      if (error)
        return {
          kind: "edited",
          message: "",
          documents: content,
          fieldErrors: { file: error },
        };
      return {
        kind: "edited",
        message: `${MESSAGE} upload ${RESUME_NAMES[input.locale]}`,
        documents: {
          ...content,
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
        },
        entry: ["profile"],
        assets: [{ path: `public${current.asset}`, content: input.file }],
      };
    }),
  );

/** What the Profile editor shows: the Profile and the revision it was read at. */
export type ProfileEditor =
  | {
      readonly kind: "owner";
      readonly revision: Revision;
      readonly profile: Profile;
    }
  | { readonly kind: "not-owner" };

export const openProfileEditor: Effect.Effect<
  ProfileEditor,
  CatalogError,
  AdminAccess
> = Effect.gen(function* () {
  const repository = yield* (yield* AdminAccess).repository;
  // The revision first: content read after it is at least as recent, so a
  // save based on it can only be refused, never overwrite newer content.
  const revision = yield* repository.head;
  const content = yield* loadContent(repository);
  return { kind: "owner", revision, profile: content.profile } as const;
}).pipe(
  Effect.catchTag("NotOwner", () =>
    Effect.succeed({ kind: "not-owner" } as const),
  ),
);
