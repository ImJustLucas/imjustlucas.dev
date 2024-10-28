"use client";

import { useMobileMenu } from "@/contexts/menu-mobile.context";
import { Sidebar } from "../components/sidebar/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isOpen } = useMobileMenu();
  return (
    <div className="p-3 bg-background w-screen h-screen flex relative">
      <Sidebar />
      <div
        className={`bg-primary-foreground w-full md:w-10/12 h-full rounded-lg p-2 ${
          isOpen ? "blur-sm" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
