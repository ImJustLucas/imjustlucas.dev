"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Check } from "lucide-react";

import { usePalette } from "@/components/palette/use-palette";
import { usePresence } from "@/components/presence/PresenceProvider";
import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { RarityTag } from "@/components/rarity/RarityTag";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyTitle } from "@/components/typography";
import { MENU_ROUTES, ROUTES } from "@/config/routes";
import { usePathname } from "@/i18n/navigation";
import { isActiveRoute } from "@/lib/routes/is-active-route";
import { toAnnounce, trophyById, type TrophyId } from "@/lib/trophies/trophies";
import { cn } from "@/lib/utils";

import { TROPHY_ICONS } from "./trophy-icons";
import {
  countTrophyStep,
  markTrophyAnnounced,
  unlockTrophy,
  useTrophies,
} from "./trophy-store";

/** Lets the cue that earned it sound before the trophy's own. */
const FIRST_DELAY_MS = 900;
/** Between two toasts of one burst. */
const NEXT_DELAY_MS = 300;
const TOAST_MS = 4200;

/**
 * The client's Trophies (docs/trophies.md), mounted once in the client: it
 * counts what the client itself sees (the tabs and pages visited, the
 * Locales, modes and palettes shown, Lucas online) and announces each
 * unlock, one toast at a time, with the unlock cue.
 */
export function TrophyLayer() {
  const pathname = usePathname();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const { palette } = usePalette();
  const { status } = usePresence();

  useEffect(() => {
    for (const route of MENU_ROUTES) {
      if (isActiveRoute(route.path, pathname)) {
        countTrophyStep("tabs", route.path);
      }
    }
    if (pathname.startsWith(`${ROUTES.what.path}/`)) unlockTrophy("inspector");
    if (isActiveRoute(ROUTES.patchNotes.path, pathname)) {
      unlockTrophy("whatsNew");
    }
  }, [pathname]);

  useEffect(() => countTrophyStep("locales", locale), [locale]);
  useEffect(() => countTrophyStep("palettes", palette), [palette]);
  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      countTrophyStep("modes", resolvedTheme);
    }
  }, [resolvedTheme]);
  useEffect(() => {
    if (status === "online" || status === "idle" || status === "dnd") {
      unlockTrophy("seenOnline");
    }
  }, [status]);

  return <TrophyToasts />;
}

/** The unlocks still to announce, one at a time. */
function TrophyToasts() {
  const t = useTranslations("Trophies");
  const progress = useTrophies();
  const { play } = useSounds();
  const [shown, setShown] = useState<TrophyId | null>(null);
  const [burst, setBurst] = useState(false);
  const next = toAnnounce(progress)[0];

  useEffect(() => {
    if (shown || !next) return;
    const timer = window.setTimeout(
      () => {
        markTrophyAnnounced(next);
        setShown(next);
        setBurst(true);
        if (!trophyById(next).quiet) play("unlock");
      },
      burst ? NEXT_DELAY_MS : FIRST_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [shown, next, burst, play]);

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => {
      setShown(null);
      // The next one of a burst follows quickly; a later unlock waits again
      if (!next) setBurst(false);
    }, TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [shown, next]);

  return (
    // Mounted from the start, so screen readers hear what enters it
    <div role="status" aria-live="polite">
      {shown && (
        <TrophyToast
          key={shown}
          id={shown}
          label={t("toast.unlocked")}
          onDismiss={() => {
            setShown(null);
            if (!next) setBurst(false);
          }}
        />
      )}
      <span className="sr-only">
        {shown && t("toast.live", { name: t(`items.${shown}.name`) })}
      </span>
    </div>
  );
}

/**
 * A Trophy unlocked: a raised window at the top of the client (full width on
 * phones), banded in the Trophy's rarity, its icon on a disc ringed in that
 * rarity, the "trophy unlocked" live tag, its name and how it was earned.
 * It drops in, stays 4.2 seconds, and a press dismisses it.
 */
function TrophyToast({
  id,
  label,
  onDismiss,
}: {
  id: TrophyId;
  label: string;
  onDismiss: () => void;
}) {
  const t = useTranslations("Trophies");
  const { rarity } = trophyById(id);
  const Icon = TROPHY_ICONS[id];
  return (
    <div
      aria-hidden
      onClick={onDismiss}
      className="fixed inset-x-3 top-3 z-[60] mx-auto flex max-w-sm cursor-pointer flex-col overflow-hidden rounded-lg border-2 border-seam bg-raised text-ink shadow-[var(--float),var(--tray)] motion-safe:animate-toast-drop motion-reduce:animate-fade-in md:inset-x-auto md:right-6 md:top-6"
    >
      <span className={cn("h-1 shrink-0", RARITY_STYLE[rarity].band)} />
      <span className="flex items-center gap-3 p-3 pr-4">
        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full border-2 bg-ground",
            RARITY_STYLE[rarity].frame,
          )}
        >
          <Icon aria-hidden className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-online px-2 py-0.5 text-tag text-on-bright">
              <Check aria-hidden className="size-3" />
              {label}
            </span>
            <RarityTag rarity={rarity} />
          </span>
          <TypographyTitle as="span" className="text-pretty">
            {t(`items.${id}.name`)}
          </TypographyTitle>
          <span className="text-pretty text-label text-ink-muted">
            {t(`items.${id}.how`)}
          </span>
        </span>
      </span>
    </div>
  );
}
