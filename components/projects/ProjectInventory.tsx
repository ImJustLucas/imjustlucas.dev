"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyData, TypographyTitle } from "@/components/typography";
import type { LoadoutEntry } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** A Project card rendered by the page, with the Techs it is filtered by. */
export type InventoryItem = {
  readonly key: string;
  readonly techIds: ReadonlyArray<string>;
  readonly card: React.ReactNode;
};

type ProjectInventoryProps = {
  loadout: ReadonlyArray<LoadoutEntry>;
  items: ReadonlyArray<InventoryItem>;
};

/** The URL parameter keeping the chosen Tech, so a filtered view can be shared. */
const PARAM = "tech";
/** Fired after the inventory rewrites the URL, which `popstate` does not see. */
const CHANGE = "inventory-change";

/**
 * The chosen Tech lives in the URL only. The page is static, so the server
 * (and the first render in the browser) sees none.
 */
const chosenTech = {
  subscribe: (listener: () => void) => {
    window.addEventListener("popstate", listener);
    window.addEventListener(CHANGE, listener);
    return () => {
      window.removeEventListener("popstate", listener);
      window.removeEventListener(CHANGE, listener);
    };
  },
  read: () => new URLSearchParams(window.location.search).get(PARAM),
  none: () => null,
  write: (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set(PARAM, id);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(CHANGE));
  },
};

/**
 * The Projects page's inventory: the loadout as a row of pressable Techs,
 * each with how many Projects use it and since when, filtering the item
 * grid below to the Projects built with the one chosen.
 */
export function ProjectInventory({ loadout, items }: ProjectInventoryProps) {
  const t = useTranslations("Projects");
  const { play } = useSounds();
  const inUrl = useSyncExternalStore(
    chosenTech.subscribe,
    chosenTech.read,
    chosenTech.none,
  );
  // A Tech no Project uses (an old or mistyped link) shows everything.
  const chosen = loadout.some((entry) => entry.tech.id === inUrl)
    ? inUrl
    : null;

  const choose = (id: string | null) => {
    play(id ? "toggleOn" : "toggleOff");
    chosenTech.write(id);
  };

  const shown = chosen
    ? items.filter((item) => item.techIds.includes(chosen))
    : items;
  // On phones the buttons are one row swiped sideways: bring the chosen one
  // (from a shared link, say) into view.
  const group = useRef<HTMLDivElement>(null);
  useEffect(() => {
    group.current
      ?.querySelector("[aria-pressed=true]")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [chosen]);

  const chosenName = loadout.find((entry) => entry.tech.id === chosen)?.tech
    .name;

  return (
    <div className="flex flex-col gap-slot-gap">
      <section
        aria-labelledby="loadout-title"
        className="tray flex flex-col gap-4 rounded-lg bg-raised p-4 sm:p-card"
      >
        <div className="flex items-baseline justify-between gap-3">
          <TypographyTitle
            as="h2"
            id="loadout-title"
            className="text-[1.375rem]"
          >
            {t("loadout")}
          </TypographyTitle>
          <TypographyData className="shrink-0 text-ink-muted">
            {t("techs", { count: loadout.length })}
          </TypographyData>
        </div>
        <div
          ref={group}
          role="group"
          aria-label={t("filter")}
          // One row swiped sideways on phones, wrapping rows from 640px; the
          // padding keeps the ledges and focus rings inside the scroller.
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-y-3 sm:overflow-visible sm:p-0 [&>*>button]:shrink-0"
        >
          <LoadoutButton pressed={chosen === null} onPress={() => choose(null)}>
            {t("all")}
          </LoadoutButton>
          {loadout.map(({ tech, projects, since }) => {
            const pressed = chosen === tech.id;
            return (
              <LoadoutButton
                key={tech.id}
                pressed={pressed}
                onPress={() => choose(pressed ? null : tech.id)}
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full ring-2 ring-seam"
                  style={{ backgroundColor: tech.color }}
                />
                <span className="flex flex-col items-start text-left">
                  {tech.name}
                  <TypographyData
                    className={cn(
                      "text-[0.75rem] leading-4",
                      pressed ? "opacity-80" : "text-ink-muted",
                    )}
                  >
                    {t("techStat", { count: projects, since })}
                  </TypographyData>
                </span>
              </LoadoutButton>
            );
          })}
        </div>
        <div aria-live="polite">
          <TypographyData as="p" className="text-ink-muted">
            {chosenName
              ? t("showing", {
                  count: shown.length,
                  total: items.length,
                  tech: chosenName,
                })
              : t("showingAll", { count: items.length })}
          </TypographyData>
        </div>
      </section>

      <ul className="grid gap-slot-gap md:grid-cols-2 xl:grid-cols-3">
        {shown.map((item) => (
          <li
            key={item.key}
            className="animate-fade-in motion-reduce:animate-none"
          >
            {item.card}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A Tech of the loadout as a pressable chip, the action colour when chosen. */
function LoadoutButton({
  pressed,
  onPress,
  children,
}: {
  pressed: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <SoundOnPress cue={null} tick>
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onPress}
        className={cn(
          "ledge inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md border-2 px-3 py-1.5 text-label",
          pressed
            ? "ledge-action border-action bg-action text-on-action"
            : "border-seam bg-ground text-ink",
        )}
      >
        {children}
      </button>
    </SoundOnPress>
  );
}
