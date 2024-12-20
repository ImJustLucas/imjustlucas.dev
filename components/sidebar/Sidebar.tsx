"use client";

import { Menu, X } from "lucide-react";

import { TypographyH3 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useMobileMenu } from "@/contexts/menu-mobile.context";

import MenuContainer from "./menu/MenuContainer";
import { SidebarFooter } from "./SidebarFooter";

export const Sidebar: React.FC = () => {
  const { isOpen, toggleMenu } = useMobileMenu();

  return (
    <>
      <div className="hidden md:flex p-2 h-full w-80 flex-col">
        <SideBarContent />
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40">
          <div className="p-4 h-full w-full flex flex-col">
            <SideBarContent />
          </div>
        </div>
      )}
    </>
  );
};

const SideBarContent = () => {
  return (
    <>
      <TypographyH3>&gt; ImJustLucas</TypographyH3>
      <MenuContainer />
      <SidebarFooter />
    </>
  );
};
