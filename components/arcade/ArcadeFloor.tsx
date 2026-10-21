"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Lock } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyTag, TypographyTitle } from "@/components/typography";
import { type Cabinet, type CabinetId, CABINETS } from "@/lib/arcade/cabinets";
import { chibiFrames } from "@/lib/chibi";
import { cn } from "@/lib/utils";

/** The cabinet's shape while its game loads: no layout shift. */
function CabinetLoading() {
  const t = useTranslations("Arcade");
  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <div className="h-8 px-1" />
      <div className="relative flex aspect-[3/2] items-center justify-center rounded-md bg-ground sm:aspect-video">
        <div
          role="status"
          aria-label={t("loading")}
          className="size-10 animate-spin rounded-full border-4 border-seam border-t-ink-muted motion-reduce:animate-none"
        />
      </div>
      <div className="h-11" />
    </div>
  );
}

// Each game is its own chunk, fetched only on the Arcade
const SCREENS: Record<CabinetId, React.ComponentType | null> = {
  ollie: dynamic(() => import("./ollie/OllieGame"), {
    ssr: false,
    loading: CabinetLoading,
  }),
  surf: null,
};

/**
 * The Arcade floor (DESIGN.md, Arcade): the shelf of cabinets, one per
 * hobby, and the playable one open as the screen. Cabinets that are `soon`
 * stand on the shelf as silhouettes.
 */
export function ArcadeFloor() {
  const t = useTranslations("Arcade");
  // One playable cabinet for now: it is the one open
  const selected: CabinetId = "ollie";
  const Screen = SCREENS[selected];

  return (
    <div className="grid gap-slot-gap xl:grid-cols-[minmax(0,1fr)_16.5rem] xl:items-start">
      <section aria-labelledby="arcade-shelf" className="xl:order-2">
        <TypographyTitle as="h2" id="arcade-shelf" className="sr-only">
          {t("shelf")}
        </TypographyTitle>
        <ul className="grid grid-cols-2 gap-slot-gap xl:grid-cols-1">
          {CABINETS.map((cabinet) => (
            <CabinetTile
              key={cabinet.id}
              cabinet={cabinet}
              selected={cabinet.id === selected}
            />
          ))}
        </ul>
      </section>
      <section aria-label={t(`cabinets.${selected}.name`)} className="min-w-0">
        {Screen && <Screen />}
      </section>
    </div>
  );
}

function CabinetTile({
  cabinet,
  selected,
}: {
  cabinet: Cabinet;
  selected: boolean;
}) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const locked = cabinet.status === "soon";
  return (
    <li
      onPointerEnter={() => play("tick")}
      className={cn(
        "tray relative flex items-center gap-3 rounded-lg border-2 bg-raised p-2.5 sm:p-3",
        selected ? "border-action-ink" : "border-transparent",
      )}
    >
      <span className="relative size-14 shrink-0 sm:size-16">
        <span
          aria-hidden
          className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
        />
        {locked ? (
          // Still locked: the pose as a silhouette in the seam colour
          <span
            role="img"
            aria-label={t(`cabinets.${cabinet.id}.poseAlt`)}
            className="absolute inset-0 bg-seam"
            style={{
              maskImage: `url(${chibiFrames(cabinet.pose)[0]})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        ) : (
          <ChibiSprite
            pose={cabinet.pose}
            alt={t(`cabinets.${cabinet.id}.poseAlt`)}
            sizes="64px"
            className="size-full"
          />
        )}
        {locked && (
          <Lock
            aria-hidden
            className="absolute bottom-0 right-0 size-5 rounded-full bg-ground p-1 text-ink-muted"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <TypographyTitle as="h3" className="text-base sm:text-[1.125rem]">
          {t(`cabinets.${cabinet.id}.name`)}
        </TypographyTitle>
        <span className="hidden text-label text-ink-muted sm:block">
          {t(`cabinets.${cabinet.id}.tagline`)}
        </span>
        {(locked || selected) && (
          <TypographyTag
            className={cn(
              "w-fit whitespace-nowrap rounded-full px-2 py-0.5",
              locked ? "bg-seam text-ink" : "bg-online text-on-bright",
            )}
          >
            {locked ? t("soon") : t("nowPlaying")}
          </TypographyTag>
        )}
      </span>
    </li>
  );
}
