"use client";

import { useProgress } from "@react-three/drei";
import { useTranslations } from "next-intl";

import { TypographyData } from "@/components/typography";

/** The showcase loading: the well's own ground, a ring and the progress. */
export default function SceneLoader() {
  const { progress, active } = useProgress();
  const t = useTranslations("Mdf2025");

  // Shown from the first paint (progress 0) until every asset has loaded.
  if (!active && progress === 100) return null;

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
