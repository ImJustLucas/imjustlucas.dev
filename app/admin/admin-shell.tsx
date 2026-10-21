"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ExternalLink, LogOut, Menu, X } from "lucide-react";

import { signOut } from "@/app/admin/actions";
import { activeTab, ADMIN_TABS } from "@/app/admin/admin-nav";
import { AdminThemeMenu } from "@/app/admin/admin-theme-menu";
import { TypographyTitle } from "@/components/typography";
import { cn } from "@/lib/utils";

/** One tab row: 44px, with a 4px gap, so the fill slides by 48px a tab. */
const TAB_STEP = 48;

/** Lucas's chibi head, ringed in the seam: the Admin has no live presence. */
const OwnerHead: React.FC<{ className: string }> = ({ className }) => (
  <span
    className={cn(
      "inline-flex shrink-0 rounded-full bg-ground ring-[3px] ring-seam",
      className,
    )}
  >
    <Image
      src="/images/chibi-avatar-64x64.png"
      alt=""
      width={64}
      height={64}
      className="size-full rounded-full object-cover"
      priority
    />
  </span>
);

/** The editors as the client's tabs; the action fill slides to the open one. */
const AdminTabs: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const active = activeTab(usePathname());
  return (
    <nav aria-label="Éditeurs">
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
        {ADMIN_TABS.map(({ href, label, icon: Icon }, index) => {
          const isActive = index === active;
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3.5 text-label transition-colors duration-hover ease-out",
                  isActive
                    ? "text-on-action"
                    : "text-ink hover:bg-seam/70 active:bg-seam",
                )}
              >
                <Icon aria-hidden className="size-[18px] shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

/** Signing out is a POST (`signOut`), so no link can trigger it. */
export const SignOutButton: React.FC<{
  className?: string;
  /** In the sidebar: the icon alone, its label kept as its name. */
  iconOnly?: boolean;
}> = ({ className, iconOnly }) => (
  <form action={signOut} className={className}>
    <button
      type="submit"
      title={iconOnly ? "Se déconnecter" : undefined}
      className={cn(
        "ledge inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-raised text-label text-ink hover:bg-seam/40 [&_svg]:size-4",
        iconOnly ? "w-11 px-0" : "px-4",
      )}
    >
      <LogOut aria-hidden />
      <span className={cn(iconOnly && "sr-only")}>Se déconnecter</span>
    </button>
  </form>
);

/**
 * The Admin as one more screen of the game client (DESIGN.md, Admin): the
 * sparkle frame, a sidebar with the player card and the editors as tabs, and
 * the rounded panel, the only part that scrolls. Below 768px the sidebar is
 * a sheet under a top bar, as on the public pages.
 */
export function AdminShell({
  login,
  children,
}: {
  login: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // A new page closes the sheet
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      toggle.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <div
      className={cn(
        "sparkle-frame flex h-dvh w-full gap-3 p-3 max-md:flex-col",
        // The sparkles of the gutter follow the 272px sidebar below 1024px
        "md:max-lg:[background-position:left_0_top_0,right_0_top_0,left_0_top_0,left_0_bottom_0,left_284px_top_0]",
      )}
    >
      <header className="flex h-14 shrink-0 items-center gap-3 rounded-xl bg-ground pl-2 pr-1.5 md:hidden">
        <OwnerHead className="size-10" />
        <TypographyTitle as="p" className="truncate">
          ImJustLucas
        </TypographyTitle>
        <span className="rounded-full border-2 border-seam px-2 py-0.5 text-tag text-ink-muted">
          admin
        </span>
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen((value) => !value)}
          className="ledge ml-auto inline-flex size-11 items-center justify-center rounded-md bg-raised text-ink"
        >
          {open ? (
            <X aria-hidden className="size-5" />
          ) : (
            <Menu aria-hidden className="size-5" />
          )}
          <span className="sr-only">
            {open ? "Fermer le menu" : "Ouvrir le menu"}
          </span>
        </button>
      </header>

      <aside
        id="admin-sidebar"
        className={cn(
          "relative flex flex-col gap-6 overflow-y-auto rounded-xl bg-ground p-4",
          "md:w-[17rem] md:shrink-0 lg:w-sidebar",
          "max-md:float max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:top-[76px] max-md:z-40 max-md:transition-[transform,opacity,visibility] max-md:ease-drawer max-md:motion-reduce:transition-opacity",
          open
            ? "max-md:visible max-md:translate-y-0 max-md:opacity-100 max-md:duration-[260ms]"
            : "max-md:invisible max-md:translate-y-6 max-md:opacity-0 max-md:duration-[180ms]",
        )}
      >
        <div className="tray flex items-center gap-3 rounded-lg bg-raised p-3 max-md:hidden lg:gap-4 lg:p-4">
          <OwnerHead className="size-10 lg:size-14" />
          <div className="min-w-0">
            <TypographyTitle
              as="p"
              className="truncate leading-tight lg:text-[1.375rem]"
            >
              ImJustLucas
            </TypographyTitle>
            <span className="mt-1 flex items-center gap-2 text-label text-ink-muted">
              <span className="rounded-full border-2 border-seam px-2 py-px text-tag">
                admin
              </span>
              <span className="truncate max-lg:hidden">@{login}</span>
            </span>
          </div>
        </div>

        <AdminTabs onNavigate={() => setOpen(false)} />

        <div className="mt-auto flex gap-3 border-t-2 border-seam pt-4">
          <AdminThemeMenu />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="ledge inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-seam bg-ground px-3 text-label text-ink [&_svg]:size-4"
          >
            <ExternalLink aria-hidden />
            Voir le site
          </a>
          <SignOutButton iconOnly />
        </div>
      </aside>

      <main
        id="admin-panel"
        inert={open}
        className="relative min-h-0 flex-1 overflow-y-auto rounded-xl bg-ground px-4 pt-4 md:px-panel md:pt-panel"
      >
        {/* Relative, so the visually hidden inputs of the fields stay in
            the panel's scroll and never stretch the page. The bottom space
            is inside, not padding: a pinned save footer sticks to the
            panel's very edge */}
        <div className="pb-16">{children}</div>
      </main>
    </div>
  );
}
