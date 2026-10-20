"use server";

import {
  field,
  type FormState,
  index,
  localized,
  publish,
} from "@/app/admin/action-form";
import {
  createHobby,
  deleteHobby,
  moveHobby,
  updateHobby,
} from "@/lib/admin/hobbies";

/** The Hobbies editor's Server Actions (see `app/admin/action-form.ts`). */

const hobbyFields = (form: FormData) => ({
  revision: field(form, "revision"),
  label: localized(form, "label"),
  pose: field(form, "pose"),
});

export async function createHobbyAction(_: FormState, form: FormData) {
  return publish(createHobby, hobbyFields(form));
}

export async function updateHobbyAction(_: FormState, form: FormData) {
  return publish(updateHobby, { ...hobbyFields(form), index: index(form) });
}

export async function deleteHobbyAction(_: FormState, form: FormData) {
  return publish(deleteHobby, {
    revision: field(form, "revision"),
    index: index(form),
  });
}

export async function moveHobbyAction(_: FormState, form: FormData) {
  return publish(moveHobby, {
    revision: field(form, "revision"),
    index: index(form),
    direction: field(form, "direction") === "down" ? "down" : "up",
  });
}
