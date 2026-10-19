"use client";

import { useProgress } from "@react-three/drei";
import { useTranslations } from "next-intl";

export default function SceneLoader() {
  const { progress, active } = useProgress();
  const t = useTranslations("Mdf2025");

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="text-center">
        <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-t-transparent text-primary"
          role="status"
          aria-label={t("loading")}
        >
          <span className="sr-only">{t("loading")}</span>
        </div>
        <div className="mt-4 text-white text-lg font-semibold">
          {t("loadingScene", { progress: Math.round(progress) })}
        </div>
      </div>
    </div>
  );
}
