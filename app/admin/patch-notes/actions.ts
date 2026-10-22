"use server";

import {
  field,
  type FormState,
  index,
  localized,
  publish,
} from "@/app/admin/action-form";
import { createPatch, deletePatch, updatePatch } from "@/lib/admin/patch-notes";

/** The patch notes editor's Server Actions (see `app/admin/action-form.ts`). */

/** The lines a `PatchEntriesField` posted, in display order. */
const entries = (form: FormData) => {
  const lines = [];
  for (let i = 0; form.has(`entries.${i}.tag`); i++)
    lines.push({
      tag: field(form, `entries.${i}.tag`),
      text: localized(form, `entries.${i}.text`),
    });
  return lines;
};

const patchFields = (form: FormData) => ({
  revision: field(form, "revision"),
  version: field(form, "version"),
  date: field(form, "date"),
  title: localized(form, "title"),
  entries: entries(form),
  link: field(form, "link"),
});

export async function createPatchAction(_: FormState, form: FormData) {
  return publish(createPatch, patchFields(form));
}

export async function updatePatchAction(_: FormState, form: FormData) {
  return publish(updatePatch, { ...patchFields(form), index: index(form) });
}

export async function deletePatchAction(_: FormState, form: FormData) {
  return publish(deletePatch, {
    revision: field(form, "revision"),
    index: index(form),
  });
}
