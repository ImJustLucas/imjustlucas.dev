"use client";

import { useTranslations } from "next-intl";

import {
  Backpack,
  Clapperboard,
  History,
  type LucideIcon,
  MessageCircleHeart,
  UserRound,
  Wrench,
} from "lucide-react";

import { useSounds } from "@/components/sound/SoundProvider";
import { MENU_ROUTES, type RouteMessageKey } from "@/config/routes";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { Link, usePathname } from "@/i18n/navigation";
import { isActiveRoute } from "@/lib/routes/is-active-route";
import { cn } from "@/lib/utils";

const TAB_ICONS: Partial<Record<RouteMessageKey, LucideIcon>> = {
  me: UserRound,
  what: Backpack,
  how: Wrench,
  experiences: History,
  videos: Clapperboard,
  contact: MessageCircleHeart,
};

/** One tab row: 44px, with a 4px gap, so the fill slides by 48px a tab. */
const TAB_STEP = 48;

/**
 * The client tabs: the menu, generated from `MENU_ROUTES`. The action
 * fill slides from tab to tab, and each tab plays its own note, so walking
 * down the menu plays a rising scale.
 */
export function ClientTabs() {
  const pathname = usePathname();
  const { closeMenu } = useMobileMenu();
  const { play } = useSounds();
  const t = useTranslations("Routes");
  const tSidebar = useTranslations("Sidebar");
  const active = MENU_ROUTES.findIndex((route) =>
    isActiveRoute(route.path, pathname),
  );

  return (
    <nav aria-label={tSidebar("menu")}>
      <ul className="relative flex flex-col gap-1">
        <li
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-11 rounded-md bg-action shadow-[0_3px_0_rgb(var(--action-ledge))] transition-[transform,opacity] duration-tab ease-in-out motion-reduce:transition-none",
            active < 0 && "opacity-0",
          )}
          style={{
            transform: `translateY(${Math.max(active, 0) * TAB_STEP}px)`,
          }}
        />
        {MENU_ROUTES.map((route, index) => {
          const isActive = index === active;
          const Icon = TAB_ICONS[route.messageKey];
          return (
            <li key={route.path} className="relative">
              <Link
                href={route.path}
                aria-current={isActive ? "page" : undefined}
                onPointerEnter={() => play("tick")}
                onClick={() => {
                  play("tab", { tab: index });
                  closeMenu();
                }}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3.5 text-label transition-colors duration-hover ease-out",
                  isActive
                    ? "text-on-action"
                    : "text-ink hover:bg-seam/70 active:bg-seam",
                )}
              >
                {Icon && <Icon aria-hidden className="size-[18px] shrink-0" />}
                {t(`${route.messageKey}.label`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
