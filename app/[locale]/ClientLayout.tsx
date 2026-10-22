"use client";

import { useTranslations } from "next-intl";

import { MobileTopBar } from "@/components/sidebar/MobileTopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { buttonVariants } from "@/components/ui/button";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import type { Profile } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
  profile: Profile;
  /** The site's current version, the newest patch's; none without one. */
  version?: string;
}

/**
 * The client window: the Night frame with its sparkles, the sidebar (or the
 * mobile top bar and sheet) and the rounded profile panel, the only part
 * that scrolls.
 */
export default function ClientLayout({
  children,
  profile,
  version,
}: ClientLayoutProps) {
  const { isOpen } = useMobileMenu();
  const t = useTranslations("Layout");
  return (
    <div className="sparkle-frame flex h-dvh w-full gap-3 p-3 max-md:flex-col">
      {/* The first stop of the page, seen only on keyboard focus: past the chrome to the content */}
      <a
        href="#content"
        className={cn(
          buttonVariants(),
          "sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-50 focus:h-11 focus:px-4 focus:shadow-[var(--float),0_4px_0_rgb(var(--ledge))]",
        )}
      >
        {t("skipToContent")}
      </a>
      <MobileTopBar />
      <Sidebar profile={profile} version={version} />
      {/* Inert behind the open mobile sheet: out of the tab order and the accessibility tree */}
      <main
        id="content"
        tabIndex={-1}
        inert={isOpen}
        className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-ground p-4 pb-10 md:p-panel focus-visible:outline-none"
      >
        {children}
      </main>
    </div>
  );
}
