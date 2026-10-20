"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Check, Moon, Sun } from "lucide-react";

import { useSounds } from "@/components/sound/SoundProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = ["dark", "light", "system"] as const;

/** The theme menu: dark ("LAN night", the default), light, or the system's. */
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
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
        className="min-w-40 rounded-lg border-2 border-seam bg-raised p-1.5 shadow-[var(--float)]"
      >
        {THEMES.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              setTheme(value);
              play("toggleOn");
            }}
            className="flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-label text-ink focus:bg-seam"
          >
            {t(value)}
            {theme === value && (
              <Check aria-hidden className="size-4 text-tangerine-ink" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
