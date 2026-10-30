"use client";

import { type FormEvent, useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";

import {
  Hand,
  Keyboard,
  type LucideIcon,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";

import type { Entry } from "@/components/arcade/use-board-run";
import { useSounds } from "@/components/sound/SoundProvider";
import {
  TypographyData,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { CabinetId } from "@/lib/arcade/cabinets";
import { NAME_MAX_LENGTH } from "@/lib/arcade/player-name";
import { cn } from "@/lib/utils";

/**
 * The parts every cabinet shares (DESIGN.md, Arcade): the marquee, the cards
 * over the game's screen, the first-name strip, the deck and the how-to-play
 * strip. Each game only brings its screen: its rules, its inputs and its
 * canvas.
 */

export type CabinetScreen = "ready" | "running" | "paused" | "over";
export type RunResult = {
  readonly score: number;
  readonly best: number;
  readonly newBest: boolean;
};

/** Scores as the Arcade shows them: five digits, zero-padded. */
export const pad = (value: number) => String(value).padStart(5, "0");

/** The Admin's field, so typing a name feels like the rest of the client. */
const INPUT =
  "h-11 w-full min-w-0 rounded-md border-2 border-seam bg-ground px-3 text-base text-ink transition-colors duration-hover ease-out placeholder:text-ink-muted/75 hover:border-ink-muted/40 aria-[invalid=true]:border-busy-ink";

/** The game's name across from the visitor's best. */
export function Marquee({
  cabinet,
  best,
  format = pad,
  empty = "-----",
}: {
  cabinet: CabinetId;
  best: number | null;
  /** How the game writes a score (Café: a time). */
  format?: (score: number) => string;
  /** The best before a first run. */
  empty?: string;
}) {
  const t = useTranslations("Arcade");
  return (
    <div className="flex items-baseline justify-between gap-4 px-1">
      <TypographyTitle as="h2" className="text-[1.375rem]">
        {t(`cabinets.${cabinet}.name`)}
      </TypographyTitle>
      <TypographyData className="text-ink-muted">
        {t("best")}{" "}
        <span className="text-ink">{best === null ? empty : format(best)}</span>
      </TypographyData>
    </div>
  );
}

/**
 * The score while a run is on, top-right in the game's own ink, the best
 * before it at 60%; it hides while a card carries the score.
 */
export function ScreenScore({
  best,
  hidden,
  ink,
  ref,
}: {
  best: number | null;
  hidden: boolean;
  /** The game's ink, a text colour class. */
  ink: string;
  ref: React.Ref<HTMLSpanElement>;
}) {
  const t = useTranslations("Arcade");
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-3 top-2 font-mono text-data tabular-nums sm:right-4 sm:top-3",
        ink,
        hidden && "opacity-0",
      )}
    >
      {best !== null && (
        <span className="opacity-60">
          {t("best")} {pad(best)}{" "}
        </span>
      )}
      <span ref={ref}>00000</span>
    </span>
  );
}

/** A card over the game: the client's window on its screen. */
export function ScreenCard({
  children,
  bare = false,
  className,
}: {
  children: React.ReactNode;
  /** On phones, the button stands alone on the screen, with no card. */
  bare?: boolean;
  /** Where the card stands, when not clear of the left quarter. */
  className?: string;
}) {
  return (
    // Clear of Lucas, who rides in the left quarter of the screen
    <div
      className={cn(
        "absolute inset-y-0 left-[27%] right-0 flex items-center justify-center p-3",
        className,
      )}
    >
      <div
        className={cn(
          "float flex max-w-full flex-col items-center gap-2 rounded-lg border-2 border-seam bg-raised px-3 py-2.5 text-center sm:gap-4 sm:px-6 sm:py-5",
          bare &&
            "max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** The cards over the screen while no run is on: ready, paused, over. */
export function ScreenCards({
  screen,
  best,
  result,
  entry,
  onPlay,
  onResume,
  overTitle,
  extra,
  place,
}: {
  screen: CabinetScreen;
  best: number | null;
  result: RunResult | null;
  entry: Entry;
  onPlay: () => void;
  onResume: () => void;
  /** The game's own words for a run over ("merge conflict!"). */
  overTitle?: string;
  /** A line of the game's own under the score, once over. */
  extra?: React.ReactNode;
  /** Where the cards stand, when not clear of the left quarter. */
  place?: string;
}) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const asking = entry.kind === "asking" || entry.kind === "sending";

  if (screen === "ready") {
    return (
      <ScreenCard bare className={place}>
        <TypographyData className="hidden text-ink-muted sm:block">
          {best === null ? (
            t("firstRun")
          ) : (
            <>
              {t("best")} <span className="text-ink">{pad(best)}</span>
            </>
          )}
        </TypographyData>
        <Button
          variant="play"
          className="sm:h-[52px] sm:px-6"
          onClick={() => {
            play("confirm");
            onPlay();
          }}
        >
          <Play aria-hidden />
          {t("play")}
        </Button>
      </ScreenCard>
    );
  }

  if (screen === "paused") {
    return (
      <ScreenCard className={place}>
        <TypographyTitle as="p">{t("paused")}</TypographyTitle>
        <Button
          variant="play"
          className="sm:h-[52px] sm:px-6"
          onClick={onResume}
        >
          <Play aria-hidden />
          {t("resume")}
        </Button>
      </ScreenCard>
    );
  }

  if (screen !== "over" || !result) return null;
  return (
    <ScreenCard className={place}>
      <div className="flex flex-col items-center gap-1">
        <TypographyTitle as="p">
          {result.newBest ? t("newBest") : (overTitle ?? t("gameOver"))}
        </TypographyTitle>
        <TypographyData className="whitespace-nowrap text-ink-muted">
          {t("score")} <span className="text-ink">{pad(result.score)}</span>
          {"  "}
          {t("best")} <span className="text-ink">{pad(result.best)}</span>
        </TypographyData>
        {extra}
        {entry.kind === "ranked" && (
          <TypographyData className="flex items-center gap-1.5 text-action-ink">
            <Trophy aria-hidden className="size-4" />
            {t("entry.rank", { rank: entry.rank })}
          </TypographyData>
        )}
        {entry.kind === "missed" && (
          <TypographyData className="text-ink-muted">
            {t("entry.missed")}
          </TypographyData>
        )}
      </div>
      <Button
        // While the name is asked, saving is the screen's one action
        variant={asking ? "default" : "play"}
        className="sm:h-[52px] sm:px-6"
        onClick={() => {
          play("confirm");
          onPlay();
        }}
      >
        <RotateCcw aria-hidden />
        {t("playAgain")}
      </Button>
    </ScreenCard>
  );
}

/** A run for the board: the first name, asked once, under the screen. */
export function NameEntry({
  entry,
  onSubmit,
  reducedMotion,
}: {
  entry: Entry;
  /** The typed name; false when it cannot stand on the board. */
  onSubmit: (name: string) => boolean;
  reducedMotion: boolean;
}) {
  const t = useTranslations("Arcade");
  const nameId = useId();
  const hintId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // On a keyboard, typing goes straight to the name,
  const askingFirst = entry.kind === "asking" && !entry.problem;
  // and on a phone, the strip scrolls into view under the screen
  useEffect(() => {
    if (!askingFirst) return;
    formRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
    if (window.matchMedia("(pointer: fine)").matches) {
      nameRef.current?.focus({ preventScroll: true });
    }
  }, [askingFirst, reducedMotion]);

  if (entry.kind !== "asking" && entry.kind !== "sending") return null;
  const problem = entry.kind === "asking" ? entry.problem : undefined;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit(nameRef.current?.value ?? "")) nameRef.current?.focus();
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-md bg-ground p-3 sm:p-4"
    >
      <TypographyTitle as="p" className="flex items-center gap-2">
        <Trophy aria-hidden className="size-5 shrink-0 text-action-ink" />
        {t("entry.ranks")}
      </TypographyTitle>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor={nameId} className="text-label text-ink">
            {t("entry.label")}
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            autoComplete="given-name"
            maxLength={NAME_MAX_LENGTH + 8}
            disabled={entry.kind === "sending"}
            aria-invalid={!!problem}
            aria-describedby={hintId}
            className={INPUT}
          />
        </div>
        <Button
          type="submit"
          variant="play"
          disabled={entry.kind === "sending"}
          className="shrink-0"
        >
          {entry.kind === "sending" ? t("entry.sending") : t("entry.submit")}
        </Button>
      </div>
      <span
        id={hintId}
        role={problem ? "alert" : undefined}
        className={cn(
          "text-label",
          problem ? "text-busy-ink" : "text-ink-muted",
        )}
      >
        {problem ? t(`entry.problems.${problem}`) : t("entry.hint")}
      </span>
    </form>
  );
}

/**
 * Under the screen: the hint, and pause / resume pushed right, after the
 * game's own buttons (`children`).
 */
export function Deck({
  cabinet,
  hintId,
  screen,
  onPause,
  onResume,
  children,
}: {
  cabinet: CabinetId;
  hintId: string;
  screen: CabinetScreen;
  onPause: () => void;
  onResume: () => void;
  children?: React.ReactNode;
}) {
  const t = useTranslations("Arcade");
  return (
    // With the game's own buttons, a phone gives the hint its own line
    <div
      className={cn(
        "flex items-center gap-x-4 gap-y-3 sm:px-1",
        children && "max-sm:flex-wrap",
      )}
    >
      <TypographyMuted
        className={cn(
          "flex items-center gap-2",
          children && "max-sm:basis-full",
        )}
      >
        <span id={hintId} className="contents">
          <Keyboard
            aria-hidden
            className="size-4 shrink-0 [@media(pointer:coarse)]:hidden"
          />
          <Hand
            aria-hidden
            className="hidden size-4 shrink-0 [@media(pointer:coarse)]:inline"
          />
          <span className="[@media(pointer:coarse)]:hidden">
            {t(`cabinets.${cabinet}.hint`)}
          </span>
          <span className="hidden [@media(pointer:coarse)]:inline">
            {t(`cabinets.${cabinet}.hintTouch`)}
          </span>
        </span>
      </TypographyMuted>
      {children}
      <Button
        className={cn("shrink-0", children ? "max-sm:ml-auto" : "ml-auto")}
        disabled={screen !== "running" && screen !== "paused"}
        onClick={screen === "paused" ? onResume : onPause}
      >
        {screen === "paused" ? <Play aria-hidden /> : <Pause aria-hidden />}
        {screen === "paused" ? t("resume") : t("pause")}
      </Button>
    </div>
  );
}

/** One line of a game's rules, its keyboard and touch wordings. */
export type Rule = {
  readonly id: string;
  readonly icon: LucideIcon;
  readonly text: React.ReactNode;
  /** The wording on a touch screen, when it differs. */
  readonly touch?: React.ReactNode;
};

/** Under the deck: how to play, a line per rule, two columns from 640px. */
export function HowToPlay({ rules }: { rules: ReadonlyArray<Rule> }) {
  const t = useTranslations("Arcade");
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-md bg-ground p-3 sm:p-4"
    >
      <TypographyTitle as="h3" id={titleId}>
        {t("howToPlay")}
      </TypographyTitle>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rules.map(({ id, icon: Icon, text, touch }) => (
          <li
            key={id}
            className="flex gap-2 text-label text-ink-muted [&_b]:font-semibold [&_b]:text-ink"
          >
            <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {touch ? (
              <>
                <span className="[@media(pointer:coarse)]:hidden">{text}</span>
                <span className="hidden [@media(pointer:coarse)]:inline">
                  {touch}
                </span>
              </>
            ) : (
              <span>{text}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
