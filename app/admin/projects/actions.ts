"use server";

import { refresh } from "next/cache";

import { readPeriod } from "@/app/admin/period-input";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { saveProjects } from "@/lib/admin/server";

/**
 * The Projects editor's Server Actions: each reads its form, then runs the
 * matching Admin action, which checks the Owner itself (Server Actions are
 * public endpoints) and commits through his GitHub token. An image upload
 * travels in the same form: the request body limit is `serverActions` in
 * `next.config.ts`.
 */

type FormState = AdminActionResult | undefined;

const field = (form: FormData, name: string): string => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

const localized = (form: FormData, name: string) => ({
  en: field(form, `${name}.en`),
  fr: field(form, `${name}.fr`),
});

/** The uploaded image's bytes; none when no file was picked. */
const image = async (form: FormData) => {
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) return {};
  return { image: new Uint8Array(await file.arrayBuffer()) };
};

// Star counts are never read from the form: they are not editable.
const projectFields = async (form: FormData) => ({
  revision: field(form, "revision"),
  title: field(form, "title"),
  description: localized(form, "description"),
  wip: form.get("wip") !== null,
  period: readPeriod(form, "period"),
  techs: form
    .getAll("techs")
    .filter((id): id is string => typeof id === "string"),
  externalLink: field(form, "externalLink"),
  repository: field(form, "repository"),
  openSource: form.get("openSource") !== null,
  ...(await image(form)),
});

const index = (form: FormData) => Number.parseInt(field(form, "index"), 10);

/** After a save, the editor re-reads `main` so it carries the new revision. */
const published = (result: AdminActionResult) => {
  if (result.kind === "saved") refresh();
  return result;
};

export async function createProjectAction(_: FormState, form: FormData) {
  return published(await saveProjects.createProject(await projectFields(form)));
}

export async function updateProjectAction(_: FormState, form: FormData) {
  return published(
    await saveProjects.updateProject({
      ...(await projectFields(form)),
      index: index(form),
    }),
  );
}

export async function deleteProjectAction(_: FormState, form: FormData) {
  return published(
    await saveProjects.deleteProject({
      revision: field(form, "revision"),
      index: index(form),
    }),
  );
}
