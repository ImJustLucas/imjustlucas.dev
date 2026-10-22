"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Check, X } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { TypographyTitle } from "@/components/typography";
import { type Emote, EMOTE_GLYPH } from "@/lib/poke/emotes";

export type PokeToastKind =
  | "wavedBack"
  | "sent"
  | "limited"
  | "busy"
  | "failed";

const TOAST_MS = 4200;

/**
 * A wave's news in the client's corner, drawn like the quick menu's toasts
 * (DESIGN.md, Quick menu): Lucas waving back on his stage disc, or a check
 * or a cross for a wave sent from the quick menu. Polite, 4.2 seconds, and
 * a press dismisses it.
 */
export function PokeToast({
  kind,
  emote,
  onDone,
}: {
  kind: PokeToastKind;
  emote: Emote | null;
  onDone: () => void;
}) {
  const t = useTranslations("Poke");

  useEffect(() => {
    const timer = window.setTimeout(onDone, TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const glyph = EMOTE_GLYPH[emote ?? "wave"];
  const text = {
    wavedBack: {
      title: t("toast.wavedBackTitle"),
      line: t("toast.wavedBackLine", { emote: glyph }),
    },
    sent: { title: t("toast.sentTitle"), line: t("toast.sentLine") },
    limited: { title: t("toast.limitedTitle"), line: t("limited") },
    busy: { title: t("toast.busyTitle"), line: t("busy") },
    failed: { title: t("toast.failedTitle"), line: t("failed") },
  }[kind];

  return (
    <div
      role="status"
      onClick={onDone}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-sm cursor-pointer items-center gap-3 rounded-lg border-2 border-seam bg-raised p-3 pr-4 text-ink shadow-[var(--float),var(--tray)] motion-safe:animate-window-in motion-reduce:animate-fade-in md:inset-x-auto md:bottom-6 md:right-6"
    >
      {kind === "wavedBack" ? (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-ground">
          <ChibiSprite
            pose="banner"
            alt={t("toast.wavedBackAlt")}
            sizes="64px"
            className="size-16"
          />
        </span>
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ground text-action-ink">
          {kind === "sent" ? (
            <Check aria-hidden className="size-5" />
          ) : (
            <X aria-hidden className="size-5" />
          )}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <TypographyTitle as="span" className="text-pretty">
          {text.title}
        </TypographyTitle>
        <span className="text-pretty text-label text-ink-muted">
          {text.line}
        </span>
      </span>
    </div>
  );
}
