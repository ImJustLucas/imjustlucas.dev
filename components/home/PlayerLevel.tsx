import { getTranslations } from "next-intl/server";

import { ArrowUpRight, Flame } from "lucide-react";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import {
  SECONDARY_LINK,
  TypographyData,
  TypographyHeadline,
  TypographyMuted,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import type {
  ContributionDay,
  PlayerLevel as Level,
} from "@/lib/content/types";
import { cn } from "@/lib/utils";

import { XpBar } from "./XpBar";

/**
 * GitHub's shades in the ink, the seam for an empty day: the panel's one
 * action stays the Play button.
 */
const SHADE: Record<ContributionDay["intensity"], string> = {
  0: "bg-seam",
  1: "bg-ink/25",
  2: "bg-ink/45",
  3: "bg-ink/70",
  4: "bg-ink",
};

/**
 * Lucas's Level from his GitHub Contributions: the level badge, the XP bar
 * towards the next Level, the Streak with its flame, the last weeks as a
 * heatmap, and his GitHub profile.
 */
export async function PlayerLevel({
  level,
  github,
}: {
  level: Level;
  /** The Profile's GitHub link. */
  github: string;
}) {
  const t = await getTranslations("Home.level");
  const next = level.level + 1;
  const lit = level.streak > 0 && level.streakIncludesToday;

  return (
    <div className="tray flex flex-col gap-5 rounded-lg bg-raised p-5 md:p-card">
      {/* Level and XP */}
      <div className="flex items-center gap-4 md:gap-5">
        <div
          role="img"
          aria-label={t("badgeLabel", { level: level.level })}
          className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-seam bg-ground md:size-[72px]"
        >
          <TypographyTag className="leading-none text-ink-muted">
            {t("badge")}
          </TypographyTag>
          <TypographyHeadline as="span" className="leading-none tabular-nums">
            {level.level}
          </TypographyHeadline>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <TypographyData className="text-ink-muted">
              {t.rich("xp", {
                levelXp: level.levelXp,
                levelCost: level.levelCost,
                ink: (chunks) => (
                  <span className="text-title text-ink">{chunks}</span>
                ),
              })}
            </TypographyData>
            <TypographyMuted className="text-ink">
              {t("toNext", {
                remaining: level.levelCost - level.levelXp,
                next,
              })}
            </TypographyMuted>
          </div>
          <XpBar
            value={level.levelXp}
            max={level.levelCost}
            label={t("barLabel", { next })}
          />
          <TypographyMuted>{t("rule", { xp: level.xp })}</TypographyMuted>
        </div>
      </div>

      <div className="h-0.5 rounded-full bg-seam" aria-hidden />

      {/* The Streak, beside the recent weeks it ends */}
      <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-8">
        <div className="max-md:contents md:flex md:flex-1 md:flex-col md:justify-between md:gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-seam bg-ground"
            >
              <Flame
                className={cn(
                  "size-6",
                  lit
                    ? "fill-ink/25 text-ink"
                    : level.streak > 0
                      ? "text-ink-muted"
                      : "text-seam",
                )}
              />
            </span>
            <div className="min-w-0">
              <TypographyTitle as="p">
                {t("streakDays", { streak: level.streak })}
              </TypographyTitle>
              <TypographyMuted>
                {level.streak === 0
                  ? t("streakNone")
                  : lit
                    ? t("streakLit")
                    : t("streakOpen")}
              </TypographyMuted>
            </div>
          </div>
          <SoundOnPress>
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex min-h-11 items-center gap-1.5 self-start text-label max-md:order-last",
                SECONDARY_LINK,
              )}
            >
              {t("seeGitHub")}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-hover ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </SoundOnPress>
        </div>

        <div className="flex flex-col gap-2 md:order-first md:shrink-0">
          {level.weeks.length > 0 && (
            <Heatmap
              weeks={level.weeks}
              cellLabel={(day) =>
                t("cell", { count: day.count, date: new Date(day.date) })
              }
            />
          )}
          <TypographyMuted>
            {t("recent", {
              count: level.recentContributions,
              weeks: level.weeks.length,
            })}
          </TypographyMuted>
        </div>
      </div>
    </div>
  );
}

/**
 * The recent weeks as GitHub draws them: a column per week, Sunday on top.
 * Hidden from assistive tech, which reads the total beside it; each day keeps
 * its count as a native tooltip.
 */
function Heatmap({
  weeks,
  cellLabel,
}: {
  weeks: ReadonlyArray<ReadonlyArray<ContributionDay>>;
  cellLabel: (day: ContributionDay) => string;
}) {
  return (
    <div
      aria-hidden
      // Cells share the width on phones, 14px squares from 768px.
      className="grid grid-flow-col gap-[3px] [grid-template-rows:repeat(7,auto)] [grid-template-columns:repeat(var(--weeks),minmax(0,1fr))] md:gap-1 md:[grid-template-columns:repeat(var(--weeks),14px)]"
      style={{ "--weeks": weeks.length } as React.CSSProperties}
    >
      {weeks.map((week, column) =>
        week.map((day) => (
          <span
            key={day.date}
            title={cellLabel(day)}
            className={cn("aspect-square rounded-full", SHADE[day.intensity])}
            style={{
              gridColumn: column + 1,
              gridRow: new Date(`${day.date}T00:00:00Z`).getUTCDay() + 1,
            }}
          />
        )),
      )}
    </div>
  );
}
