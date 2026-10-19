"use server";

import { refresh } from "next/cache";

import type { AdminActionResult } from "@/lib/admin/action-result";
import { saveProfile } from "@/lib/admin/server";

/**
 * The Profile editor's Server Actions: each reads its form, then runs the
 * matching Admin action, which checks the Owner itself (Server Actions are
 * public endpoints) and commits through his GitHub token. A Resume travels
 * in its form: the request body limit is `serverActions` in `next.config.ts`.
 */

type FormState = AdminActionResult | undefined;

const field = (form: FormData, name: string): string => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/** After a save, the editor re-reads `main` so it carries the new revision. */
const published = (result: AdminActionResult) => {
  if (result.kind === "saved") refresh();
  return result;
};

export async function updateProfileAction(_: FormState, form: FormData) {
  return published(
    await saveProfile.updateProfile({
      revision: field(form, "revision"),
      links: {
        github: field(form, "links.github"),
        linkedin: field(form, "links.linkedin"),
        youtube: field(form, "links.youtube"),
        instagram: field(form, "links.instagram"),
      },
      youtubeChannelId: field(form, "youtubeChannelId"),
      discordUserId: field(form, "discordUserId"),
    }),
  );
}

export async function uploadResumeAction(
  _: FormState,
  form: FormData,
): Promise<AdminActionResult> {
  const locale = field(form, "locale");
  if (locale !== "en" && locale !== "fr")
    return { kind: "refused", reason: "Locale inconnue." };
  const file = form.get("file");
  // No file picked: empty bytes, which the action reports as a field error.
  const bytes =
    file instanceof File
      ? new Uint8Array(await file.arrayBuffer())
      : new Uint8Array();
  return published(
    await saveProfile.uploadResume({
      revision: field(form, "revision"),
      locale,
      file: bytes,
    }),
  );
}
