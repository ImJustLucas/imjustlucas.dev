"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

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
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();
  const t = useTranslations("Sidebar");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // While the mobile menu is open, Escape closes it, and so does widening the
  // window to the desktop layout, where the content panel must not stay inert.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => desktop.matches && closeMenu();
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [isOpen, closeMenu]);

  // Focus goes back to the toggle when the menu closes, whatever closed it.
  useEffect(() => {
    if (wasOpen.current && !isOpen) toggleRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button: first in the tab order, so Tab moves into the open menu */}
      <Button
        ref={toggleRef}
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => toggleMenu()}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        {isOpen ? <X /> : <Menu />}
        <span className="sr-only">
          {isOpen ? t("closeMenu") : t("openMenu")}
        </span>
      </Button>

      {/* Mounted once: shown inline on desktop, as an overlay on mobile */}
      <div
        id="sidebar"
        className={cn(
          "md:static md:z-auto md:flex md:h-full md:w-80 md:flex-col md:p-2 md:bg-transparent md:backdrop-blur-none",
          isOpen
            ? "fixed inset-0 z-40 flex flex-col p-4 bg-background/80 backdrop-blur-sm"
            : "hidden",
        )}
      >
        <SideBarContent profile={profile} />
      </div>
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
