import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  openEditor,
  saveContent,
  type Saved,
} from "@/lib/admin/admin-action";
import type { Content, LocalizedText, Tech } from "@/lib/content/schema";

/** Admin actions on Techs and Tech categories. */

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

export const createTech = (input: Saved & TechFields): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage(`add Tech '${input.name}'`),
    documents: documents(content, {
      techs: [
        ...content.techs,
        { id: input.id, name: input.name, color: input.color },
      ],
    }),
    entry: ["techs", content.techs.length],
  }));

/** Edits a Tech's name and colour; its identifier never changes. */
export const updateTech = (input: Saved & TechFields): AdminAction =>
  saveContent(input.revision, (content) => {
    const index = content.techs.findIndex((tech) => tech.id === input.id);
    if (index < 0) return techGone(input.id);
    return {
      kind: "edited",
      message: commitMessage(`update Tech '${input.name}'`),
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
): AdminAction =>
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
      message: commitMessage(`delete Tech '${tech.name}'`),
      documents: documents(content, {
        techs: content.techs.filter((t) => t !== tech),
      }),
    };
  });

/** Where a Tech is referenced, in words, e.g. `la Tech category « Frontend »`. */
const techReferences = (content: Content, tech: Tech) => [
  ...content.techCategories
    .filter((category) => category.techs.includes(tech.id))
    .map((category) => `la Tech category « ${category.name.fr} »`),
  ...content.projects
    .filter((project) => project.techs.includes(tech.id))
    .map((project) => `le Project « ${project.title} »`),
];

const techGone = (id: string) => gone(`Ce Tech (${id})`);

const techCategory = (input: TechCategoryFields) => ({
  name: { en: input.name.en, fr: input.name.fr },
  description: { en: input.description.en, fr: input.description.fr },
  techs: [...input.techs],
});

export const createTechCategory = (
  input: Saved & TechCategoryFields,
): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage(`add Tech category '${input.name.en}'`),
    documents: documents(content, {
      techCategories: [...content.techCategories, techCategory(input)],
    }),
    entry: ["techCategories", content.techCategories.length],
  }));

/** Tech categories have no identifier: they are addressed by position. */
export const updateTechCategory = (
  input: Saved & TechCategoryFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    if (!content.techCategories[input.index]) return techCategoryGone;
    return {
      kind: "edited",
      message: commitMessage(`update Tech category '${input.name.en}'`),
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
): AdminAction =>
  saveContent(input.revision, (content) => {
    const category = content.techCategories[input.index];
    if (!category) return techCategoryGone;
    return {
      kind: "edited",
      message: commitMessage(`delete Tech category '${category.name.en}'`),
      documents: documents(content, {
        techCategories: content.techCategories.filter((c) => c !== category),
      }),
    };
  });

const techCategoryGone = gone("Cette Tech category");

/**
 * What the Techs editor shows: the Techs and Tech categories, in stored
 * order, which is also their public order.
 */
export const openTechsEditor = openEditor((content) => ({
  techs: content.techs,
  techCategories: content.techCategories,
}));
