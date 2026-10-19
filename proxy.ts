import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Locale routing: the root address (and any unprefixed path not covered by a
 * legacy redirect) is sent to the Locale from the `NEXT_LOCALE` cookie, then the
 * browser language, falling back to English.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except the Admin, API routes, Next and Vercel internals and
  // files (paths with a dot, e.g. the Resume PDFs).
  matcher: "/((?!(?:admin|api)(?:/|$)|_next|_vercel|.*\\..*).*)",
};
