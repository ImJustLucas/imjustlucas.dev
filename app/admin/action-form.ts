import { refresh } from "next/cache";

import type { AdminActionResult } from "@/lib/admin/action-result";
import type { AdminAction, Upload } from "@/lib/admin/admin-action";
import { runAdminAction } from "@/lib/admin/server";

/**
 * What every editor's Server Actions share: reading their form, then
 * publishing through the matching Admin action, which checks the Owner
 * itself (Server Actions are public endpoints) and commits through his
 * GitHub token. A Period is read with `readPeriod` (`period-input.ts`).
 */

/** The state `AdminForm` keeps: the last result, none before a submit. */
export type FormState = AdminActionResult | undefined;

/** A text input's value, trimmed; empty when absent. */
export const field = (form: FormData, name: string): string => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/** A `LocalizedField`'s values, `<name>.en` and `<name>.fr`. */
export const localized = (form: FormData, name: string) => ({
  en: field(form, `${name}.en`),
  fr: field(form, `${name}.fr`),
});

/** The stored position an editor entry is addressed by. */
export const index = (form: FormData) =>
  Number.parseInt(field(form, "index"), 10);

/** The Tech identifiers a `TechPicker` posted, in display order. */
export const techIds = (form: FormData) =>
  form.getAll("techs").filter((id): id is string => typeof id === "string");

/**
 * The file a `FileField` posted, read by the Admin action only once the
 * Owner is checked; none when no file was picked.
 */
export const upload = (form: FormData, name: string): Upload | undefined => {
  const file = form.get(name);
  if (!(file instanceof File) || file.size === 0) return undefined;
  return async () => new Uint8Array(await file.arrayBuffer());
};

/**
 * Runs the Admin action; after a save, the editor re-reads `main` so it
 * carries the new revision.
 */
export const publish = async <I>(
  action: (input: I) => AdminAction,
  input: I,
): Promise<AdminActionResult> => {
  const result = await runAdminAction(action, input);
  if (result.kind === "saved") refresh();
  return result;
};
