"use client";

import { useTranslations } from "next-intl";

import { ChibiHead } from "@/components/chibi/ChibiHead";
import { TypographyTitle } from "@/components/typography";

/**
 * The player card: the chibi head in its live status ring, the handle and
 * one line with Lucas's role and city. No level, rank or XP.
 */
export function PlayerCard() {
  const t = useTranslations("Sidebar");
  return (
    <div className="tray flex items-center gap-4 rounded-lg bg-raised p-4">
      <ChibiHead size={64} />
      <div className="min-w-0">
        <TypographyTitle as="p" className="text-[1.375rem] leading-tight">
          ImJustLucas
        </TypographyTitle>
        <span className="mt-1 block text-label text-ink-muted">
          {t("playerLine")}
        </span>
      </div>
    </div>
  );
}
