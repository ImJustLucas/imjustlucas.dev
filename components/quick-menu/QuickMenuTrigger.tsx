"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { useQuickMenu } from "./QuickMenuProvider";

const SHORTCUTS = "Meta+K Control+K /";

const MAC = /Mac|iPhone|iPad/;
// The system never changes during a visit
const noChange = () => () => {};

/** "⌘" on Apple systems, "Ctrl" elsewhere; nothing before mount. */
export const useModifierKey = () =>
  useSyncExternalStore(
    noChange,
    () => (MAC.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => null,
  );

/** A key as the quick menu draws it: Data on a ground cap with a seam rim. */
export function Keycap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-sm border-2 border-seam bg-ground px-1.5 font-mono text-[0.75rem] font-medium leading-none text-ink",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * The sidebar's quick menu button (from 768px): a full-width ledge row
 * under the tabs, a search mark, "quick menu" and its shortcut.
 */
export function QuickMenuButton() {
  const { open, preload } = useQuickMenu();
  const modifier = useModifierKey();
  const t = useTranslations("QuickMenu");

  return (
    <button
      type="button"
      onClick={open}
      onPointerEnter={preload}
      onFocus={preload}
      aria-haspopup="dialog"
      aria-keyshortcuts={SHORTCUTS}
      className="ledge flex h-11 w-full items-center gap-3 rounded-md bg-raised pl-3 pr-2.5 text-label text-ink hover:bg-seam/40 max-md:hidden"
    >
      <Search aria-hidden className="size-[18px] shrink-0" />
      <span className="flex-1 text-left">{t("trigger")}</span>
      {modifier && (
        <span aria-hidden className="flex items-center gap-1">
          <Keycap>{modifier}</Keycap>
          <Keycap>K</Keycap>
        </span>
      )}
    </button>
  );
}

/** The mobile top bar's quick menu button: a 44px ledge icon button. */
export function QuickMenuIconButton() {
  const { open, preload } = useQuickMenu();
  const t = useTranslations("QuickMenu");

  return (
    <button
      type="button"
      onClick={open}
      onPointerDown={preload}
      aria-haspopup="dialog"
      aria-keyshortcuts={SHORTCUTS}
      className="ledge inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-raised text-ink"
    >
      <Search aria-hidden className="size-5" />
      <span className="sr-only">{t("open")}</span>
    </button>
  );
}
