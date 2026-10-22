import { getFormatter, getTranslations } from "next-intl/server";

import { Check, Github } from "lucide-react";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { TypographyData, TypographyTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { PatchInLocale } from "@/lib/content/types";

import { patchAnchor, patchDay } from "./patch-notes";
import { PatchLines } from "./PatchLines";

/**
 * The "what's new" window: the current version, open. From 1024px the
 * version stands in its own column beside the lines, like a launcher's
 * update panel; below, it heads them.
 */
export async function CurrentPatch({ patch }: { patch: PatchInLocale }) {
  const [t, format] = await Promise.all([
    getTranslations("PatchNotes"),
    getFormatter(),
  ]);
  const anchor = patchAnchor(patch.version);

  return (
    <section
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="tray grid scroll-mt-4 gap-6 rounded-lg border-2 border-seam bg-raised p-4 sm:p-6 md:px-7 md:py-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10"
    >
      <div className="flex flex-col gap-3 lg:border-r-2 lg:border-seam lg:pr-8">
        <TypographyTitle
          as="h2"
          id={`${anchor}-title`}
          className="flex flex-col gap-1.5"
        >
          {/* The version is the screen's big number, the title its name */}
          <span className="text-display leading-none text-ink">
            {t("version", { version: patch.version })}
          </span>
          <span className="text-[1.375rem] leading-tight text-ink">
            {patch.title}
          </span>
        </TypographyTitle>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-online px-2 py-0.5 text-tag text-on-bright">
            <Check aria-hidden className="size-3" strokeWidth={3} />
            {t("current")}
          </span>
          <TypographyData
            as="time"
            dateTime={patch.date}
            className="text-ink-muted"
          >
            {format.dateTime(patchDay(patch.date), {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </TypographyData>
        </div>
        {patch.link && (
          <SoundOnPress>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-1 self-start lg:mt-auto"
            >
              <a href={patch.link} target="_blank" rel="noopener noreferrer">
                <Github aria-hidden />
                {t("link")}
              </a>
            </Button>
          </SoundOnPress>
        )}
      </div>
      <PatchLines
        entries={patch.entries}
        tagLabels={{
          new: t("tags.new"),
          changed: t("tags.changed"),
          fixed: t("tags.fixed"),
        }}
        className="lg:self-center"
      />
    </section>
  );
}
