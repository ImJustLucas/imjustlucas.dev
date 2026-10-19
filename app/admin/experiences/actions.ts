"use server";

import {
  field,
  type FormState,
  index,
  localized,
  publish,
} from "@/app/admin/action-form";
import { readPeriod } from "@/app/admin/period-input";
import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "@/lib/admin/experiences";

/** The Experiences editor's Server Actions (see `app/admin/action-form.ts`). */

const experienceFields = (form: FormData) => ({
  revision: field(form, "revision"),
  company: field(form, "company"),
  role: localized(form, "role"),
  contractType: field(form, "contractType"),
  link: field(form, "link"),
  description: localized(form, "description"),
  period: readPeriod(form, "period"),
});

export async function createExperienceAction(_: FormState, form: FormData) {
  return publish(createExperience, experienceFields(form));
}

export async function updateExperienceAction(_: FormState, form: FormData) {
  return publish(updateExperience, {
    ...experienceFields(form),
    index: index(form),
  });
}

export async function deleteExperienceAction(_: FormState, form: FormData) {
  return publish(deleteExperience, {
    revision: field(form, "revision"),
    index: index(form),
  });
}
