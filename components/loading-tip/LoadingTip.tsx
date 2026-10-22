"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Sparkle } from "@/components/sparkle";
import {
  pickTip,
  TIP_DELAY_MS,
  type TipId,
  type TipWait,
  triedFeatures,
} from "@/lib/loading-tips";
import { cn } from "@/lib/utils";

/** The last tip shown in this tab, so a reload never repeats it either. */
const LAST_KEY = "imjustlucas.last-tip";

/**
 * A loading screen handed to another one in the same commit (the MDF 2025
 * scene's code, then its assets) is still the same wait: its tip survives
 * an unmount for this long, and the next loader takes it over.
 */
const HANDOVER_MS = 100;

type Wait = {
  tip: TipId | null;
  holders: number;
  reveal?: number;
  release?: number;
};

const waits = new Map<TipWait, Wait>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const readStorage = (storage: () => Storage, key: string) => {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
};

const choose = (wait: TipWait) => {
  const tip = pickTip({
    wait,
    last: readStorage(() => window.sessionStorage, LAST_KEY),
    tried: triedFeatures((key) => readStorage(() => window.localStorage, key)),
    random: Math.random,
  }) as TipId;
  try {
    window.sessionStorage.setItem(LAST_KEY, tip);
  } catch {
    // Storage refused: the next wait only avoids it within this page.
  }
  return tip;
};

/** Joins the wait (or starts it, its tip due after the delay). */
const hold = (kind: TipWait) => {
  const wait = waits.get(kind) ?? { tip: null, holders: 0 };
  window.clearTimeout(wait.release);
  wait.holders += 1;
  if (!waits.has(kind)) {
    waits.set(kind, wait);
    wait.reveal = window.setTimeout(() => {
      wait.tip = choose(kind);
      emit();
    }, TIP_DELAY_MS);
  }
  return () => {
    wait.holders -= 1;
    if (wait.holders > 0) return;
    wait.release = window.setTimeout(() => {
      window.clearTimeout(wait.reveal);
      waits.delete(kind);
      emit();
    }, HANDOVER_MS);
  };
};

/**
 * The loading tip (DESIGN.md, Loading tip): one line at the foot of a
 * loading screen, shown only once the wait has lasted `TIP_DELAY_MS`, one
 * per wait. Placed absolutely in its loading screen, so it never moves the
 * spinner. Hidden from assistive tech: the loader's status already speaks.
 */
export function LoadingTip({ wait }: { wait: TipWait }) {
  const t = useTranslations("LoadingTips");
  const tip = useSyncExternalStore(
    subscribe,
    () => waits.get(wait)?.tip ?? null,
    () => null,
  );
  // Taken over from the loader before: already on screen, no entrance.
  const [handedOver] = useState(() => tip !== null);

  useEffect(() => hold(wait), [wait]);

  if (!tip) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-4 bottom-4 mx-auto max-w-[38ch] text-balance text-center text-label text-ink-muted sm:bottom-5",
        !handedOver && "animate-page-in motion-reduce:animate-fade-in",
      )}
    >
      {/* Inline, so the star stays beside the label however the line wraps */}
      <Sparkle className="mr-1.5 inline-block size-3.5 align-[-2px] text-ink" />
      <span className="font-semibold text-ink">{t("label")}</span>
      {" · "}
      {t(`tips.${tip}`)}
    </div>
  );
}
