import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { TypographyHeadline } from "@/components/typography";
import type { Route } from "@/config/routes";
import { localeAlternates } from "@/i18n/alternates";
import { routing } from "@/i18n/routing";

/** The page title of a Route in the current Locale, at the top of its page. */
export async function PageHeader({ route }: { route: Route }) {
  const t = await getTranslations("Routes");
  return (
    <TypographyHeadline className="mb-6">
      {t(`${route.messageKey}.title`)}
    </TypographyHeadline>
  );
}

/**
 * Builds a page's `generateMetadata` from its Route: title and description in
 * the page's Locale, and its URL in every Locale.
 * `export const generateMetadata = routeMetadata(ROUTES.what);`
 */
export function routeMetadata(
  route: Route,
): (props: { params: Promise<{ locale: string }> }) => Promise<Metadata> {
  return async ({ params }) => {
    const { locale: param } = await params;
    const locale = hasLocale(routing.locales, param)
      ? param
      : routing.defaultLocale;
    const t = await getTranslations({ locale });

    return {
      title: `${t(`Routes.${route.messageKey}.title`)} · ${t("Metadata.siteName")}`,
      description: t(`Routes.${route.messageKey}.description`),
      alternates: localeAlternates(route.path, locale),
    };
  };
}
