"use client";

import { useSyncExternalStore } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Check, CircleHelp, Lock } from "lucide-react";

import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import {
  TypographyData,
  TypographyDisplay,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import type { Rarity } from "@/lib/content/types";
import {
  TROPHIES,
  type Trophy,
  trophyCount,
  type TrophyProgress,
  unlockedCount,
} from "@/lib/trophies/trophies";
import { cn } from "@/lib/utils";

import { TROPHY_ICONS } from "./trophy-icons";
import { useTrophies } from "./trophy-store";

/** The shelves, commonest first, as the Trophies are listed. */
const SHELVES: ReadonlyArray<Rarity> = ["common", "rare", "epic", "legendary"];

/** The secret Trophies, whose hint stands in for how until unlocked. */
type SecretId = "firstSecret" | "lost";
const isSecret = (trophy: Trophy): trophy is Trophy & { id: SecretId } =>
  trophy.secret === true;

const noop = () => () => {};

/** Whether the visitor's progress is read (after hydration). */
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/**
 * The trophies screen (DESIGN.md, Trophies): the summary slot with the count
 * at Display size and one pip per Trophy, then a shelf per rarity holding
 * its Trophies, unlocked with their day or locked with their progress.
 */
export function TrophyCabinet() {
  const progress = useTrophies();
  const hydrated = useHydrated();
  return (
    <>
      <Summary progress={progress} hydrated={hydrated} />
      <div className="grid items-start gap-3 lg:grid-cols-2">
        {SHELVES.map((rarity) => (
          <Shelf key={rarity} rarity={rarity} progress={progress} />
        ))}
      </div>
    </>
  );
}

/** A date the visitor reads in their own zone. */
const useDay = () => {
  const format = useFormatter();
  return (iso: string) =>
    format.dateTime(new Date(iso), {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
};

function Summary({
  progress,
  hydrated,
}: {
  progress: TrophyProgress;
  hydrated: boolean;
}) {
  const t = useTranslations("Trophies");
  const day = useDay();
  const done = unlockedCount(progress);
  const total = TROPHIES.length;
  const latest = TROPHIES.filter((trophy) => progress.unlocked[trophy.id])
    .map((trophy) => ({ trophy, at: progress.unlocked[trophy.id] ?? "" }))
    .sort((a, b) => b.at.localeCompare(a.at))[0];

  const line = !hydrated
    ? null
    : done === total
      ? t("summary.all")
      : latest
        ? t("summary.latest", {
            name: t(`items.${latest.trophy.id}.name`),
            date: day(latest.at),
          })
        : t("summary.empty");

  return (
    <section
      aria-label={t("summary.label")}
      className="tray grid gap-5 rounded-lg border-2 border-seam bg-raised p-4 sm:p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-10 md:px-7 md:py-6"
    >
      <div className="flex flex-col gap-1">
        <TypographyDisplay as="p" className="leading-none">
          <span className="sr-only">{t("summary.of", { done, total })}</span>
          <span aria-hidden>
            {hydrated ? done : "–"}
            <span className="text-ink-muted">/{total}</span>
          </span>
        </TypographyDisplay>
        <span aria-hidden className="text-label text-ink-muted">
          {t("summary.label")}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {/* One pip per Trophy, in shelf order, filled in its rarity once unlocked */}
        <ol aria-hidden className="flex gap-1 sm:gap-1.5">
          {TROPHIES.map((trophy) => (
            <li
              key={trophy.id}
              className={cn(
                "h-3 flex-1 rounded-full",
                hydrated && progress.unlocked[trophy.id]
                  ? RARITY_STYLE[trophy.rarity].band
                  : "bg-ground shadow-[inset_0_2px_0_rgb(var(--ledge))]",
              )}
            />
          ))}
        </ol>
        <span className="block min-h-5 text-pretty text-label font-medium text-ink">
          {line}
        </span>
        <TypographyMuted className="text-pretty text-label">
          {t("summary.storage")}
        </TypographyMuted>
      </div>
    </section>
  );
}

function Shelf({
  rarity,
  progress,
}: {
  rarity: Rarity;
  progress: TrophyProgress;
}) {
  const t = useTranslations("Trophies");
  const tRarity = useTranslations("Rarity");
  const trophies = TROPHIES.filter((trophy) => trophy.rarity === rarity);
  const done = trophies.filter((trophy) => progress.unlocked[trophy.id]).length;
  const id = `shelf-${rarity}`;

  return (
    <section
      aria-labelledby={id}
      className="tray flex flex-col overflow-hidden rounded-lg bg-raised"
    >
      <span aria-hidden className={cn("h-1", RARITY_STYLE[rarity].band)} />
      <header className="flex items-baseline justify-between gap-3 px-4 pb-2 pt-4 sm:px-5">
        <TypographyTitle id={id}>{tRarity(rarity)}</TypographyTitle>
        <TypographyData className="text-ink-muted">
          <span aria-hidden>
            {done}/{trophies.length}
          </span>
          <span className="sr-only">
            {t("shelf.count", { done, total: trophies.length })}
          </span>
        </TypographyData>
      </header>
      <ul className="flex flex-col px-2 pb-2">
        {trophies.map((trophy, i) => (
          <TrophyRow
            key={trophy.id}
            trophy={trophy}
            progress={progress}
            first={i === 0}
          />
        ))}
      </ul>
    </section>
  );
}

function TrophyRow({
  trophy,
  progress,
  first,
}: {
  trophy: Trophy;
  progress: TrophyProgress;
  first: boolean;
}) {
  const t = useTranslations("Trophies");
  const day = useDay();
  const at = progress.unlocked[trophy.id];
  const hidden = !at && isSecret(trophy);
  const Icon = hidden ? CircleHelp : TROPHY_ICONS[trophy.id];
  const count = trophyCount(progress, trophy);
  const counted = trophy.tally || trophy.everyOther;

  return (
    <li
      className={cn(
        "flex min-h-[76px] items-center gap-3 px-2 py-3 sm:gap-4 sm:px-3",
        !first && "border-t-2 border-seam/70",
      )}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full border-2 bg-ground",
          at
            ? cn(RARITY_STYLE[trophy.rarity].frame, "text-ink")
            : "border-dashed border-seam text-ink-muted",
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <TypographyTitle
          as="h3"
          className={cn("text-base", at ? "text-ink" : "text-ink-muted")}
        >
          {hidden ? t("card.secretName") : t(`items.${trophy.id}.name`)}
        </TypographyTitle>
        <span className="text-pretty text-label text-ink-muted">
          {hidden && isSecret(trophy)
            ? t(`items.${trophy.id}.hint`)
            : t(`items.${trophy.id}.how`)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5 text-right">
        {at ? (
          <TypographyData
            as="time"
            dateTime={at}
            className="flex items-center gap-1 text-ink-muted"
          >
            <Check aria-hidden className="size-3.5 text-online-ink" />
            <span aria-hidden>{day(at)}</span>
            <span className="sr-only">
              {t("card.unlockedOn", { date: day(at) })}
            </span>
          </TypographyData>
        ) : counted ? (
          <>
            <TypographyData className="text-ink-muted">
              <span aria-hidden>
                {count.done}/{count.goal}
              </span>
              <span className="sr-only">
                {t("card.progress", { done: count.done, total: count.goal })}
              </span>
            </TypographyData>
            <span
              aria-hidden
              className="relative h-1.5 w-14 overflow-hidden rounded-full bg-ground"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-ink-muted"
                style={{ width: `${(count.done / count.goal) * 100}%` }}
              />
            </span>
          </>
        ) : (
          <>
            <Lock aria-hidden className="size-4 text-ink-muted" />
            <span className="sr-only">{t("card.locked")}</span>
          </>
        )}
      </span>
    </li>
  );
}
