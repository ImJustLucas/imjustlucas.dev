import { Effect } from "effect";

import type { PeriodInput } from "@/lib/admin/action-result";
import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  imageUpload,
  inPeriodOrder,
  openEditor,
  saveContent,
  type Saved,
  type Upload,
} from "@/lib/admin/admin-action";
import { projectImage, slug } from "@/lib/admin/uploaded-image";
import type { LocalizedText, Rarity } from "@/lib/content/schema";

/**
 * Admin actions on Projects. They are addressed by their position in the
 * stored document; their slug, their page's address, is set once, when the
 * Project is created, so a shared link keeps working.
 */

/** A Project as the Owner types it (unvalidated). Star counts are not in it. */
type ProjectFields = {
  readonly title: string;
  /** Only read on creation. Empty: made from the title. */
  readonly slug?: string;
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
  /** One of the Rarities; anything else is a field error. */
  readonly rarity: string;
  /** Its place on the home page, as typed (1 first). Empty: not featured. */
  readonly featured: string;
  /** A new image, uploaded: committed with the Project. */
  readonly image?: Upload;
  /** Its page's texts; both Locales empty: none. */
  readonly role: LocalizedText;
  readonly context: LocalizedText;
  readonly built: LocalizedText;
  readonly outcome: LocalizedText;
  /** The gallery images kept, in order. */
  readonly gallery: ReadonlyArray<string>;
  /** A new gallery image, uploaded: added after the kept ones. */
  readonly galleryImage?: Upload;
};

/**
 * The images a save gives the Project: its image and its gallery, each new
 * upload committed alongside (or a field error).
 */
const uploads = (input: ProjectFields, current: string | undefined) =>
  Effect.map(
    Effect.all([
      upload(input, current),
      imageUpload({
        upload: input.galleryImage,
        current: undefined,
        field: "galleryImage",
        store: (bytes) => projectImage(input.title, bytes),
      }),
    ]),
    ([main, added]) => ({
      image: main.image,
      gallery: added.image ? [...input.gallery, added.image] : input.gallery,
      assets: [...(main.assets ?? []), ...(added.assets ?? [])],
      fieldErrors: { ...main.fieldErrors, ...added.fieldErrors },
    }),
  );

/** An optional text of the page: absent when left empty in both Locales. */
const optional = (text: LocalizedText) =>
  text.en === "" && text.fr === "" ? undefined : { en: text.en, fr: text.fr };

/**
 * The image a save gives the Project: the uploaded one, committed alongside
 * (or a field error), else the one it had.
 */
const upload = (input: ProjectFields, current: string | undefined) =>
  imageUpload({
    upload: input.image,
    current,
    field: "image",
    store: (bytes) => projectImage(input.title, bytes),
  });

/**
 * The Project entry the fields describe, keys in document order. `image` is
 * the asset path of its image, if it has one; `gallery` those of its gallery.
 */
const project = (
  input: ProjectFields,
  slug: string,
  images: { readonly image?: string; readonly gallery: ReadonlyArray<string> },
) => {
  const { image, gallery } = images;
  const role = optional(input.role);
  const context = optional(input.context);
  const built = optional(input.built);
  const outcome = optional(input.outcome);
  return {
    slug,
    title: input.title,
    description: { en: input.description.en, fr: input.description.fr },
    ...(image && { image }),
    wip: input.wip,
    period: { start: input.period.start, end: input.period.end },
    techs: [...input.techs],
    ...(input.externalLink && { externalLink: input.externalLink }),
    ...(input.repository && { repository: input.repository }),
    openSource: input.openSource,
    // Typed as a Rarity; `saveContent` validates it like every field.
    rarity: input.rarity as Rarity,
    // A place that is not a whole number is a field error; NaN stays one.
    ...(input.featured !== "" && { featured: Number(input.featured) }),
    ...(role && { role }),
    ...(context && { context }),
    ...(built && { built }),
    ...(outcome && { outcome }),
    ...(gallery.length > 0 && { gallery: [...gallery] }),
  };
};

const projectGone = gone("Ce Project");

export const createProject = (input: Saved & ProjectFields): AdminAction =>
  saveContent(input.revision, (content) =>
    Effect.map(
      uploads(input, undefined),
      ({ image, gallery, ...uploaded }) => ({
        kind: "edited",
        message: commitMessage(`add Project '${input.title}'`),
        documents: documents(content, {
          projects: [
            ...content.projects,
            project(input, input.slug || slug(input.title) || "project", {
              image,
              gallery,
            }),
          ],
        }),
        entry: ["projects", content.projects.length],
        ...uploaded,
      }),
    ),
  );

export const updateProject = (
  input: Saved & ProjectFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const existing = content.projects[input.index];
    if (!existing) return projectGone;
    return Effect.map(
      uploads(input, existing.image),
      ({ image, gallery, ...uploaded }) => ({
        kind: "edited",
        message: commitMessage(`update Project '${input.title}'`),
        documents: documents(content, {
          projects: content.projects.map((entry, i) =>
            i === input.index
              ? project(input, existing.slug, { image, gallery })
              : entry,
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
