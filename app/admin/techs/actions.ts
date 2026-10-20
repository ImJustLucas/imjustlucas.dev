"use server";

import { field, type FormState, publish } from "@/app/admin/action-form";
import { createTech, deleteTech, updateTech } from "@/lib/admin/techs";

/** The Techs editor's Server Actions (see `app/admin/action-form.ts`). */

const techFields = (form: FormData) => ({
  revision: field(form, "revision"),
  id: field(form, "id"),
  name: field(form, "name"),
  color: field(form, "color"),
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
