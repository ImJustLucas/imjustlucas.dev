/* eslint-disable @next/next/no-html-link-for-pages -- the Locale pages use
   another root layout, so leaving this page is a full page load anyway. */
import "@/styles/globals.css";

import type { Metadata } from "next";

import { fontVariables } from "@/app/fonts";
import { TypographyH1, TypographyP } from "@/components/typography";

export const metadata: Metadata = {
  title: "404 · ImJustLucas",
};

/**
 * 404 for URLs outside every root layout (no Locale prefix, unknown Locale).
 * There is no Locale here, so it offers both.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontVariables} antialiased bg-background text-foreground`}
      >
        <main className="flex h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
          <TypographyH1 className="text-3xl font-semibold">404</TypographyH1>
          <TypographyP className="leading-normal [&:not(:first-child)]:mt-0">
            <span lang="en">Page not found.</span>{" "}
            <span lang="fr">Page introuvable.</span>
          </TypographyP>
          <TypographyP className="flex gap-4 leading-normal [&:not(:first-child)]:mt-0">
            <a href="/en" hrefLang="en" className="underline">
              Home
            </a>
            <a href="/fr" hrefLang="fr" lang="fr" className="underline">
              Accueil
            </a>
          </TypographyP>
        </main>
      </body>
    </html>
  );
}
