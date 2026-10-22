"use server";

import { hasLocale } from "next-intl";

import {
  field,
  type FormState,
  localized,
  publish,
  upload,
} from "@/app/admin/action-form";
import { routing } from "@/i18n/routing";
import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  updateProfile,
  updateRecruiter,
  uploadResume,
} from "@/lib/admin/profile";

/**
 * The Profile editor's Server Actions (see `app/admin/action-form.ts`). A
 * Resume travels in its form: the request body limit is `serverActions` in
 * `next.config.ts`.
 */

export async function updateProfileAction(_: FormState, form: FormData) {
  return publish(updateProfile, {
    revision: field(form, "revision"),
    links: {
      github: field(form, "links.github"),
      linkedin: field(form, "links.linkedin"),
      youtube: field(form, "links.youtube"),
      instagram: field(form, "links.instagram"),
    },
    youtubeChannelId: field(form, "youtubeChannelId"),
    discordUserId: field(form, "discordUserId"),
  });
}

/** The rows a `LanguagesField` posted, in display order. */
const languages = (form: FormData) => {
  const rows = [];
  for (let i = 0; form.has(`languages.${i}.code`); i++)
    rows.push({
      code: field(form, `languages.${i}.code`),
      name: localized(form, `languages.${i}.name`),
      level: localized(form, `languages.${i}.level`),
    });
  return rows;
};

export async function updateRecruiterAction(_: FormState, form: FormData) {
  return publish(updateRecruiter, {
    revision: field(form, "revision"),
    summary: localized(form, "summary"),
    availability: localized(form, "availability"),
    languages: languages(form),
  });
}

/** No file picked: empty bytes, which the action reports as a field error. */
const noFile = async () => new Uint8Array();

export async function uploadResumeAction(
  _: FormState,
  form: FormData,
): Promise<AdminActionResult> {
  const locale = field(form, "locale");
  if (!hasLocale(routing.locales, locale))
    return { kind: "refused", reason: "Locale inconnue." };
  return publish(uploadResume, {
    revision: field(form, "revision"),
    locale,
    file: upload(form, "file") ?? noFile,
  });
}
