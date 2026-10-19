import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Github, Instagram, Linkedin, Youtube } from "lucide-react";

import { PresenceBlock } from "@/components/presence/Presence";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/content/types";

import { LocaleSwitcher } from "../locale-switcher";
import { ModeToggle } from "../theme-switch";

type SidebarFooterProps = {
  profile: Profile;
};

export function SidebarFooter({ profile }: SidebarFooterProps) {
  const t = useTranslations("Layout");
  const socialLinks = [
    { icon: Linkedin, href: profile.links.linkedin, label: "LinkedIn" },
    { icon: Github, href: profile.links.github, label: "GitHub" },
    { icon: Youtube, href: profile.links.youtube, label: "YouTube" },
    { icon: Instagram, href: profile.links.instagram, label: "Instagram" },
  ];

  return (
    <footer className="bg-background mt-auto">
      <PresenceBlock discordUserId={profile.discordUserId} />
      <div className="container flex flex-col w-full items-center justify-between gap-4 py-4 md:h-16 md:flex-row md:py-0 border-y ">
        <div className="flex w-full justify-center gap-2">
          {socialLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="icon" asChild>
              <Link href={link.href} target="_blank" rel="noopener noreferrer">
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.label}</span>
              </Link>
            </Button>
          ))}
          <LocaleSwitcher />
          <ModeToggle />
        </div>
      </div>
      <div className="text-center pt-4">
        <TypographyMuted>{t("madeBy")}</TypographyMuted>
      </div>
    </footer>
  );
}
