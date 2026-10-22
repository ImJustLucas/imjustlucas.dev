"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Award } from "lucide-react";

import { useSounds } from "@/components/sound/SoundProvider";
import { useTrophies } from "@/components/trophies/trophy-store";
import { TypographyData } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { Link, usePathname } from "@/i18n/navigation";
import { isActiveRoute } from "@/lib/routes/is-active-route";
import { TROPHIES, unlockedCount } from "@/lib/trophies/trophies";
import { cn } from "@/lib/utils";

const noop = () => () => {};

/**
 * The visitor's Trophies at the foot of the sidebar, across from the
 * version: a quiet link to the trophies screen with the count ("7/16"),
 * read after hydration (no number before, rather than a wrong one).
 */
export function TrophyCount() {
  const t = useTranslations("Sidebar");
  const { play } = useSounds();
  const { closeMenu } = useMobileMenu();
  const pathname = usePathname();
  const progress = useTrophies();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const done = unlockedCount(progress);
  const total = TROPHIES.length;
  const active = isActiveRoute(ROUTES.trophies.path, pathname);

  return (
    <Link
      href={ROUTES.trophies.path}
      aria-current={active ? "page" : undefined}
      aria-label={t("trophies", { done, total })}
      onPointerEnter={() => play("tick")}
      onClick={() => {
        play("press");
        closeMenu();
      }}
      className={cn(
        "group -mx-1 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-1 text-label transition-colors duration-hover ease-out hover:text-ink",
        active ? "text-ink" : "text-ink-muted",
      )}
    >
      <Award aria-hidden className="size-4" />
      <TypographyData
        aria-hidden
        className={cn(
          "min-w-[4ch] underline decoration-transparent decoration-2 underline-offset-4 transition-[color,opacity] duration-hover group-hover:decoration-link-line",
          !hydrated && "opacity-0",
        )}
      >
        {done}/{total}
      </TypographyData>
    </Link>
  );
}
