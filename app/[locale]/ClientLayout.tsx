"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import type { Profile } from "@/lib/content/types";

interface ClientLayoutProps {
  children: React.ReactNode;
  profile: Profile;
}

export default function ClientLayout({ children, profile }: ClientLayoutProps) {
  const { isOpen } = useMobileMenu();
  return (
    <div className="p-3 bg-background w-screen h-dvh flex relative gap-3">
      <Sidebar profile={profile} />
      {/* Inert behind the open mobile menu: out of the tab order and the accessibility tree */}
      <main
        inert={isOpen}
        className={`bg-primary-foreground w-full h-full rounded-lg p-4 pb-8 overflow-y-scroll ${
          isOpen ? "blur-sm" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
