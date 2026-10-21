import type { Metadata, ResolvingMetadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { OPEN_GRAPH_LOCALES } from "@/components/page-header";
import { projectPath } from "@/config/routes";
import { localeAlternates } from "@/i18n/alternates";
import { routing } from "@/i18n/routing";
import { getProject } from "@/lib/content/server";

import "server-only";

/**
 * A Project page's `generateMetadata`, as `routeMetadata` builds a Route's:
 * the Project's title and description in the page's Locale, its URL in every
 * Locale, and its link preview, with its screenshot as the image (else the
 * Locale's preview image, `opengraph-image.tsx`).
 */
export async function projectMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale: param, slug } = await params;
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale;
  const [project, t] = await Promise.all([
    getProject(locale, slug),
    getTranslations({ locale }),
  ]);
  if (!project) return {};

  const siteName = t("Metadata.siteName");
  const title = `${project.title} · ${siteName}`;
  const { description } = project;
  const alternates = localeAlternates(projectPath(slug), locale);
  // A page's `openGraph` and `twitter` replace its Locale's whole.
  const inherited = await parent;

  return {
    title,
    description,
    alternates,
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: alternates.canonical,
      images: project.image ? [project.image] : inherited.openGraph?.images,
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: routing.locales
        .filter((other) => other !== locale)
        .map((other) => OPEN_GRAPH_LOCALES[other]),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.image ? [project.image] : inherited.twitter?.images,
    },
  };
}
