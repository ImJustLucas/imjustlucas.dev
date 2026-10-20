"use client";

import { useTranslations } from "next-intl";

import { Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";

import { useSounds } from "./SoundProvider";

/**
 * The always-visible sound switch: the action colour when sound is on, raised with a
 * struck speaker when off; its label also says when reduced motion turned
 * sound off.
 */
export function SoundSwitch({ className }: { className?: string }) {
  const { state, toggle } = useSounds();
  const t = useTranslations("Sound");
  const label = state.enabled
    ? t("on")
    : state.reason === "reduced-motion"
      ? t("offReducedMotion")
      : t("off");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state.enabled}
      aria-label={t("label")}
      title={label}
      className={cn(
        "ledge inline-flex size-11 shrink-0 items-center justify-center rounded-md",
        state.enabled
          ? "ledge-action bg-action text-on-action"
          : "bg-raised text-ink",
        className,
      )}
    >
      {state.enabled ? (
        <Volume2 aria-hidden className="size-5" />
      ) : (
        <VolumeX aria-hidden className="size-5" />
      )}
    </button>
  );
}
