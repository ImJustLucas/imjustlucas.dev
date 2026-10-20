"use client";

import { MobileTopBar } from "@/components/sidebar/MobileTopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import type { Profile } from "@/lib/content/types";

interface ClientLayoutProps {
  children: React.ReactNode;
  profile: Profile;
}

/**
 * The client window: the Night frame with its sparkles, the sidebar (or the
 * mobile top bar and sheet) and the rounded profile panel, the only part
 * that scrolls.
 */
export default function ClientLayout({ children, profile }: ClientLayoutProps) {
  const { isOpen } = useMobileMenu();
  return (
    <div className="sparkle-frame flex h-dvh w-full gap-3 p-3 max-md:flex-col">
      <MobileTopBar />
      <Sidebar profile={profile} />
      {/* Inert behind the open mobile sheet: out of the tab order and the accessibility tree */}
      <main
        inert={isOpen}
        className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-ground p-4 pb-10 md:p-panel"
      >
        {children}
      </main>
    </div>
  );
}
