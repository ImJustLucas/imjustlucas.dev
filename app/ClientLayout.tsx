"use client";

import { useMobileMenu } from "@/contexts/menu-mobile.context";

import { Sidebar } from "../components/sidebar/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isOpen } = useMobileMenu();
  return (
    <div className="p-3 bg-background w-screen h-screen flex relative gap-3 select-none	">
      <Sidebar />
      <div
        className={`bg-primary-foreground w-full h-full rounded-lg p-4 ${
          isOpen ? "blur-sm" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
