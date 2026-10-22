"use client";

import { useTranslations } from "next-intl";

import { TypographyData } from "@/components/typography";

/**
 * The showcase loading: the well's own ground, a ring and the progress.
 * Free of three.js, so it shows while the scene's code loads too.
 */
export function SceneLoading({ progress }: { progress: number }) {
  const t = useTranslations("Mdf2025");
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ground text-ink-muted">
      <div
        className="size-10 animate-spin rounded-full border-4 border-seam border-t-ink-muted motion-reduce:animate-none"
        role="status"
        aria-label={t("loading")}
      />
      <TypographyData>
        {t("loadingScene", { progress: Math.round(progress) })}
      </TypographyData>
    </div>
  );
}
