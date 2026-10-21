import { getTranslations } from "next-intl/server";

import { Check } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { RarityTag } from "@/components/rarity/RarityTag";
import { Sparkle } from "@/components/sparkle";
import {
  TypographyData,
  TypographyHeadline,
  TypographyP,
  TypographyTag,
} from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * The unlock banner: the page banner wearing its item's legendary frame,
 * top band and sparkle, as the reward screen a game shows right after an
 * unlock. The foil crosses it once on arrival (not under reduced motion).
 */
export async function UnlockBanner({ year }: { year: number }) {
  const [t, routes] = await Promise.all([
    getTranslations("Mdf2025"),
    getTranslations("Routes"),
  ]);
  const legendary = RARITY_STYLE.legendary;

  return (
    <header
      className={cn(
        "tray relative flex flex-col overflow-hidden rounded-lg border-2 bg-raised",
        legendary.frame,
      )}
    >
      <span aria-hidden className={cn("h-1 shrink-0", legendary.band)} />
      <div className="grid grid-cols-[1fr_96px] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[1fr_128px] sm:p-6 md:grid-cols-[1fr_160px] md:gap-x-8 md:px-7 md:py-5">
        {/* On phones the title takes the full row, the chibi sits by the line */}
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-1 sm:self-end">
          {/* One long word: it shrinks with a phone's width instead of overflowing */}
          <TypographyHeadline className="pr-8 text-[length:min(1.75rem,5.6vw)] sm:pr-0 sm:text-headline">
            {routes(`${ROUTES.mdf2025.messageKey}.title`)}
          </TypographyHeadline>
          <div className="flex flex-wrap items-center gap-2">
            <RarityTag rarity="legendary" />
            <TypographyTag className="inline-flex items-center gap-1 rounded-full bg-online px-2 py-0.5 text-on-bright">
              <Check aria-hidden className="size-3" strokeWidth={3} />
              {t("unlocked")}
            </TypographyTag>
            <TypographyData className="text-ink-muted">{year}</TypographyData>
          </div>
        </div>
        <TypographyP className="col-start-1 max-w-[60ch] text-pretty text-[1.0625rem] font-medium text-ink-muted sm:self-start [&:not(:first-child)]:mt-0">
          {t("line")}
        </TypographyP>
        <div className="relative col-start-2 row-start-2 self-end sm:row-span-2 sm:row-start-1">
          {/* The chibi's stage, as on the other page banners */}
          <span
            aria-hidden
            className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
          />
          <ChibiSprite
            pose="trophy"
            alt={t("chibiAlt")}
            sizes="(min-width: 768px) 160px, (min-width: 640px) 128px, 96px"
            priority
            className="aspect-square w-full"
          />
        </div>
      </div>
      <Sparkle
        filled
        className="absolute right-4 top-5 size-6 text-legendary"
      />
      {/* The unlock, confirmed: the foil crosses once on arrival */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-foil bg-gradient-to-r from-transparent via-[rgb(255_246_204/0.5)] to-transparent mix-blend-overlay [animation-delay:200ms] motion-reduce:hidden dark:via-[rgb(255_236_150/0.35)] dark:mix-blend-screen"
      />
    </header>
  );
}
