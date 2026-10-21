import type { Metadata, ResolvingMetadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { TypographyHeadline, TypographyP } from "@/components/typography";
import type { Route } from "@/config/routes";
import { localeAlternates } from "@/i18n/alternates";
import { type Locale, routing } from "@/i18n/routing";
import type { ChibiPose } from "@/lib/chibi";

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
 * The page banner: a smaller cousin of the home banner. The page title, one
 * line in Lucas's voice, and a chibi pose on its stage disc, in a raised slot
 * with a seam border and the tray.
 */
export async function PageBanner({
  route,
  intro,
  pose,
  poseAlt,
}: {
  route: Route;
  intro: string;
  pose: ChibiPose;
  poseAlt: string;
}) {
  const t = await getTranslations("Routes");
  return (
    <header className="tray relative grid grid-cols-[1fr_96px] items-center gap-x-4 gap-y-3 overflow-hidden rounded-lg border-2 border-seam bg-raised p-4 sm:grid-cols-[1fr_128px] sm:p-6 md:grid-cols-[1fr_160px] md:gap-x-8 md:px-7 md:py-5">
      {/* On phones the title takes the full row, the chibi sits by the line */}
      <TypographyHeadline className="col-span-2 sm:col-span-1 sm:self-end">
        {t(`${route.messageKey}.title`)}
      </TypographyHeadline>
      <TypographyP className="col-start-1 text-pretty text-[1.0625rem] font-medium text-ink-muted sm:self-start [&:not(:first-child)]:mt-0">
        {intro}
      </TypographyP>
      <div className="relative col-start-2 row-start-2 self-end sm:row-span-2 sm:row-start-1">
        {/* The chibi's stage, as on the home banner */}
        <span
          aria-hidden
          className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
        />
        <ChibiSprite
          pose={pose}
          alt={poseAlt}
          sizes="(min-width: 768px) 160px, (min-width: 640px) 128px, 96px"
          priority
          className="aspect-square w-full"
        />
      </div>
    </header>
  );
}

/** Open Graph locale of each Locale. */
export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

/**
 * Builds a page's `generateMetadata` from its Route: title and description in
 * the page's Locale, its URL in every Locale, and the same for link previews
 * (the preview image is `app/[locale]/opengraph-image.tsx`). The home's title
 * leads with the Owner's real name, the query it must rank for (docs/seo.md).
 * `export const generateMetadata = routeMetadata(ROUTES.what);`
 */
export function routeMetadata(
  route: Route,
): (
  props: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata,
) => Promise<Metadata> {
  return async ({ params }, parent) => {
    const { locale: param } = await params;
    const locale = hasLocale(routing.locales, param)
      ? param
      : routing.defaultLocale;
    const t = await getTranslations({ locale });

    const siteName = t("Metadata.siteName");
    const title =
      route.path === "/"
        ? t("Metadata.homeTitle")
        : `${t(`Routes.${route.messageKey}.title`)} · ${siteName}`;
    const description = t(`Routes.${route.messageKey}.description`);
    const alternates = localeAlternates(route.path, locale);
    // A page's `openGraph` and `twitter` replace its Locale's whole, so they
    // carry on the Locale's preview image (`opengraph-image.tsx`).
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
        images: inherited.openGraph?.images,
        locale: OPEN_GRAPH_LOCALES[locale],
        alternateLocale: routing.locales
          .filter((other) => other !== locale)
          .map((other) => OPEN_GRAPH_LOCALES[other]),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: inherited.twitter?.images,
      },
    };
  };
}
