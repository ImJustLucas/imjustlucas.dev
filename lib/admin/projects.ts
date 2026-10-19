import { Effect } from "effect";

import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  AdminAccess,
  type ContentDocuments,
  saveContent,
} from "@/lib/admin/admin-action";
import { projectImage } from "@/lib/admin/project-image";
import { type CatalogError, loadContent } from "@/lib/content/catalog";
import { byStartMostRecentFirst } from "@/lib/content/period";
import type { Revision } from "@/lib/content/repository";
import type {
  Content,
  LocalizedText,
  Project,
  Tech,
} from "@/lib/content/schema";

/** Admin actions on Projects. */

type Saved = { readonly revision: Revision };

/** A Project as the Owner types it (unvalidated). Star counts are not in it. */
type ProjectFields = {
  readonly title: string;
  readonly description: LocalizedText;
  readonly wip: boolean;
  /** `end` is a point in time or `ongoing`. */
  readonly period: { readonly start: string; readonly end: string };
  /** Tech identifiers, in display order. */
  readonly techs: ReadonlyArray<string>;
  /** Empty: none. */
  readonly externalLink: string;
  /** Empty: none. */
  readonly repository: string;
  readonly openSource: boolean;
  /** A new image, uploaded: committed with the Project. */
  readonly image?: Uint8Array;
};

const MESSAGE = "📝 Admin:";

const documents = (
  content: Content,
  change: Partial<ContentDocuments>,
): ContentDocuments => ({ ...content, ...change });

/**
 * The image a save gives the Project: the uploaded one, committed alongside
 * (or a field error), else the one it had.
 */
const upload = (input: ProjectFields, current: string | undefined) => {
  if (!input.image) return { image: current };
  const uploaded = projectImage(input.title, input.image);
  return uploaded.kind === "invalid"
    ? { image: current, fieldErrors: { image: uploaded.error } }
    : {
        image: uploaded.url,
        assets: [{ path: uploaded.path, content: input.image }],
      };
};

/** What the Admin edits of a Project; anything else in an entry is kept. */
const EDITED: ReadonlyArray<string> = [
  "title",
  "description",
  "image",
  "wip",
  "period",
  "techs",
  "externalLink",
  "repository",
  "openSource",
];

/**
 * The Project entry the fields describe, keys in document order. `image` is
 * the asset path of its image, if it has one; `kept` is the entry it
 * replaces, whose fields the Admin does not edit (stored star counts, until
 * they leave the content) stay as they are.
 */
const project = (
  input: ProjectFields,
  image: string | undefined,
  kept: Project | undefined,
) => ({
  title: input.title,
  description: { en: input.description.en, fr: input.description.fr },
  ...(image && { image }),
  wip: input.wip,
  period: { start: input.period.start, end: input.period.end },
  techs: [...input.techs],
  ...(input.externalLink && { externalLink: input.externalLink }),
  ...(input.repository && { repository: input.repository }),
  openSource: input.openSource,
  ...Object.fromEntries(
    Object.entries(kept ?? {}).filter(([key]) => !EDITED.includes(key)),
  ),
});

export const createProject = (
  input: Saved & ProjectFields,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const { image, ...uploaded } = upload(input, undefined);
    return {
      kind: "edited",
      message: `${MESSAGE} add Project '${input.title}'`,
      documents: documents(content, {
        projects: [...content.projects, project(input, image, undefined)],
      }),
      entry: ["projects", content.projects.length],
      ...uploaded,
    };
  });

/** Projects have no identifier: they are addressed by position. */
export const updateProject = (
  input: Saved & ProjectFields & { readonly index: number },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const existing = content.projects[input.index];
    if (!existing) return projectGone;
    const { image, ...uploaded } = upload(input, existing.image);
    return {
      kind: "edited",
      message: `${MESSAGE} update Project '${input.title}'`,
      documents: documents(content, {
        projects: content.projects.map((entry, i) =>
          i === input.index ? project(input, image, existing) : entry,
        ),
      }),
      entry: ["projects", input.index],
      ...uploaded,
    };
  });

export const deleteProject = (
  input: Saved & { readonly index: number },
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  saveContent(input.revision, (content) => {
    const existing = content.projects[input.index];
    if (!existing) return projectGone;
    return {
      kind: "edited",
      message: `${MESSAGE} delete Project '${existing.title}'`,
      documents: documents(content, {
        projects: content.projects.filter((entry) => entry !== existing),
      }),
    };
  });

const projectGone = {
  kind: "refused",
  reason: "Ce Project n'existe plus. Recharge la page.",
} as const;

/** What the Projects editor shows: the content and the revision it was read at. */
export type ProjectsEditor =
  | {
      readonly kind: "owner";
      readonly revision: Revision;
      readonly techs: ReadonlyArray<Tech>;
      /** In display order; `index` is the Project's position in its document. */
      readonly projects: ReadonlyArray<{
        readonly index: number;
        readonly project: Project;
      }>;
    }
  | { readonly kind: "not-owner" };

export const openProjectsEditor: Effect.Effect<
  ProjectsEditor,
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
    projects: content.projects
      .map((project, index) => ({ index, project }))
      .sort((a, b) =>
        byStartMostRecentFirst(a.project.period, b.project.period),
      ),
  } as const;
}).pipe(
  Effect.catchTag("NotOwner", () =>
    Effect.succeed({ kind: "not-owner" } as const),
  ),
);
