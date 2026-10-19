import { checkUpload } from "@/lib/admin/upload";

/**
 * Where an uploaded Project image is stored. Plain code, no Effect
 * (ADR-0002); which files are accepted is `lib/admin/upload.ts`.
 */

export type ProjectImage =
  | {
      readonly kind: "image";
      /** Repository path of the file, under `public/`. */
      readonly path: string;
      /** The Project's `image`: its URL path on the site. */
      readonly url: string;
    }
  | { readonly kind: "invalid"; readonly error: string };

/**
 * Names an uploaded image after its Project's title and a fingerprint of its
 * bytes, so a new image never reuses the URL (and cached copies) of the old.
 */
export const projectImage = (
  title: string,
  bytes: Uint8Array,
): ProjectImage => {
  const checked = checkUpload("image", bytes);
  if (checked.kind === "invalid") return checked;
  const url = `/images/projects/${slug(title)}-${fingerprint(bytes)}.${checked.extension}`;
  return { kind: "image", path: `public${url}`, url };
};

/** `Tricks Network` → `tricks-network`; `project` when nothing is left. */
const slug = (title: string) =>
  title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

/** FNV-1a, 32 bits, as 8 hex digits: a cache key, not a security measure. */
const fingerprint = (bytes: Uint8Array) => {
  let hash = 0x811c9dc5;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 0x01000193);
  return (hash >>> 0).toString(16).padStart(8, "0");
};
