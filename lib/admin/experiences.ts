import { Effect } from "effect";

import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  AdminAccess,
  inPeriodOrder,
  saveContent,
} from "@/lib/admin/admin-action";
import { type CatalogError, loadContent } from "@/lib/content/catalog";
import type { Revision } from "@/lib/content/repository";
import type {
  ContractType,
  Experience,
  LocalizedText,
} from "@/lib/content/schema";

/**
 * Admin actions on Experiences. Experiences have no identifier: they are
 * addressed by their position in the stored document (which Visitors never
 * see: the catalog orders them by Period).
 */

type Saved = { readonly revision: Revision };

/** An Experience as the Owner types it (unvalidated). */
type ExperienceFields = {
  readonly company: string;
  readonly role: LocalizedText;
  /** One of the contract types; anything else is a field error. */
  readonly contractType: string;
  readonly link: string;
  readonly description: LocalizedText;
  /** Start `YYYY` or `YYYY-MM`; end the same or `ongoing`. */
  readonly period: { readonly start: string; readonly end: string };
};

const MESSAGE = "📝 Admin:";

const experience = (input: ExperienceFields) => ({
  company: input.company,
  role: { en: input.role.en, fr: input.role.fr },
  // Typed as a contract type; `saveContent` validates it like every field.
  contractType: input.contractType as ContractType,
  link: input.link,
  description: { en: input.description.en, fr: input.description.fr },
  period: { start: input.period.start, end: input.period.end },
});

/** How a commit message names an Experience: company and role. */
const named = (input: {
  readonly company: string;
  readonly role: LocalizedText;
}) => `'${input.company} (${input.role.en})'`;

export const createExperience = (
  input: Saved & ExperienceFields,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: `${MESSAGE} add Experience ${named(input)}`,
    documents: {
      ...content,
      experiences: [...content.experiences, experience(input)],
    },
    entry: ["experiences", content.experiences.length],
  }));

export const updateExperience = (
  input: Saved & ExperienceFields & { readonly index: number },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    if (!content.experiences[input.index]) return experienceGone;
    return {
      kind: "edited",
      message: `${MESSAGE} update Experience ${named(input)}`,
      documents: {
        ...content,
        experiences: content.experiences.map((stored, i) =>
          i === input.index ? experience(input) : stored,
        ),
      },
      entry: ["experiences", input.index],
    };
  });

export const deleteExperience = (
  input: Saved & { readonly index: number },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const deleted = content.experiences[input.index];
    if (!deleted) return experienceGone;
    return {
      kind: "edited",
      message: `${MESSAGE} delete Experience ${named(deleted)}`,
      documents: {
        ...content,
        experiences: content.experiences.filter((e) => e !== deleted),
      },
    };
  });

const experienceGone = {
  kind: "refused",
  reason: "Cette Experience n'existe plus. Recharge la page.",
} as const;

/**
 * What the Experiences editor shows: the Experiences and the revision they
 * were read at.
 */
export type ExperiencesEditor =
  | {
      readonly kind: "owner";
      readonly revision: Revision;
      /** In display order; `index` is the Experience's stored position. */
      readonly experiences: ReadonlyArray<{
        readonly index: number;
        readonly experience: Experience;
      }>;
    }
  | { readonly kind: "not-owner" };

export const openExperiencesEditor: Effect.Effect<
  ExperiencesEditor,
  CatalogError,
  AdminAccess
> = Effect.gen(function* () {
  const repository = yield* (yield* AdminAccess).repository;
  // The revision first: content read after it is at least as recent, so a
  // save based on it can only be refused, never overwrite newer content.
  const revision = yield* repository.head;
  const content = yield* loadContent(repository);
  return {
    kind: "owner",
    revision,
    experiences: inPeriodOrder(content.experiences).map(({ index, entry }) => ({
      index,
      experience: entry,
    })),
  } as const;
}).pipe(
  Effect.catchTag("NotOwner", () =>
    Effect.succeed({ kind: "not-owner" } as const),
  ),
);
