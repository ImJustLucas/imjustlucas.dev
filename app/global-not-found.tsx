/* eslint-disable @next/next/no-html-link-for-pages -- the Locale pages use
   another root layout, so leaving this page is a full page load anyway. */
import "@/styles/globals.css";

import type { Metadata } from "next";

import { geistMono, geistSans } from "@/app/fonts";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <main className="flex h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">404</h1>
          <p>
            <span lang="en">Page not found.</span>{" "}
            <span lang="fr">Page introuvable.</span>
          </p>
          <p className="flex gap-4">
            <a href="/en" hrefLang="en" className="underline">
              Home
            </a>
            <a href="/fr" hrefLang="fr" lang="fr" className="underline">
              Accueil
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
