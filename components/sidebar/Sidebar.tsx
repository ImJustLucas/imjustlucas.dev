"use client";

import { Menu, X } from "lucide-react";

import { TypographyH3 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import type { Profile } from "@/lib/content/types";
import { cn } from "@/lib/utils";

import MenuContainer from "./menu/MenuContainer";
import { SidebarFooter } from "./SidebarFooter";

type SidebarProps = {
  profile: Profile;
};

export const Sidebar: React.FC<SidebarProps> = ({ profile }) => {
  const { isOpen, toggleMenu } = useMobileMenu();

  return (
    <>
      {/* Mounted once: shown inline on desktop, as an overlay on mobile */}
      <div
        className={cn(
          "md:static md:z-auto md:flex md:h-full md:w-80 md:flex-col md:p-2 md:bg-transparent md:backdrop-blur-none",
          isOpen
            ? "fixed inset-0 z-40 flex flex-col p-4 bg-background/80 backdrop-blur-sm"
            : "hidden",
        )}
      >
        <SideBarContent profile={profile} />
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => toggleMenu()}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
    </>
  );
};

const SideBarContent: React.FC<SidebarProps> = ({ profile }) => {
  return (
    <>
      <TypographyH3>&gt; ImJustLucas</TypographyH3>
      <MenuContainer />
      <SidebarFooter profile={profile} />
    </>
  );
};
