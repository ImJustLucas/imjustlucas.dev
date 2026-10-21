import { type NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";

import { projectPath, ROUTES } from "./config/routes";
import projects from "./content/projects.json";
import { routing } from "./i18n/routing";

/**
 * Locale routing: the root address (and any unprefixed path not covered by a
 * legacy redirect) is sent to the Locale of the browser language, falling
 * back to English. No Locale cookie is kept (`localeCookie: false`).
 */
const localeRouting = createMiddleware(routing);

/** Where a Locale's 404 page is generated (`app/[locale]/page-not-found`). */
export const NOT_FOUND_PAGE = "/page-not-found";

/**
 * Every page under a Locale: the Routes and the page of each Project. The
 * content is read at build time: every Admin save is a commit, so a deploy.
 */
const PAGE_PATHS = new Set<string>([
  ...Object.values(ROUTES).map((route) => route.path),
  ...projects.map((project) => projectPath(project.slug)),
]);

/**
 * Files Next generates under a Locale, served as they are: the link preview
 * image (`app/[locale]/opengraph-image.tsx`), whose URL has no extension.
 */
const LOCALE_FILES = new Set<string>(["/opengraph-image"]);

/**
 * The Locale of a path under a Locale that is no page, e.g. `/fr/xyz`.
 * `notFound()` in a page renders its 404 in the browser only (Next serves an
 * empty error shell), so unknown paths are rewritten to the Locale's
 * statically generated 404 page instead, fully rendered in that Locale.
 */
const unknownUnderLocale = (pathname: string) => {
  const [, locale, ...rest] = pathname.split("/");
  if (!hasLocale(routing.locales, locale)) return undefined;
  const path = `/${rest.join("/")}`;
  return PAGE_PATHS.has(path) || LOCALE_FILES.has(path) ? undefined : locale;
};

export default function proxy(request: NextRequest) {
  const locale = unknownUnderLocale(request.nextUrl.pathname);
  if (locale)
    return NextResponse.rewrite(
      new URL(`/${locale}${NOT_FOUND_PAGE}`, request.url),
      { status: 404 },
    );
  return localeRouting(request);
}

export const config = {
  // Everything except the Admin, API routes, Next and Vercel internals and
  // files (paths with a dot, e.g. the Resume PDFs).
  matcher: "/((?!(?:admin|api)(?:/|$)|_next|_vercel|.*\\..*).*)",
};
