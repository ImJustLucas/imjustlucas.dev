import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TypographyH2, TypographyP } from "@/components/typography";
import { Link } from "@/i18n/navigation";

/**
 * A Locale's 404 page, in that Locale and within the normal layout. `proxy.ts`
 * serves it, with a 404 status, for every path under a Locale that is no
 * Route; it is statically generated, so its HTML is fully rendered.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("NotFound.title")} · ${t("Metadata.siteName")}`,
    robots: { index: false },
  };
}

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="md:w-2/3 w-full">
      <TypographyH2>{t("title")}</TypographyH2>
      <TypographyP>{t("message")}</TypographyP>
      <TypographyP>
        <Link href="/" className="underline">
          {t("home")}
        </Link>
      </TypographyP>
    </div>
  );
}
