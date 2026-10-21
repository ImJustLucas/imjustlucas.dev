"use client";

import { useTranslations } from "next-intl";

import {
  TypographyData,
  TypographyMuted,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import { type Board, LEADERBOARD_SIZE } from "@/lib/arcade/board";
import type { CabinetId } from "@/lib/arcade/cabinets";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(5, "0");

/**
 * A cabinet's leaderboard (DESIGN.md, Arcade): the ten best players, best
 * first, the visitor's own row lit. Null while it loads.
 */
export function Leaderboard({
  board,
  playerId,
  cabinet,
}: {
  board: Board | null;
  playerId: string | null;
  cabinet: CabinetId;
}) {
  const t = useTranslations("Arcade.board");
  const arcade = useTranslations("Arcade");
  return (
    <section
      aria-labelledby="arcade-board"
      className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:p-4"
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <TypographyTitle as="h2" id="arcade-board">
          {t("title", { size: LEADERBOARD_SIZE })}
        </TypographyTitle>
        <TypographyData className="text-ink-muted">
          {arcade(`cabinets.${cabinet}.name`)}
        </TypographyData>
      </div>

      {board === null ? (
        <ol aria-busy className="flex flex-col gap-1" aria-label={t("loading")}>
          {Array.from({ length: 3 }, (_, i) => (
            <li
              key={i}
              className="h-9 animate-pulse rounded-md bg-seam/50 motion-reduce:animate-none"
            />
          ))}
        </ol>
      ) : board.kind === "unavailable" ? (
        <TypographyMuted className="px-1">{t("unavailable")}</TypographyMuted>
      ) : board.top.length === 0 ? (
        <TypographyMuted className="px-1">
          {arcade(`cabinets.${cabinet}.empty`)}
        </TypographyMuted>
      ) : (
        <ol className="flex flex-col gap-1">
          {board.top.map((entry, i) => {
            const mine = entry.playerId === playerId;
            return (
              <li
                key={entry.playerId}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-2",
                  mine ? "bg-seam" : i % 2 === 0 && "bg-ground/60",
                )}
              >
                <TypographyData className="w-6 shrink-0 text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </TypographyData>
                <span className="min-w-0 truncate text-label text-ink">
                  {entry.name}
                </span>
                {mine && (
                  <TypographyTag className="shrink-0 rounded-full bg-online px-2 py-0.5 text-on-bright">
                    {t("you")}
                  </TypographyTag>
                )}
                <TypographyData className="ml-auto shrink-0 text-ink">
                  {pad(entry.score)}
                </TypographyData>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
