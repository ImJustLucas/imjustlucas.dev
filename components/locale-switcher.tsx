"use client";

import { useLocale, useTranslations } from "next-intl";

import { useSounds } from "@/components/sound/SoundProvider";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Switches to the other Locale, staying on the equivalent page. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const { play } = useSounds();
  const t = useTranslations("LocaleSwitcher");
  const other = routing.locales.find((candidate) => candidate !== locale)!;

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      lang={other}
      title={t("switch")}
      onClick={() => play("toggleOn")}
      className="ledge inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-raised font-mono text-data uppercase text-ink"
    >
      <span aria-hidden="true">{other}</span>
      <span className="sr-only">{t("switch")}</span>
    </Link>
  );
}
