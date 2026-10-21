import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { projectPath } from "@/config/routes";
import { localeAlternates } from "@/i18n/alternates";
import { routing } from "@/i18n/routing";
import { getProject } from "@/lib/content/server";

import "server-only";

/**
 * Builds a Project page's `generateMetadata`, as `routeMetadata` does for a
 * Route: the Project's title and description in the page's Locale, its
 * screenshot as the share image, and its URL in every Locale.
 */
export async function projectMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: param, slug } = await params;
  const locale = hasLocale(routing.locales, param)
    ? param
    : routing.defaultLocale;
  const [project, t] = await Promise.all([
    getProject(locale, slug),
    getTranslations({ locale }),
  ]);
  if (!project) return {};

  const title = `${project.title} · ${t("Metadata.siteName")}`;
  return {
    title,
    description: project.description,
    alternates: localeAlternates(projectPath(slug), locale),
    openGraph: {
      title,
      description: project.description,
      ...(project.image && { images: [project.image] }),
    },
  };
}
