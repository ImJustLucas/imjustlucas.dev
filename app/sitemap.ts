import type { MetadataRoute } from "next";

import { projectPath, ROUTES } from "@/config/routes";
import { SITE_URL } from "@/config/site";
import { localizedPath } from "@/i18n/alternates";
import { routing } from "@/i18n/routing";
import { getProjectSlugs } from "@/lib/content/server";

const url = (path: string) => new URL(path, SITE_URL).href;

/** A page (path without Locale) in every Locale, each with its alternates. */
const inEveryLocale = (path: string, priority: number) =>
  routing.locales.map((locale) => ({
    url: url(localizedPath(path, locale)),
    changeFrequency: "monthly" as const,
    priority,
    alternates: {
      languages: {
        ...Object.fromEntries(
          routing.locales.map((other) => [
            other,
            url(localizedPath(path, other)),
          ]),
        ),
        "x-default": url(localizedPath(path, routing.defaultLocale)),
      },
    },
  }));

/**
 * `/sitemap.xml`: every Route and every Project's page in every Locale, each
 * with its URL in the other Locales (hreflang), on the served host. The Admin
 * is no Route, so it is never listed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs();
  return [
    ...Object.values(ROUTES).flatMap((route) =>
      inEveryLocale(route.path, route.path === "/" ? 1 : 0.7),
    ),
    ...slugs.flatMap((slug) => inEveryLocale(projectPath(slug), 0.6)),
  ];
}
