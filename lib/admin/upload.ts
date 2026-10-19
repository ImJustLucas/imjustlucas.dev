/**
 * Which files the Admin accepts as uploads: the kinds, how each format is
 * recognised from its first bytes, the one size limit and the messages.
 * Plain code, no Effect (ADR-0002): the Admin's file field reads it too.
 */

/** Keeps the whole upload under Vercel's 4.5 MB request body cap. */
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

const MAX = `${UPLOAD_MAX_BYTES / 1024 / 1024} Mo au maximum`;

type Format = {
  readonly extension: string;
  readonly mimeType: string;
  /** Recognises the format from the file's first bytes. */
  readonly matches: (bytes: Uint8Array) => boolean;
};

const startsWith = (bytes: Uint8Array, prefix: ReadonlyArray<number>) =>
  prefix.every((byte, i) => bytes[i] === byte);

const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.subarray(from, to));

const UPLOAD_KINDS = {
  /** A Project image. */
  image: {
    formats: [
      {
        extension: "png",
        mimeType: "image/png",
        matches: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]),
      },
      {
        extension: "jpg",
        mimeType: "image/jpeg",
        matches: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
      },
      {
        extension: "webp",
        mimeType: "image/webp",
        matches: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
      },
      {
        extension: "avif",
        mimeType: "image/avif",
        matches: (b) => ascii(b, 4, 8) === "ftyp" && ascii(b, 8, 12) === "avif",
      },
    ],
    hint: `PNG, JPEG, WebP ou AVIF, ${MAX}`,
    wrongFormat: "Image attendue au format PNG, JPEG, WebP ou AVIF",
    tooHeavy: `Image trop lourde : ${MAX}`,
  },
  /** A Resume. Every PDF starts with `%PDF-`. */
  pdf: {
    formats: [
      {
        extension: "pdf",
        mimeType: "application/pdf",
        matches: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]),
      },
    ],
    hint: MAX,
    wrongFormat: "PDF attendu",
    tooHeavy: `PDF trop lourd : ${MAX}`,
  },
} satisfies Record<
  string,
  {
    readonly formats: ReadonlyArray<Format>;
    /** What the file field says it accepts. */
    readonly hint: string;
    readonly wrongFormat: string;
    readonly tooHeavy: string;
  }
>;

export type UploadKind = keyof typeof UPLOAD_KINDS;

/** What the file field shows and checks before sending, for `kind`. */
export const uploadField = (kind: UploadKind) => ({
  /** For the file input's `accept`. */
  accept: UPLOAD_KINDS[kind].formats.map((f) => f.mimeType).join(","),
  hint: UPLOAD_KINDS[kind].hint,
  tooHeavy: UPLOAD_KINDS[kind].tooHeavy,
});

export type CheckedUpload =
  | { readonly kind: "accepted"; readonly extension: string }
  | { readonly kind: "invalid"; readonly error: string };

/** Whether `bytes` are an accepted file of `kind`, and its extension. */
export const checkUpload = (
  kind: UploadKind,
  bytes: Uint8Array,
): CheckedUpload => {
  const { formats, wrongFormat, tooHeavy } = UPLOAD_KINDS[kind];
  const format = formats.find((candidate) => candidate.matches(bytes));
  if (!format) return { kind: "invalid", error: wrongFormat };
  if (bytes.length > UPLOAD_MAX_BYTES)
    return { kind: "invalid", error: tooHeavy };
  return { kind: "accepted", extension: format.extension };
};
