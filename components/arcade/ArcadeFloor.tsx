"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Lock } from "lucide-react";

import { boardAction } from "@/app/[locale]/arcade/actions";
import { Leaderboard } from "@/components/arcade/Leaderboard";
import type { ScreenProps } from "@/components/arcade/screen";
import { usePlayer } from "@/components/arcade/use-player";
import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyTag, TypographyTitle } from "@/components/typography";
import type { Board } from "@/lib/arcade/board";
import {
  ARCADE_OPEN_EVENT,
  type Cabinet,
  type CabinetId,
  CABINETS,
} from "@/lib/arcade/cabinets";
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
const SCREENS: Record<CabinetId, React.ComponentType<ScreenProps> | null> = {
  ollie: dynamic(() => import("./ollie/OllieGame"), {
    ssr: false,
    loading: CabinetLoading,
  }),
  surf: dynamic(() => import("./surf/SurfGame"), {
    ssr: false,
    loading: CabinetLoading,
  }),
};

const isPlayable = (id: string | null): id is CabinetId =>
  CABINETS.some(
    (cabinet) => cabinet.id === id && cabinet.status === "playable",
  );

/** The open cabinet is kept in the address (`?cabinet=surf`), to share it. */
const CABINET_PARAM = "cabinet";

/**
 * The Arcade floor (DESIGN.md, Arcade): the shelf of cabinets, one per
 * hobby, the chosen playable one open as the screen, and its leaderboard.
 * Cabinets that are `soon` stand on the shelf as silhouettes.
 */
export function ArcadeFloor() {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const [selected, setSelected] = useState<CabinetId>(CABINETS[0].id);
  const Screen = SCREENS[selected];
  const { player, remember } = usePlayer();
  const [board, setBoard] = useState<Board | null>(null);

  // The cabinet in the address, once mounted (pages are static)
  useEffect(() => {
    const open = () => {
      const asked = new URLSearchParams(window.location.search).get(
        CABINET_PARAM,
      );
      if (isPlayable(asked)) setSelected(asked);
    };
    open();
  }, []);

  /** Opens a cabinet and keeps it in the address; false when already open. */
  const show = useCallback(
    (id: CabinetId) => {
      if (id === selected) return false;
      setBoard(null);
      setSelected(id);
      const url = new URL(window.location.href);
      if (id === CABINETS[0].id) url.searchParams.delete(CABINET_PARAM);
      else url.searchParams.set(CABINET_PARAM, id);
      window.history.replaceState(window.history.state, "", url);
      return true;
    },
    [selected],
  );

  const choose = useCallback(
    (id: CabinetId) => {
      if (show(id)) play("toggleOn");
    },
    [show, play],
  );

  // The quick menu's "play" commands, while the floor is on screen (the
  // menu has played its own note)
  useEffect(() => {
    const onOpen = (event: Event) => {
      const asked = (event as CustomEvent<unknown>).detail;
      if (typeof asked === "string" && isPlayable(asked)) show(asked);
    };
    window.addEventListener(ARCADE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ARCADE_OPEN_EVENT, onOpen);
  }, [show]);

  useEffect(() => {
    let current = true;
    boardAction(selected)
      .catch((): Board => ({ kind: "unavailable" }))
      .then((loaded) => current && setBoard(loaded));
    return () => {
      current = false;
    };
  }, [selected]);

  return (
    <div className="grid gap-slot-gap xl:grid-cols-[minmax(0,1fr)_16.5rem] xl:grid-rows-[auto_1fr] xl:items-start">
      <section
        aria-labelledby="arcade-shelf"
        className="xl:col-start-2 xl:row-start-1"
      >
        <TypographyTitle as="h2" id="arcade-shelf" className="sr-only">
          {t("shelf")}
        </TypographyTitle>
        <ul className="grid grid-cols-2 gap-slot-gap xl:grid-cols-1">
          {CABINETS.map((cabinet) => (
            <CabinetTile
              key={cabinet.id}
              cabinet={cabinet}
              selected={cabinet.id === selected}
              onChoose={() => choose(cabinet.id)}
            />
          ))}
        </ul>
      </section>
      <section
        aria-label={t(`cabinets.${selected}.name`)}
        className="min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1"
      >
        {Screen && (
          <Screen
            key={selected}
            board={board}
            player={player}
            onBoard={(top) => setBoard({ kind: "board", top })}
            remember={remember}
          />
        )}
      </section>
      <div className="min-w-0 xl:col-start-2 xl:row-start-2">
        <Leaderboard
          board={board}
          playerId={player?.id ?? null}
          cabinet={selected}
        />
      </div>
    </div>
  );
}

function CabinetTile({
  cabinet,
  selected,
  onChoose,
}: {
  cabinet: Cabinet;
  selected: boolean;
  onChoose: () => void;
}) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const locked = cabinet.status === "soon";
  const face = (
    <>
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
            alt=""
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
      <span className="flex min-w-0 flex-col items-start gap-1">
        <TypographyTitle
          // A button holds phrasing content only
          as={locked ? "h3" : "span"}
          className="text-base sm:text-[1.125rem]"
        >
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
    </>
  );
  const tile =
    "tray relative flex w-full items-center gap-3 rounded-lg border-2 bg-raised p-2.5 text-left sm:p-3";
  return (
    <li onPointerEnter={() => play("tick")} className="flex">
      {locked ? (
        <div className={cn(tile, "border-transparent")}>{face}</div>
      ) : (
        // A playable cabinet opens on a press; the open one is current
        <button
          type="button"
          aria-current={selected ? "true" : undefined}
          onClick={onChoose}
          className={cn(
            tile,
            "outline-none transition-colors duration-hover ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-ink",
            selected
              ? "border-action-ink"
              : "border-transparent hover:border-seam",
          )}
        >
          {face}
        </button>
      )}
    </li>
  );
}
