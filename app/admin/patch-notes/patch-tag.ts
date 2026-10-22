import type { PatchTag } from "@/lib/content/types";

/**
 * The three tags in French, in the order the public page groups them. Plain
 * code, so the editor page (a server component) reads it too.
 */
export const PATCH_TAG_LABEL: Readonly<Record<PatchTag, string>> = {
  new: "Nouveau",
  changed: "Modifié",
  fixed: "Corrigé",
};
