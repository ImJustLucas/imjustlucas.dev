"use server";

import {
  field,
  type FormState,
  index,
  localized,
  publish,
  techIds,
} from "@/app/admin/action-form";
import {
  createTech,
  createTechCategory,
  deleteTech,
  deleteTechCategory,
  updateTech,
  updateTechCategory,
} from "@/lib/admin/techs";

/** The Techs editor's Server Actions (see `app/admin/action-form.ts`). */

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
  techs: techIds(form),
});

export async function createTechAction(_: FormState, form: FormData) {
  return publish(createTech, techFields(form));
}

export async function updateTechAction(_: FormState, form: FormData) {
  return publish(updateTech, techFields(form));
}

export async function deleteTechAction(_: FormState, form: FormData) {
  return publish(deleteTech, {
    revision: field(form, "revision"),
    id: field(form, "id"),
  });
}

export async function createTechCategoryAction(_: FormState, form: FormData) {
  return publish(createTechCategory, techCategoryFields(form));
}

export async function updateTechCategoryAction(_: FormState, form: FormData) {
  return publish(updateTechCategory, {
    ...techCategoryFields(form),
    index: index(form),
  });
}

export async function deleteTechCategoryAction(_: FormState, form: FormData) {
  return publish(deleteTechCategory, {
    revision: field(form, "revision"),
    index: index(form),
  });
}
