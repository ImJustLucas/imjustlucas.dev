/* eslint-disable @next/next/no-html-link-for-pages -- the Locale pages use
   another root layout, so leaving this page is a full page load anyway. */
import "@/styles/globals.css";

import type { Metadata } from "next";

import { House } from "lucide-react";

import { fontVariables } from "@/app/fonts";
import { NotFoundSlot } from "@/components/not-found/NotFoundSlot";
import { Button } from "@/components/ui/button";
import { PALETTE_SCRIPT } from "@/lib/palette";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

export const metadata: Metadata = {
  title: `404 · ${en.Metadata.siteName}`,
  robots: { index: false },
};

/**
 * The mode next-themes stored for the Locale pages (dark, light or
 * system; dark by default), applied before the first paint since this page
 * has no ThemeProvider. Storage may be unavailable; dark stays.
 */
const MODE_STORAGE_KEY = "theme";
const MODE_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  MODE_STORAGE_KEY,
)}),d=t==="light"?!1:t==="system"?matchMedia("(prefers-color-scheme: dark)").matches:!0,e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(e){}`;

/**
 * 404 for URLs outside every root layout (no Locale prefix, unknown Locale).
 * There is no Locale here, so it speaks both, English first, in the client's
 * frame without the sidebar; Play goes to the root address, which sends the
 * visitor to their browser's Locale. No sound: there is no switch to silence it.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT + MODE_SCRIPT }}
        />
      </head>
      <body className={`${fontVariables} antialiased`}>
        <div className="sparkle-frame flex h-dvh p-3">
          <main className="flex flex-1 flex-col overflow-y-auto rounded-xl bg-ground p-4 md:p-panel">
            {/* Auto margins centre it, and give way to scrolling when it is taller */}
            <div className="m-auto flex w-full justify-center">
              <NotFoundSlot
                headline={
                  <>
                    {en.NotFound.headline}{" "}
                    <span lang="fr" className="block text-ink-muted">
                      {fr.NotFound.headline}
                    </span>
                  </>
                }
                message={
                  <>
                    {en.NotFound.message}{" "}
                    <span lang="fr" className="mt-2 block">
                      {fr.NotFound.message}
                    </span>
                  </>
                }
                code="404"
                chibiAlt={en.NotFound.chibiAlt}
                action={
                  <Button
                    asChild
                    variant="play"
                    size="lg"
                    // Both words fit on a phone with tighter sides, and wrap
                    // onto two lines on the narrowest
                    className="h-auto min-h-[52px] w-full flex-wrap gap-y-1 px-4 py-3 sm:w-auto sm:px-6"
                  >
                    <a href="/">
                      <House aria-hidden className="!size-5" />
                      {en.NotFound.respawn}
                      <span aria-hidden className="opacity-60">
                        ·
                      </span>
                      <span lang="fr">{fr.NotFound.respawn}</span>
                    </a>
                  </Button>
                }
              />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
