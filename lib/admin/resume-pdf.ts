/**
 * Which files are accepted as a Resume. Plain code, no Effect (ADR-0002): the
 * Admin's Resume field reads the limit.
 */

/** Keeps the whole upload under Vercel's 4.5 MB request body cap. */
export const RESUME_MAX_BYTES = 4 * 1024 * 1024;

/** Why `bytes` cannot be a Resume, if they cannot. */
export const resumePdfError = (bytes: Uint8Array): string | undefined => {
  // Every PDF starts with `%PDF-`.
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d];
  if (!signature.every((byte, i) => bytes[i] === byte)) return "PDF attendu";
  if (bytes.length > RESUME_MAX_BYTES)
    return "PDF trop lourd : 4 Mo au maximum";
  return undefined;
};
