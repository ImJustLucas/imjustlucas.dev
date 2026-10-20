"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Check, Moon, Sun } from "lucide-react";

import { usePalette } from "@/components/palette/use-palette";
import { useSounds } from "@/components/sound/SoundProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PALETTE_SWATCH, PALETTES } from "@/lib/palette";

const MODES = ["dark", "light", "system"] as const;

const itemClass =
  "flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-label text-ink focus:bg-seam";

/**
 * The theme menu: the mode (dark, the default, light, or the system's) and
 * the palette (electric blue, the default, or plum), each remembered per
 * visitor.
 */
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const { play } = useSounds();
  const t = useTranslations("ThemeSwitch");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="ledge relative inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-raised text-ink"
        onClick={() => play("press")}
      >
        <Sun aria-hidden className="size-5 dark:hidden" />
        <Moon aria-hidden className="hidden size-5 dark:block" />
        <span className="sr-only">{t("toggle")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        className="min-w-48 rounded-lg border-2 border-seam bg-raised p-1.5 shadow-[var(--float)]"
      >
        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-tag text-ink-muted">
          {t("mode")}
        </DropdownMenuLabel>
        {MODES.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              setTheme(value);
              play("toggleOn");
            }}
            className={itemClass}
          >
            {t(value)}
            {theme === value && (
              <Check aria-hidden className="size-4 text-action-ink" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="mx-1 my-1.5 h-0.5 bg-seam" />
        <DropdownMenuLabel className="px-3 pb-1 pt-1 text-tag text-ink-muted">
          {t("palette")}
        </DropdownMenuLabel>
        {PALETTES.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              setPalette(value);
              play("toggleOn");
            }}
            className={itemClass}
          >
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="size-3.5 rounded-full"
                style={{ backgroundColor: PALETTE_SWATCH[value] }}
              />
              {t(value)}
            </span>
            {palette === value && (
              <Check aria-hidden className="size-4 text-action-ink" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
