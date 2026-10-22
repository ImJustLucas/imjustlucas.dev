"use client";

import { useTranslations } from "next-intl";

import { Github, Instagram, Linkedin, Youtube } from "lucide-react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { FriendsPanel } from "@/components/presence/FriendsPanel";
import { QuickMenuButton } from "@/components/quick-menu/QuickMenuTrigger";
import { RadioSlot } from "@/components/radio/RadioSlot";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { SoundSwitch } from "@/components/sound/SoundSwitch";
import { ModeToggle } from "@/components/theme-switch";
import { useMobileMenu } from "@/contexts/menu-mobile.context";
import type { Profile } from "@/lib/content/types";
import { cn } from "@/lib/utils";

import { ClientTabs } from "./ClientTabs";
import { PlayerCard } from "./PlayerCard";
import { VersionLink } from "./VersionLink";

type SidebarProps = {
  profile: Profile;
  /** The site's current version; no version link without one. */
  version?: string;
};

/**
 * The client chrome, mounted once: a 320px column from 768px up, the
 * full-screen client sheet below it (opened from the mobile top bar), so
 * there is a single Lanyard connection and a single set of tab sounds.
 */
export const Sidebar: React.FC<SidebarProps> = ({ profile, version }) => {
  const { isOpen } = useMobileMenu();
  const t = useTranslations("Sidebar");

  return (
    <div
      id="sidebar"
      aria-label={t("client")}
      role="region"
      data-open={isOpen}
      className={cn(
        "flex flex-col gap-6 overflow-y-auto bg-ground p-4",
        "md:static md:h-full md:w-sidebar md:shrink-0 md:rounded-xl",
        // Mobile: the client sheet, sliding up with Ease Drawer
        "max-md:float max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-[68px] max-md:z-40 max-md:rounded-t-xl max-md:pb-8",
        isOpen
          ? "max-md:visible max-md:translate-y-0 max-md:[transition:transform_var(--dur-sheet-in)_var(--ease-drawer),opacity_150ms_ease-out]"
          : "max-md:invisible max-md:translate-y-full max-md:[transition:transform_var(--dur-sheet-out)_var(--ease-drawer),opacity_150ms_ease-out,visibility_0s_var(--dur-sheet-out)]",
        // Reduced motion: the sheet fades instead of sliding
        "motion-reduce:max-md:translate-y-0",
        !isOpen && "motion-reduce:max-md:opacity-0",
      )}
    >
      <div className="max-md:hidden">
        <PlayerCard />
      </div>
      <ClientTabs />
      {/* Below 768px the top bar holds the quick menu's button */}
      <QuickMenuButton />
      <FriendsPanel />
      <div className="mt-auto flex flex-col gap-4">
        <RadioSlot />
        <SettingsRow />
        <SocialRow profile={profile} />
        {version && <VersionLink version={version} />}
      </div>
    </div>
  );
};

function SettingsRow() {
  const t = useTranslations("Sidebar");
  return (
    <div
      role="group"
      aria-label={t("settings")}
      className="flex items-center gap-2 pb-1"
    >
      {/* Below 768px the top bar's switch stays visible above the sheet */}
      <SoundSwitch className="max-md:hidden" />
      <LocaleSwitcher />
      <ModeToggle />
    </div>
  );
}

function SocialRow({ profile }: Pick<SidebarProps, "profile">) {
  const t = useTranslations("Sidebar");
  const socials = [
    { icon: Linkedin, href: profile.links.linkedin, label: "LinkedIn" },
    { icon: Github, href: profile.links.github, label: "GitHub" },
    { icon: Youtube, href: profile.links.youtube, label: "YouTube" },
    { icon: Instagram, href: profile.links.instagram, label: "Instagram" },
  ];

  return (
    <ul aria-label={t("socials")} className="flex items-center gap-2 pb-1">
      {socials.map((social) => (
        <li key={social.href}>
          <SoundOnPress>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ledge inline-flex size-11 items-center justify-center rounded-md bg-raised text-ink"
            >
              <social.icon aria-hidden className="size-5" />
              <span className="sr-only">{social.label}</span>
            </a>
          </SoundOnPress>
        </li>
      ))}
    </ul>
  );
}
