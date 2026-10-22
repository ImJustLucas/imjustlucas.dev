"use client";

import { useState, useSyncExternalStore } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Github } from "lucide-react";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyData, TypographyTitle } from "@/components/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { PatchInLocale } from "@/lib/content/types";

import { patchAnchor, patchDay } from "./patch-notes";
import { PatchLines, PatchTally, type TagLabels } from "./PatchLines";

export type Season = {
  readonly number: number;
  /** How many patches it holds, the current one included. */
  readonly count: number;
  /** Its first and last patch days, `YYYY-MM-DD`. */
  readonly from: string;
  readonly to: string;
  /** Its patches the page has not opened above, newest first. */
  readonly patches: ReadonlyArray<PatchInLocale>;
};

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

/**
 * The older patches, season by season, as accordion rows that open in place
 * (toggle on and off); a patch's address (`#v2-9`) opens its row on arrival.
 */
export function PatchSeasons({ seasons }: { seasons: ReadonlyArray<Season> }) {
  const t = useTranslations("PatchNotes");
  const format = useFormatter();
  const tagLabels: TagLabels = {
    new: t("tags.new"),
    changed: t("tags.changed"),
    fixed: t("tags.fixed"),
  };
  const month = (date: string) =>
    format.dateTime(patchDay(date), { month: "short", year: "numeric" });
  const { play } = useSounds();
  const [open, setOpen] = useState<string[]>([]);
  // Arriving on a patch's address (`#v2-9`) opens its row, until the visitor
  // folds or opens rows themself; the browser scrolls to it on its own
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => "",
  );
  const [handledHash, setHandledHash] = useState("");
  const addressed =
    hash !== handledHash &&
    seasons.some((season) =>
      season.patches.some((patch) => patchAnchor(patch.version) === hash),
    );
  const value = addressed && !open.includes(hash) ? [...open, hash] : open;

  const change = (next: string[]) => {
    play(next.length > value.length ? "toggleOn" : "toggleOff");
    setOpen(next);
    setHandledHash(hash);
  };

  return (
    <div className="flex flex-col gap-section">
      {seasons.map((season) => (
        <section
          key={season.number}
          aria-labelledby={`season-${season.number}`}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <TypographyTitle id={`season-${season.number}`}>
              {t("season", { number: season.number })}
            </TypographyTitle>
            <TypographyData className="text-ink-muted">
              {t("patches", { count: season.count })} ·{" "}
              {month(season.from) === month(season.to)
                ? month(season.to)
                : `${month(season.from)} → ${month(season.to)}`}
            </TypographyData>
          </div>
          <Accordion
            type="multiple"
            value={value}
            onValueChange={change}
            className="flex flex-col gap-3"
          >
            {season.patches.map((patch) => {
              const anchor = patchAnchor(patch.version);
              return (
                <AccordionItem
                  key={patch.version}
                  value={anchor}
                  id={anchor}
                  className="scroll-mt-4"
                >
                  <AccordionTrigger onPointerEnter={() => play("tick")}>
                    {/* Phones: the chip beside the title, the date under it */}
                    <span className="grid min-w-0 flex-1 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto_7.5rem]">
                      <TypographyData className="inline-flex h-7 items-center justify-center rounded-full bg-ground px-2 text-ink">
                        {t("version", { version: patch.version })}
                      </TypographyData>
                      <span className="min-w-0 font-display text-[1rem] font-semibold leading-snug text-ink sm:text-title">
                        {patch.title}
                      </span>
                      <PatchTally
                        entries={patch.entries}
                        tagLabels={tagLabels}
                        className="max-sm:hidden"
                      />
                      <TypographyData
                        as="time"
                        dateTime={patch.date}
                        className="font-normal text-ink-muted max-sm:col-start-2 sm:text-right"
                      >
                        {format.dateTime(patchDay(patch.date), {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TypographyData>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="flex max-w-none flex-col gap-5 border-t-2 border-seam/70 pt-5 text-ink">
                    <PatchLines entries={patch.entries} tagLabels={tagLabels} />
                    {patch.link && (
                      <SoundOnPress>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="self-start"
                        >
                          <a
                            href={patch.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github aria-hidden />
                            {t("link")}
                          </a>
                        </Button>
                      </SoundOnPress>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
