/**
 * Where an uploaded Project image is stored, and which files are accepted.
 * Plain code, no Effect (ADR-0002): the Admin's image field reads the limits.
 */

/** Keeps the whole upload under Vercel's 4.5 MB request body cap. */
export const PROJECT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/** For the file input's `accept`. */
export const PROJECT_IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/avif";

const FORMATS: ReadonlyArray<{
  readonly extension: string;
  /** Recognises the format from the file's first bytes. */
  readonly matches: (bytes: Uint8Array) => boolean;
}> = [
  { extension: "png", matches: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]) },
  { extension: "jpg", matches: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  {
    extension: "webp",
    matches: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },
  {
    extension: "avif",
    matches: (b) => ascii(b, 4, 8) === "ftyp" && ascii(b, 8, 12) === "avif",
  },
];

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
  const format = FORMATS.find((candidate) => candidate.matches(bytes));
  if (!format)
    return {
      kind: "invalid",
      error: "Image attendue au format PNG, JPEG, WebP ou AVIF",
    };
  if (bytes.length > PROJECT_IMAGE_MAX_BYTES)
    return { kind: "invalid", error: "Image trop lourde : 4 Mo au maximum" };
  const url = `/images/projects/${slug(title)}-${fingerprint(bytes)}.${format.extension}`;
  return { kind: "image", path: `public${url}`, url };
};

const startsWith = (bytes: Uint8Array, prefix: ReadonlyArray<number>) =>
  prefix.every((byte, i) => bytes[i] === byte);

const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.subarray(from, to));

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
