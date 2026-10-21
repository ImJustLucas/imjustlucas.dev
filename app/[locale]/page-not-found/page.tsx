import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { House } from "lucide-react";

import { NotFoundSlot } from "@/components/not-found/NotFoundSlot";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * A Locale's 404 page, in that Locale and within the normal layout. `proxy.ts`
 * serves it, with a 404 status, for every path under a Locale that is no
 * Route; it is statically generated, so its HTML is fully rendered.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("NotFound.title")} · ${t("Metadata.siteName")}`,
    robots: { index: false },
  };
}

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");
  return (
    // Centred in the panel: the viewport less the frame, the mobile top bar
    // and the panel's padding
    <div className="flex min-h-[calc(100dvh-9.25rem)] items-center justify-center md:min-h-[calc(100dvh-5rem)]">
      <NotFoundSlot
        headline={t("headline")}
        message={t("message")}
        code={t("code")}
        chibiAlt={t("chibiAlt")}
        action={
          <SoundOnPress cue="confirm">
            <Button
              asChild
              variant="play"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/">
                <House aria-hidden className="!size-5" />
                <span>
                  {t.rich("play", {
                    // Only the verb fits on a phone; the rest is still read
                    home: (chunks) => (
                      <span className="max-sm:sr-only">{chunks}</span>
                    ),
                  })}
                </span>
              </Link>
            </Button>
          </SoundOnPress>
        }
      />
    </div>
  );
}
