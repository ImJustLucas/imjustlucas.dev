import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  openEditor,
  saveContent,
  type Saved,
} from "@/lib/admin/admin-action";
import type { Content, Tech } from "@/lib/content/schema";

/** Admin actions on Techs. */

/** A Tech as the Owner types it (unvalidated). */
type TechFields = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
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

/** Where a Tech is referenced, in words, e.g. `le Project « Qotum »`. */
const techReferences = (content: Content, tech: Tech) =>
  content.projects
    .filter((project) => project.techs.includes(tech.id))
    .map((project) => `le Project « ${project.title} »`);

const techGone = (id: string) => gone(`Ce Tech (${id})`);

/** What the Techs editor shows: the Techs, in stored order. */
export const openTechsEditor = openEditor((content) => ({
  techs: content.techs,
}));
