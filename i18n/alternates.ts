import { type Locale, routing } from "./routing";

/** The URL path of `path` (without Locale prefix) in `locale`. */
function localizedPath(path: string, locale: Locale): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * The `alternates` metadata of the page at `path` (without Locale prefix) read
 * in `locale`: its canonical URL and its URL in every Locale.
 */
export function localeAlternates(path: string, locale: Locale) {
  return {
    canonical: localizedPath(path, locale),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((other) => [other, localizedPath(path, other)]),
      ),
      "x-default": localizedPath(path, routing.defaultLocale),
    },
  };
}
