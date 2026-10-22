import { createHmac } from "node:crypto";

/**
 * Who is waving, as the limits know them: a keyed hash of their IP address,
 * so a raw address is never stored. The key is a secret only the server
 * holds (the webhook's address), so the hash cannot be reversed by trying
 * every address.
 */
export const visitorKey = (address: string, secret: string) =>
  createHmac("sha256", secret).update(address).digest("base64url").slice(0, 22);

/** The visitor's address, as Vercel's proxy reports it. */
export const clientAddress = (forwardedFor: string | null) =>
  forwardedFor?.split(",")[0]?.trim() || "local";
