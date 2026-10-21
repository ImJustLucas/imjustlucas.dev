import { checkUpload } from "@/lib/admin/upload";

/**
 * Where an uploaded image is stored: a Project image or an Achievement's art.
 * Plain code, no Effect (ADR-0002); which files are accepted is
 * `lib/admin/upload.ts`.
 */

export type UploadedImage =
  | {
      readonly kind: "image";
      /** Repository path of the file, under `public/`. */
      readonly path: string;
      /** The entry's image path: its URL path on the site. */
      readonly url: string;
    }
  | { readonly kind: "invalid"; readonly error: string };

/** A Project image, named after the Project's title. */
export const projectImage = (title: string, bytes: Uint8Array) =>
  storedIn("/images/projects/", slug(title) || "project", bytes);

/** An Achievement's art, named after its English name. */
export const achievementArt = (name: string, bytes: Uint8Array) =>
  storedIn("/images/achievements/", slug(name) || "achievement", bytes);

/**
 * Names an uploaded image after its entry and a fingerprint of its bytes, so
 * a new image never reuses the URL (and cached copies) of the old.
 */
const storedIn = (
  folder: string,
  name: string,
  bytes: Uint8Array,
): UploadedImage => {
  const checked = checkUpload("image", bytes);
  if (checked.kind === "invalid") return checked;
  const url = `${folder}${name}-${fingerprint(bytes)}.${checked.extension}`;
  return { kind: "image", path: `public${url}`, url };
};

/** `Tricks Network` → `tricks-network`; empty when nothing is left. */
export const slug = (title: string) =>
  title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** FNV-1a, 32 bits, as 8 hex digits: a cache key, not a security measure. */
const fingerprint = (bytes: Uint8Array) => {
  let hash = 0x811c9dc5;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 0x01000193);
  return (hash >>> 0).toString(16).padStart(8, "0");
};
