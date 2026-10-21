import type { MetadataRoute } from "next";

import { ROUTES } from "@/config/routes";
import { SITE_URL } from "@/config/site";
import { localizedPath } from "@/i18n/alternates";
import { routing } from "@/i18n/routing";

const url = (path: string) => new URL(path, SITE_URL).href;

/**
 * `/sitemap.xml`: every Route in every Locale, each with its URL in the other
 * Locales (hreflang), on the served host. The Admin is no Route, so it is
 * never listed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(ROUTES).flatMap((route) =>
    routing.locales.map((locale) => ({
      url: url(localizedPath(route.path, locale)),
      changeFrequency: "monthly" as const,
      priority: route.path === "/" ? 1 : 0.7,
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((other) => [
              other,
              url(localizedPath(route.path, other)),
            ]),
          ),
          "x-default": url(localizedPath(route.path, routing.defaultLocale)),
        },
      },
    })),
  );
}
