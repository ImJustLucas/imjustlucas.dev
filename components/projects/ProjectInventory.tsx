"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  ArrowDownUp,
  Check,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyData, TypographyTitle } from "@/components/typography";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  isProjectSort,
  PROJECT_SORTS,
  type ProjectSort,
  sortProjects,
  techMatches,
} from "@/lib/content/inventory";
import type { LoadoutEntry, Rarity } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** A Project card rendered by the page, with what it is sorted and filtered by. */
export type InventoryItem = {
  readonly key: string;
  readonly title: string;
  readonly rarity: Rarity;
  readonly techIds: ReadonlyArray<string>;
  readonly card: React.ReactNode;
};

type ProjectInventoryProps = {
  /** The loadout, the most used Tech first. */
  loadout: ReadonlyArray<LoadoutEntry>;
  /** The Projects in Period order, the most recent first. */
  items: ReadonlyArray<InventoryItem>;
};

/** The URL parameters keeping the chosen Tech and order, so a view can be shared. */
const TECH = "tech";
const SORT = "sort";
/** Fired after the inventory rewrites the URL, which `popstate` does not see. */
const CHANGE = "inventory-change";
/** How many of the most used Techs the loadout shows before "more". */
const TOP = 8;

/**
 * The inventory's choices live in the URL only. The page is static, so the
 * server (and the first render in the browser) sees none.
 */
const subscribe = (listener: () => void) => {
  window.addEventListener("popstate", listener);
  window.addEventListener(CHANGE, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(CHANGE, listener);
  };
};

const useUrlParam = (name: string) =>
  useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );

const writeUrlParam = (name: string, value: string | null) => {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(name, value);
  else url.searchParams.delete(name);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(CHANGE));
};

/**
 * The Projects page's inventory: the loadout's most used Techs as pressable
 * buttons, each with how many Projects use it and since when (the rest
 * behind "more", or in a sheet with a search on phones), and the order,
 * above the item grid filtered to the Projects built with the one chosen.
 */
export function ProjectInventory({ loadout, items }: ProjectInventoryProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const { play } = useSounds();
  const techInUrl = useUrlParam(TECH);
  const sortInUrl = useUrlParam(SORT);
  const [expanded, setExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetButton = useRef<HTMLButtonElement>(null);

  // A Tech no Project uses, or an unknown order (an old or mistyped link),
  // falls back to everything, the rarest first.
  const chosen = loadout.find((entry) => entry.tech.id === techInUrl) ?? null;
  const sort: ProjectSort = isProjectSort(sortInUrl)
    ? sortInUrl
    : PROJECT_SORTS[0];

  const choose = (id: string | null) => {
    play(id ? "toggleOn" : "toggleOff");
    writeUrlParam(TECH, id);
  };
  const chooseSort = (value: ProjectSort) => {
    play("toggleOn");
    writeUrlParam(SORT, value === PROJECT_SORTS[0] ? null : value);
  };

  const shown = sortProjects(items, sort, locale).filter(
    (item) => !chosen || item.techIds.includes(chosen.tech.id),
  );

  const top = loadout.slice(0, TOP);
  // Folded, a chosen Tech beyond the most used still shows, after them.
  const extra = chosen && !top.includes(chosen) ? [chosen] : [];
  const buttons = expanded ? loadout : [...top, ...extra];
  const hidden = loadout.length - top.length - extra.length;

  const loadoutButton = (entry: LoadoutEntry, onChosen?: () => void) => {
    const pressed = chosen?.tech.id === entry.tech.id;
    return (
      <LoadoutButton
        key={entry.tech.id}
        pressed={pressed}
        onPress={() => {
          choose(pressed ? null : entry.tech.id);
          onChosen?.();
        }}
      >
        <TechDisc color={entry.tech.color} />
        <span className="flex flex-col items-start text-left">
          {entry.tech.name}
          <TypographyData
            className={cn(
              "text-[0.75rem] leading-4",
              pressed ? "opacity-80" : "text-ink-muted",
            )}
          >
            {t("techStat", { count: entry.projects, since: entry.since })}
          </TypographyData>
        </span>
      </LoadoutButton>
    );
  };

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

        {/* From 640px: the most used Techs, the rest unfolded on demand */}
        <div
          role="group"
          aria-label={t("filter")}
          className="hidden flex-wrap gap-2 gap-y-3 sm:flex"
        >
          <LoadoutButton pressed={chosen === null} onPress={() => choose(null)}>
            {t("all")}
          </LoadoutButton>
          {buttons.map((entry) => loadoutButton(entry))}
          {(expanded || hidden > 0) && (
            <SoundOnPress cue={null} tick>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => {
                  play(expanded ? "toggleOff" : "toggleOn");
                  setExpanded(!expanded);
                }}
                className={cn(BUTTON, "border-dashed text-ink-muted")}
              >
                {expanded ? t("fewerTechs") : t("moreTechs", { count: hidden })}
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-4 transition-transform duration-200 ease-in-out motion-reduce:transition-none",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            </SoundOnPress>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            {/* Below 640px: every Tech in a sheet, with a search */}
            <SoundOnPress cue={null} tick>
              <button
                type="button"
                ref={sheetButton}
                aria-haspopup="dialog"
                aria-label={t("techButton", {
                  tech: chosen?.tech.name ?? t("anyTech"),
                })}
                onClick={() => {
                  play("toggleOn");
                  setSheetOpen(true);
                }}
                className={cn(
                  BUTTON,
                  "sm:hidden",
                  chosen &&
                    "ledge-action border-action bg-action text-on-action",
                )}
              >
                {chosen ? (
                  <TechDisc color={chosen.tech.color} />
                ) : (
                  <SlidersHorizontal
                    aria-hidden
                    className="size-4 text-ink-muted"
                  />
                )}
                {chosen?.tech.name ?? t("techsShort")}
                <ChevronDown aria-hidden className="size-4" />
              </button>
            </SoundOnPress>
            <SortMenu sort={sort} onSort={chooseSort} />
          </div>
          <div aria-live="polite">
            <TypographyData as="p" className="text-ink-muted">
              {chosen
                ? t("showing", {
                    count: shown.length,
                    total: items.length,
                    tech: chosen.tech.name,
                  })
                : t("showingAll", { count: items.length })}
            </TypographyData>
          </div>
        </div>
      </section>

      <TechSheet
        open={sheetOpen}
        returnFocus={sheetButton}
        onClose={() => {
          play("toggleOff");
          setSheetOpen(false);
        }}
        loadout={loadout}
        allButton={
          <LoadoutButton
            pressed={chosen === null}
            onPress={() => {
              choose(null);
              setSheetOpen(false);
            }}
          >
            {t("all")}
          </LoadoutButton>
        }
        renderButton={(entry) =>
          loadoutButton(entry, () => setSheetOpen(false))
        }
      />

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

/** The outline ledge button of the loadout: ground fill, 2px seam border, 44px. */
const BUTTON =
  "ledge inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md border-2 border-seam bg-ground px-3 py-1.5 text-label text-ink";

/** A Tech's colour as a 12px disc ringed in the seam. */
function TechDisc({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="size-3 shrink-0 rounded-full ring-2 ring-seam"
      style={{ backgroundColor: color }}
    />
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
          BUTTON,
          pressed && "ledge-action border-action bg-action text-on-action",
        )}
      >
        {children}
      </button>
    </SoundOnPress>
  );
}

/** The order of the grid, as a menu of radios like the theme menu. */
function SortMenu({
  sort,
  onSort,
}: {
  sort: ProjectSort;
  onSort: (sort: ProjectSort) => void;
}) {
  const t = useTranslations("Projects");
  const { play } = useSounds();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("sortButton", { sort: t(`sorts.${sort}`) })}
        onClick={() => play("press")}
        className={BUTTON}
      >
        <ArrowDownUp aria-hidden className="size-4 text-ink-muted" />
        {/* Below 640px, the order alone, so both buttons share one row */}
        <span className="sm:hidden">{t(`sorts.${sort}`)}</span>
        <span className="hidden sm:inline">
          {t("sortButton", { sort: t(`sorts.${sort}`) })}
        </span>
        <ChevronDown aria-hidden className="size-4 max-sm:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-48 rounded-lg border-2 border-seam bg-raised p-1.5 shadow-[var(--float)]"
      >
        <DropdownMenuGroup aria-label={t("sortMenu")}>
          {PROJECT_SORTS.map((value) => (
            <DropdownMenuItem
              key={value}
              role="menuitemradio"
              aria-checked={sort === value}
              onClick={() => onSort(value)}
              className="flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-label text-ink focus:bg-seam"
            >
              {t(`sorts.${value}`)}
              {sort === value && (
                <Check aria-hidden className="size-4 text-action-ink" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Every Tech of the loadout in a sheet sliding up from the bottom (phones),
 * with a search over their names. Choosing one closes it.
 */
function TechSheet({
  open,
  returnFocus,
  onClose,
  loadout,
  allButton,
  renderButton,
}: {
  open: boolean;
  /** Where focus goes back once the sheet closes, however it closes. */
  returnFocus: React.RefObject<HTMLButtonElement | null>;
  /** Closed without choosing: Escape, a press outside or the close button. */
  onClose: () => void;
  loadout: ReadonlyArray<LoadoutEntry>;
  allButton: React.ReactNode;
  renderButton: (entry: LoadoutEntry) => React.ReactNode;
}) {
  const t = useTranslations("Projects");
  const [query, setQuery] = useState("");
  const content = useRef<HTMLDivElement>(null);
  const found = loadout.filter((entry) => techMatches(entry.tech.name, query));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        ref={content}
        // The keyboard would cover the Techs: focus the sheet, not the search
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          content.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current?.focus();
          setQuery("");
        }}
        className="inset-x-0 bottom-0 flex max-h-[85dvh] flex-col gap-4 rounded-b-none p-4 motion-safe:animate-sheet-in motion-reduce:animate-fade-in"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Radix's own heading names the sheet, in the Title style */}
          <DialogTitle className="font-display text-title text-[1.375rem]">
            {t("loadout")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("filter")}
          </DialogDescription>
          <button
            type="button"
            onClick={onClose}
            className="ledge inline-flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-seam bg-ground text-ink"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">{t("closeTechs")}</span>
          </button>
        </div>
        <label className="relative block">
          <span className="sr-only">{t("searchTechs")}</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchTechs")}
            autoComplete="off"
            className="h-12 w-full rounded-md border-2 border-seam bg-ground pl-10 pr-3 text-body text-ink caret-action-ink placeholder:text-ink-muted/75 focus:border-action-ink/70 focus:outline-none"
          />
        </label>
        <div
          role="group"
          aria-label={t("filter")}
          className="-mx-4 flex flex-col gap-2 overflow-y-auto overscroll-contain px-4 pb-2 pt-1 [&_button]:w-full"
        >
          {query.trim() === "" && allButton}
          {found.map((entry) => renderButton(entry))}
          {found.length === 0 && (
            <TypographyData as="p" className="text-ink-muted">
              {t("noTech")}
            </TypographyData>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
