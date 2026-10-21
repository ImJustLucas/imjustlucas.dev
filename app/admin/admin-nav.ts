import {
  Backpack,
  Cpu,
  History,
  House,
  type LucideIcon,
  Palmtree,
  Trophy,
  UserRound,
} from "lucide-react";

/** The Admin's tabs: its home, then one per editor, in the sidebar's order. */
export const ADMIN_TABS: ReadonlyArray<{
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}> = [
  { href: "/admin", label: "Accueil", icon: House },
  { href: "/admin/projects", label: "Projects", icon: Backpack },
  { href: "/admin/experiences", label: "Experiences", icon: History },
  { href: "/admin/techs", label: "Techs", icon: Cpu },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/hobbies", label: "Hobbies", icon: Palmtree },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

/** The tab of `pathname`: the home only at `/admin` itself. */
export const activeTab = (pathname: string) =>
  ADMIN_TABS.findIndex(({ href }) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`),
  );
