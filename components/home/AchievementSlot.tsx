"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { ArrowRight } from "lucide-react";

import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { RarityTag } from "@/components/rarity/RarityTag";
import { useSounds } from "@/components/sound/SoundProvider";
import { Sparkle } from "@/components/sparkle";
import {
  TypographyData,
  TypographyP,
  TypographyTitle,
} from "@/components/typography";
import { Link, useRouter } from "@/i18n/navigation";
import type { AchievementInLocale } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const SHEEN_SEEN_KEY = "imjustlucas.achievement-sheen";

const sheenSeen = (name: string) => {
  try {
    return window.sessionStorage.getItem(`${SHEEN_SEEN_KEY}:${name}`) !== null;
  } catch {
    return false;
  }
};

const markSheenSeen = (name: string) => {
  try {
    window.sessionStorage.setItem(`${SHEEN_SEEN_KEY}:${name}`, "1");
  } catch {
    // Without storage the sheen may play again next visit; harmless.
  }
};

/**
 * An achievement slot. A legendary one carries the foil: its sheen crosses
 * once per session when it first scrolls into view, again on hover, and
 * clicking it plays the unlock before navigating to its page.
 */
export function AchievementSlot({
  achievement,
  wide,
  headingLevel = "h3",
}: {
  achievement: AchievementInLocale;
  /** The only slot of the row: art beside the text, full width. */
  wide: boolean;
  headingLevel?: "h3";
}) {
  const t = useTranslations("Home");
  const { play } = useSounds();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const slot = useRef<HTMLAnchorElement>(null);
  const [sheen, setSheen] = useState(0);
  const legendary = achievement.rarity === "legendary";
  const internal = achievement.link.startsWith("/");
  const rarity = RARITY_STYLE[achievement.rarity];

  // The unlock moment, once per session, when it first comes into view.
  useEffect(() => {
    const element = slot.current;
    if (!legendary || !element || reducedMotion) return;
    if (sheenSeen(achievement.name)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        markSheenSeen(achievement.name);
        setSheen((n) => n + 1);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [legendary, reducedMotion, achievement.name]);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    play(legendary ? "unlock" : "press");
    const newTab =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!legendary || !internal || newTab) return;
    // Let the unlock play before leaving the page.
    event.preventDefault();
    if (!reducedMotion) setSheen((n) => n + 1);
    window.setTimeout(
      () => router.push(achievement.link),
      reducedMotion ? 150 : 520,
    );
  };

  const content = (
    <>
      <span aria-hidden className={cn("h-1 shrink-0", rarity.band)} />
      <span
        className={cn(
          "flex flex-1 gap-4 p-4",
          wide
            ? "flex-col sm:flex-row sm:items-center sm:gap-6 sm:p-5"
            : "flex-col",
        )}
      >
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full bg-ground",
            wide ? "size-20 sm:size-32" : "size-24",
          )}
        >
          <Image
            src={achievement.art}
            alt={t("trophyAlt")}
            width={256}
            height={256}
            sizes="128px"
            className="size-[118%] max-w-none object-contain"
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2">
            <RarityTag rarity={achievement.rarity} />
            <TypographyData className="text-ink-muted">
              {achievement.year}
            </TypographyData>
          </span>
          <TypographyTitle as={headingLevel} className="text-[1.375rem]">
            {achievement.name}
          </TypographyTitle>
          <TypographyP className="text-ink-muted [&:not(:first-child)]:mt-0">
            {achievement.description}
          </TypographyP>
        </span>
        {legendary && (
          <Sparkle
            filled
            className="absolute right-4 top-5 size-6 text-legendary"
          />
        )}
        <ArrowRight
          aria-hidden
          className="hidden size-6 shrink-0 self-end text-ink-muted transition-transform duration-hover ease-out group-hover:translate-x-1 motion-reduce:transition-none sm:block"
        />
      </span>
      {sheen > 0 && (
        <span
          key={sheen}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-foil bg-gradient-to-r from-transparent via-[rgb(255_246_204/0.5)] to-transparent mix-blend-overlay dark:via-[rgb(255_236_150/0.35)] dark:mix-blend-screen"
        />
      )}
    </>
  );

  const className = cn(
    "group tray ledge relative flex flex-col overflow-hidden rounded-lg border-2 bg-raised",
    rarity.frame,
    legendary && "ledge-legendary",
  );
  const handlers = {
    onClick,
    onPointerEnter: () => {
      play("tick");
      if (legendary && !reducedMotion) setSheen((n) => n + 1);
    },
  };

  return internal ? (
    <Link
      ref={slot}
      href={achievement.link}
      className={className}
      {...handlers}
    >
      {content}
    </Link>
  ) : (
    <a
      ref={slot}
      href={achievement.link}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...handlers}
    >
      {content}
    </a>
  );
}
