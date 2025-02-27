import React from "react";
import Link from "next/link";

import { Github, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";

import { PresenceBlock } from "@/components/presence/Presence";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";

import { ModeToggle } from "../theme-switch";

const socialLinks = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/lucasbellier/",
    label: "LinkedIn",
  },
  { icon: Github, href: "https://github.com/ImJustLucas", label: "GitHub" },
  {
    icon: Youtube,
    href: "https://www.youtube.com/channel/UCLw4N_gccAY1Y4K4S20IPog",
    label: "Youtube",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/imjustlucas_/",
    label: "Instagram",
  },
];

export function SidebarFooter() {
  return (
    <footer className="bg-background mt-auto">
      <PresenceBlock />
      <div className="container flex flex-col w-full items-center justify-between gap-4 py-4 md:h-16 md:flex-row md:py-0 border-y ">
        <div className="flex w-full justify-center gap-4">
          {socialLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="icon" asChild>
              <Link href={link.href} target="_blank" rel="noopener noreferrer">
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.label}</span>
              </Link>
            </Button>
          ))}
          <ModeToggle />
        </div>
      </div>
      <div className="text-center pt-4">
        <TypographyMuted>Made with 💖 by ImJustLucas</TypographyMuted>
      </div>
    </footer>
  );
}
