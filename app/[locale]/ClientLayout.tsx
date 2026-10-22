"use client";

import { useTranslations } from "next-intl";

import { QuickMenuProvider } from "@/components/quick-menu/QuickMenuProvider";
import { RadioPill } from "@/components/radio/RadioPill";
import { useRadio } from "@/components/radio/RadioProvider";
import { MobileTopBar } from "@/components/sidebar/MobileTopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { TrophyLayer } from "@/components/trophies/TrophyLayer";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { usePathname } from "@/i18n/navigation";
import type { Profile, ProjectEntry } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
  profile: Profile;
  /** The site's current version, the newest patch's; none without one. */
  version?: string;
  /** For the quick menu's inventory. */
  projects: ReadonlyArray<ProjectEntry>;
}

/**
 * The client window: the Night frame with its sparkles, the sidebar (or the
 * mobile top bar and sheet) and the rounded profile panel, the only part
 * that scrolls, the radio's pill on phones and the quick menu over all of it. The recruiter mode
 * (`/cv`) steps out of the client: its page alone, scrolling the document.
 */
export default function ClientLayout({
  children,
  profile,
  version,
  projects,
}: ClientLayoutProps) {
  const { isOpen } = useMobileMenu();
  const { state: radio } = useRadio();
  const t = useTranslations("Layout");
  const pathname = usePathname();
  if (pathname === ROUTES.cv.path)
    return (
      <main id="content" tabIndex={-1} className="focus-visible:outline-none">
        {children}
      </main>
    );
  return (
    <QuickMenuProvider data={{ projects, profile }}>
      <div
        data-client-window
        className="sparkle-frame flex h-dvh w-full gap-3 p-3 max-md:flex-col"
      >
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
          className={cn(
            "min-h-0 flex-1 overflow-y-auto rounded-xl bg-ground p-4 pb-10 md:p-panel focus-visible:outline-none",
            // Room under the content for the radio's pill on phones
            radio.status !== "off" && "max-md:pb-24",
          )}
        >
          {children}
        </main>
        <RadioPill />
      </div>
      <TrophyLayer />
    </QuickMenuProvider>
  );
}
