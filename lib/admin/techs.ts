import { Effect } from "effect";

import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  AdminAccess,
  type ContentDocuments,
  saveContent,
} from "@/lib/admin/admin-action";
import { type CatalogError, loadContent } from "@/lib/content/catalog";
import type { Revision } from "@/lib/content/repository";
import type {
  Content,
  LocalizedText,
  Tech,
  TechCategory,
} from "@/lib/content/schema";

/** Admin actions on Techs and Tech categories. */

type Saved = { readonly revision: Revision };

/** A Tech as the Owner types it (unvalidated). */
type TechFields = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
};

/** A Tech category as the Owner types it (unvalidated). */
type TechCategoryFields = {
  readonly name: LocalizedText;
  readonly description: LocalizedText;
  /** Tech identifiers, in display order. */
  readonly techs: ReadonlyArray<string>;
};

const MESSAGE = "📝 Admin:";

const documents = (
  content: Content,
  change: Partial<ContentDocuments>,
): ContentDocuments => ({ ...content, ...change });

export const createTech = (
  input: Saved & TechFields,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: `${MESSAGE} add Tech '${input.name}'`,
    documents: documents(content, {
      techs: [
        ...content.techs,
        { id: input.id, name: input.name, color: input.color },
      ],
    }),
    entry: ["techs", content.techs.length],
  }));

/** Edits a Tech's name and colour; its identifier never changes. */
export const updateTech = (
  input: Saved & TechFields,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const index = content.techs.findIndex((tech) => tech.id === input.id);
    if (index < 0) return techGone(input.id);
    return {
      kind: "edited",
      message: `${MESSAGE} update Tech '${input.name}'`,
      documents: documents(content, {
        techs: content.techs.map((tech, i) =>
          i === index
            ? { id: tech.id, name: input.name, color: input.color }
            : tech,
        ),
      }),
      entry: ["techs", index],
    };
  });

/** Deletes a Tech, refused while anything still references it. */
export const deleteTech = (
  input: Saved & { readonly id: string },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const tech = content.techs.find((t) => t.id === input.id);
    if (!tech) return techGone(input.id);
    const usedBy = techReferences(content, tech);
    if (usedBy.length > 0)
      return {
        kind: "refused",
        reason: `${tech.name} est encore utilisé par ${usedBy.join(", ")}. Retire-le d'abord de là pour pouvoir le supprimer.`,
      };
    return {
      kind: "edited",
      message: `${MESSAGE} delete Tech '${tech.name}'`,
      documents: documents(content, {
        techs: content.techs.filter((t) => t !== tech),
      }),
    };
  });

/** Where a Tech is referenced, in words, e.g. `la Tech category « Frontend »`. */
const techReferences = (content: Content, tech: Tech) =>
  content.techCategories
    .filter((category) => category.techs.includes(tech.id))
    .map((category) => `la Tech category « ${category.name.fr} »`);

const techGone = (id: string) =>
  ({
    kind: "refused",
    reason: `Ce Tech n'existe plus : ${id}. Recharge la page.`,
  }) as const;

const techCategory = (input: TechCategoryFields) => ({
  name: { en: input.name.en, fr: input.name.fr },
  description: { en: input.description.en, fr: input.description.fr },
  techs: [...input.techs],
});

export const createTechCategory = (
  input: Saved & TechCategoryFields,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: `${MESSAGE} add Tech category '${input.name.en}'`,
    documents: documents(content, {
      techCategories: [...content.techCategories, techCategory(input)],
    }),
    entry: ["techCategories", content.techCategories.length],
  }));

/** Tech categories have no identifier: they are addressed by position. */
export const updateTechCategory = (
  input: Saved & TechCategoryFields & { readonly index: number },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    if (!content.techCategories[input.index]) return techCategoryGone;
    return {
      kind: "edited",
      message: `${MESSAGE} update Tech category '${input.name.en}'`,
      documents: documents(content, {
        techCategories: content.techCategories.map((category, i) =>
          i === input.index ? techCategory(input) : category,
        ),
      }),
      entry: ["techCategories", input.index],
    };
  });

export const deleteTechCategory = (
  input: Saved & { readonly index: number },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const category = content.techCategories[input.index];
    if (!category) return techCategoryGone;
    return {
      kind: "edited",
      message: `${MESSAGE} delete Tech category '${category.name.en}'`,
      documents: documents(content, {
        techCategories: content.techCategories.filter((c) => c !== category),
      }),
    };
  });

const techCategoryGone = {
  kind: "refused",
  reason: "Cette Tech category n'existe plus. Recharge la page.",
} as const;

/** What the Techs editor shows: the content and the revision it was read at. */
export type TechsEditor =
  | {
      readonly kind: "owner";
      readonly revision: Revision;
      readonly techs: ReadonlyArray<Tech>;
      readonly techCategories: ReadonlyArray<TechCategory>;
    }
  | { readonly kind: "not-owner" };

export const openTechsEditor: Effect.Effect<
  TechsEditor,
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
    techs: content.techs,
    techCategories: content.techCategories,
  } as const;
}).pipe(
  Effect.catchTag("NotOwner", () =>
    Effect.succeed({ kind: "not-owner" } as const),
  ),
);
