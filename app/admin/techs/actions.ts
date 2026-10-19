"use server";

import { refresh } from "next/cache";

import type { AdminActionResult } from "@/lib/admin/action-result";
import { saveTechs } from "@/lib/admin/server";

/**
 * The Techs editor's Server Actions: each reads its form, then runs the
 * matching Admin action, which checks the Owner itself (Server Actions are
 * public endpoints) and commits through his GitHub token.
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

const techFields = (form: FormData) => ({
  revision: field(form, "revision"),
  id: field(form, "id"),
  name: field(form, "name"),
  color: field(form, "color"),
});

const techCategoryFields = (form: FormData) => ({
  revision: field(form, "revision"),
  name: localized(form, "name"),
  description: localized(form, "description"),
  techs: form
    .getAll("techs")
    .filter((id): id is string => typeof id === "string"),
});

const index = (form: FormData) => Number.parseInt(field(form, "index"), 10);

/** After a save, the editor re-reads `main` so it carries the new revision. */
const published = (result: AdminActionResult) => {
  if (result.kind === "saved") refresh();
  return result;
};

export async function createTechAction(_: FormState, form: FormData) {
  return published(await saveTechs.createTech(techFields(form)));
}

export async function updateTechAction(_: FormState, form: FormData) {
  return published(await saveTechs.updateTech(techFields(form)));
}

export async function deleteTechAction(_: FormState, form: FormData) {
  return published(
    await saveTechs.deleteTech({
      revision: field(form, "revision"),
      id: field(form, "id"),
    }),
  );
}

export async function createTechCategoryAction(_: FormState, form: FormData) {
  return published(
    await saveTechs.createTechCategory(techCategoryFields(form)),
  );
}

export async function updateTechCategoryAction(_: FormState, form: FormData) {
  return published(
    await saveTechs.updateTechCategory({
      ...techCategoryFields(form),
      index: index(form),
    }),
  );
}

export async function deleteTechCategoryAction(_: FormState, form: FormData) {
  return published(
    await saveTechs.deleteTechCategory({
      revision: field(form, "revision"),
      index: index(form),
    }),
  );
}
