"use client";

import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/config/ROUTES";

import MenuItem from "./MenuItem";

export default function MenuContainer() {
  const router = useRouter();
  const pathName = usePathname();

  const isActive = (route: string) => pathName === route;
  return (
    <div className="space-y-2 my-8">
      <MenuItem
        label="me"
        onClick={() => router.push(ROUTES.ME)}
        isActive={isActive(ROUTES.ME)}
      />
      <MenuItem
        label="what i've done"
        onClick={() => router.push(ROUTES.WHAT)}
        isActive={isActive(ROUTES.WHAT)}
      />
      <MenuItem
        label="how i do it"
        onClick={() => router.push(ROUTES.HOW)}
        isActive={isActive(ROUTES.HOW)}
      />

      <MenuItem
        label="my experiences"
        onClick={() => router.push(ROUTES.EXPERIENCES)}
        isActive={isActive(ROUTES.EXPERIENCES)}
      />

      <MenuItem
        label="yt videos"
        onClick={() => router.push(ROUTES.VIDEOS)}
        isActive={isActive(ROUTES.VIDEOS)}
      />

      <MenuItem
        label="contact"
        onClick={() => router.push(ROUTES.CONTACT)}
        isActive={isActive(ROUTES.CONTACT)}
      />
      <MenuItem
        label="MDF 2025"
        onClick={() => router.push(ROUTES.MDF)}
        isActive={isActive(ROUTES.MDF)}
      />
    </div>
  );
}
