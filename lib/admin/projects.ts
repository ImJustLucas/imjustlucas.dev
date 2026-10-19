import { Effect } from "effect";

import type { PeriodInput } from "@/lib/admin/action-result";
import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  inPeriodOrder,
  openEditor,
  readUpload,
  saveContent,
  type Saved,
  type Upload,
} from "@/lib/admin/admin-action";
import { projectImage } from "@/lib/admin/project-image";
import type { LocalizedText } from "@/lib/content/schema";

/**
 * Admin actions on Projects. Projects have no identifier: they are addressed
 * by their position in the stored document.
 */

/** A Project as the Owner types it (unvalidated). Star counts are not in it. */
type ProjectFields = {
  readonly title: string;
  readonly description: LocalizedText;
  readonly wip: boolean;
  readonly period: PeriodInput;
  /** Tech identifiers, in display order. */
  readonly techs: ReadonlyArray<string>;
  /** Empty: none. */
  readonly externalLink: string;
  /** Empty: none. */
  readonly repository: string;
  readonly openSource: boolean;
  /** A new image, uploaded: committed with the Project. */
  readonly image?: Upload;
};

/**
 * The image a save gives the Project: the uploaded one, committed alongside
 * (or a field error), else the one it had.
 */
const upload = (input: ProjectFields, current: string | undefined) => {
  if (!input.image) return Effect.succeed({ image: current });
  return Effect.map(readUpload(input.image), (bytes) => {
    const uploaded = projectImage(input.title, bytes);
    return uploaded.kind === "invalid"
      ? { image: current, fieldErrors: { image: uploaded.error } }
      : {
          image: uploaded.url,
          assets: [{ path: uploaded.path, content: bytes }],
        };
  });
};

/**
 * The Project entry the fields describe, keys in document order. `image` is
 * the asset path of its image, if it has one.
 */
const project = (input: ProjectFields, image: string | undefined) => ({
  title: input.title,
  description: { en: input.description.en, fr: input.description.fr },
  ...(image && { image }),
  wip: input.wip,
  period: { start: input.period.start, end: input.period.end },
  techs: [...input.techs],
  ...(input.externalLink && { externalLink: input.externalLink }),
  ...(input.repository && { repository: input.repository }),
  openSource: input.openSource,
});

const projectGone = gone("Ce Project");

export const createProject = (input: Saved & ProjectFields): AdminAction =>
  saveContent(input.revision, (content) =>
    Effect.map(upload(input, undefined), ({ image, ...uploaded }) => ({
      kind: "edited",
      message: commitMessage(`add Project '${input.title}'`),
      documents: documents(content, {
        projects: [...content.projects, project(input, image)],
      }),
      entry: ["projects", content.projects.length],
      ...uploaded,
    })),
  );

export const updateProject = (
  input: Saved & ProjectFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const existing = content.projects[input.index];
    if (!existing) return projectGone;
    return Effect.map(
      upload(input, existing.image),
      ({ image, ...uploaded }) => ({
        kind: "edited",
        message: commitMessage(`update Project '${input.title}'`),
        documents: documents(content, {
          projects: content.projects.map((entry, i) =>
            i === input.index ? project(input, image) : entry,
          ),
        }),
        entry: ["projects", input.index],
        ...uploaded,
      }),
    );
  });

export const deleteProject = (
  input: Saved & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const existing = content.projects[input.index];
    if (!existing) return projectGone;
    return {
      kind: "edited",
      message: commitMessage(`delete Project '${existing.title}'`),
      documents: documents(content, {
        projects: content.projects.filter((entry) => entry !== existing),
      }),
    };
  });

/**
 * What the Projects editor shows: the Techs to pick from, and the Projects
 * in display order, each with `index`, its stored position.
 */
export const openProjectsEditor = openEditor((content) => ({
  techs: content.techs,
  projects: inPeriodOrder(content.projects).map(({ index, entry }) => ({
    index,
    project: entry,
  })),
}));
