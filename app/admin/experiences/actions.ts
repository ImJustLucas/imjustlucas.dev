"use server";

import { refresh } from "next/cache";

import { readPeriod } from "@/app/admin/period-input";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { saveExperiences } from "@/lib/admin/server";

/**
 * The Experiences editor's Server Actions: each reads its form, then runs the
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

const experienceFields = (form: FormData) => ({
  revision: field(form, "revision"),
  company: field(form, "company"),
  role: localized(form, "role"),
  contractType: field(form, "contractType"),
  link: field(form, "link"),
  description: localized(form, "description"),
  period: readPeriod(form, "period"),
});

const index = (form: FormData) => Number.parseInt(field(form, "index"), 10);

/** After a save, the editor re-reads `main` so it carries the new revision. */
const published = (result: AdminActionResult) => {
  if (result.kind === "saved") refresh();
  return result;
};

export async function createExperienceAction(_: FormState, form: FormData) {
  return published(
    await saveExperiences.createExperience(experienceFields(form)),
  );
}

export async function updateExperienceAction(_: FormState, form: FormData) {
  return published(
    await saveExperiences.updateExperience({
      ...experienceFields(form),
      index: index(form),
    }),
  );
}

export async function deleteExperienceAction(_: FormState, form: FormData) {
  return published(
    await saveExperiences.deleteExperience({
      revision: field(form, "revision"),
      index: index(form),
    }),
  );
}
