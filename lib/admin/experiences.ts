import type { PeriodInput } from "@/lib/admin/action-result";
import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  inPeriodOrder,
  openEditor,
  saveContent,
  type Saved,
} from "@/lib/admin/admin-action";
import type { ContractType, LocalizedText } from "@/lib/content/schema";

/**
 * Admin actions on Experiences. Experiences have no identifier: they are
 * addressed by their position in the stored document (which Visitors never
 * see: the catalog orders them by Period).
 */

/** An Experience as the Owner types it (unvalidated). */
type ExperienceFields = {
  readonly company: string;
  readonly role: LocalizedText;
  /** One of the contract types; anything else is a field error. */
  readonly contractType: string;
  readonly link: string;
  readonly description: LocalizedText;
  readonly period: PeriodInput;
};

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

const experienceGone = gone("Cette Experience");

export const createExperience = (
  input: Saved & ExperienceFields,
): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage(`add Experience ${named(input)}`),
    documents: documents(content, {
      experiences: [...content.experiences, experience(input)],
    }),
    entry: ["experiences", content.experiences.length],
  }));

export const updateExperience = (
  input: Saved & ExperienceFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    if (!content.experiences[input.index]) return experienceGone;
    return {
      kind: "edited",
      message: commitMessage(`update Experience ${named(input)}`),
      documents: documents(content, {
        experiences: content.experiences.map((stored, i) =>
          i === input.index ? experience(input) : stored,
        ),
      }),
      entry: ["experiences", input.index],
    };
  });

export const deleteExperience = (
  input: Saved & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const deleted = content.experiences[input.index];
    if (!deleted) return experienceGone;
    return {
      kind: "edited",
      message: commitMessage(`delete Experience ${named(deleted)}`),
      documents: documents(content, {
        experiences: content.experiences.filter((e) => e !== deleted),
      }),
    };
  });

/**
 * What the Experiences editor shows: the Experiences in display order, each
 * with `index`, its stored position.
 */
export const openExperiencesEditor = openEditor((content) => ({
  experiences: inPeriodOrder(content.experiences).map(({ index, entry }) => ({
    index,
    experience: entry,
  })),
}));
