"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Switches to the other Locale, staying on the equivalent page. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const other = routing.locales.find((candidate) => candidate !== locale)!;

  return (
    <Button variant="outline" size="icon" asChild>
      <Link
        href={pathname}
        locale={other}
        hrefLang={other}
        lang={other}
        title={t("switch")}
      >
        <span aria-hidden="true">{other.toUpperCase()}</span>
        <span className="sr-only">{t("switch")}</span>
      </Link>
    </Button>
  );
}
