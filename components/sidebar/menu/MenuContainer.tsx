"use client";

import { usePathname } from "next/navigation";

import { MENU_ROUTES } from "@/config/routes";
import { isActiveRoute } from "@/lib/routes/is-active-route";

import MenuItem from "./MenuItem";

export default function MenuContainer() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2 my-8">
      {MENU_ROUTES.map((route) => (
        <MenuItem
          key={route.path}
          route={route}
          isActive={isActiveRoute(route.path, pathname)}
        />
      ))}
    </nav>
  );
}
