"use server";

import {
  field,
  type FormState,
  index,
  localized,
  publish,
  techIds,
  upload,
} from "@/app/admin/action-form";
import { readPeriod } from "@/app/admin/period-input";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/admin/projects";

/**
 * The Projects editor's Server Actions (see `app/admin/action-form.ts`). An
 * image upload travels in the same form: the request body limit is
 * `serverActions` in `next.config.ts`.
 */

// Star counts are never read from the form: they are not editable.
const projectFields = (form: FormData) => {
  const image = upload(form, "image");
  const galleryImage = upload(form, "galleryImage");
  return {
    revision: field(form, "revision"),
    title: field(form, "title"),
    // Only read on creation: a Project's slug never changes.
    slug: field(form, "slug"),
    description: localized(form, "description"),
    wip: form.get("wip") !== null,
    period: readPeriod(form, "period"),
    techs: techIds(form),
    externalLink: field(form, "externalLink"),
    repository: field(form, "repository"),
    openSource: form.get("openSource") !== null,
    rarity: field(form, "rarity"),
    featured: field(form, "featured"),
    ...(image && { image }),
    role: localized(form, "role"),
    context: localized(form, "context"),
    built: localized(form, "built"),
    outcome: localized(form, "outcome"),
    gallery: form
      .getAll("gallery")
      .filter((path): path is string => typeof path === "string"),
    ...(galleryImage && { galleryImage }),
  };
};

export async function createProjectAction(_: FormState, form: FormData) {
  return publish(createProject, projectFields(form));
}

export async function updateProjectAction(_: FormState, form: FormData) {
  return publish(updateProject, { ...projectFields(form), index: index(form) });
}

export async function deleteProjectAction(_: FormState, form: FormData) {
  return publish(deleteProject, {
    revision: field(form, "revision"),
    index: index(form),
  });
}
