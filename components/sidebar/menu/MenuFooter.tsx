import React from "react";
import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypographyMuted, TypographySmall } from "@/components/typography";

const socialLinks = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/lucasbellier/",
    label: "LinkedIn",
  },
  { icon: Twitter, href: "https://x.com/ImJustLucas_", label: "Twitter" },
  { icon: Github, href: "https://github.com/ImJustLucas", label: "GitHub" },
];

export function MenuFooter() {
  return (
    <footer className="bg-background mt-auto">
      presence la
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
        </div>
      </div>
      <div className="text-center pt-4">
        <TypographyMuted>Made with 💖 by ImJustLucas</TypographyMuted>
      </div>
    </footer>
  );
}
