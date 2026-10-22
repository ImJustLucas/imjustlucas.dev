"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { ChevronRight } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { useSounds } from "@/components/sound/SoundProvider";
import type { ChibiPose } from "@/lib/chibi";
import { cn } from "@/lib/utils";

/** Characters the answer gains per step, and the step, while it types. */
const TYPED_PER_STEP = 2;
const STEP_MS = 18;

type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  /** The pose Lucas strikes while answering it. */
  pose: ChibiPose;
};

/**
 * The FAQ as a game's dialogue: Lucas on his stage disc, his answer in a
 * speech bubble, the questions as the choices under it. The first answer is
 * there from the start; a chosen one types itself out.
 */
export function Faq({ entries }: { entries: ReadonlyArray<FaqEntry> }) {
  const t = useTranslations("Home");
  const { play } = useSounds();
  const [chosen, setChosen] = useState(entries[0]?.id);
  const [typing, setTyping] = useState(false);
  const current = entries.find((entry) => entry.id === chosen) ?? entries[0];
  if (!current) return null;

  return (
    <div className="tray grid gap-6 rounded-lg bg-raised p-5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center md:gap-8 md:p-card">
      {/* Lucas, striking the pose of the question */}
      <div className="flex justify-center">
        <div className="relative w-32 md:w-full">
          <span
            aria-hidden
            className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
          />
          <ChibiSprite
            pose={current.pose}
            alt=""
            sizes="(min-width: 768px) 180px, 128px"
            className="aspect-square w-full"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {/* The bubble: from 768px every answer is stacked in one cell, so it
            is as tall as the longest and the choices beside the chibi never
            move; on phones it fits the answer shown */}
        <div
          aria-live="polite"
          className="relative rounded-lg border-2 border-seam bg-ground px-4 py-3.5 md:px-5 md:py-4"
        >
          <span
            aria-hidden
            className="absolute -top-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-seam bg-ground md:-left-[9px] md:top-8 md:translate-x-0 md:border-b-2 md:border-t-0"
          />
          <span className="block text-label font-semibold text-ink">lucas</span>
          <div className="mt-1 grid">
            {entries.map((entry) => {
              const shown = entry.id === current.id;
              return (
                <div
                  key={entry.id}
                  aria-hidden={!shown}
                  className={cn(
                    "leading-[1.65] text-ink [grid-area:1/1]",
                    !shown && "invisible max-md:hidden",
                  )}
                >
                  {shown ? (
                    <>
                      <span className="sr-only">{entry.answer}</span>
                      <Typed
                        key={entry.id}
                        text={entry.answer}
                        animate={typing}
                      />
                    </>
                  ) : (
                    entry.answer
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* The choices */}
        <ul aria-label={t("faqChoices")} className="flex flex-col gap-2">
          {entries.map((entry) => {
            const pressed = entry.id === current.id;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onPointerEnter={() => play("tick")}
                  onClick={() => {
                    if (pressed) return;
                    play("press");
                    setTyping(true);
                    setChosen(entry.id);
                  }}
                  className={cn(
                    "ledge flex min-h-11 w-full items-center gap-2 rounded-md border-2 border-seam bg-ground px-3 py-2 text-left text-label text-ink",
                    pressed &&
                      "ledge-action border-action bg-action text-on-action",
                  )}
                >
                  <ChevronRight aria-hidden className="size-4 shrink-0" />
                  {entry.question}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * The answer typing itself out, a couple of characters at a time; all at
 * once without `animate` or under reduced motion. Hidden from assistive
 * tech, which reads the whole answer beside it.
 */
function Typed({ text, animate }: { text: string; animate: boolean }) {
  const [count, setCount] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setCount(text.length));
      return () => cancelAnimationFrame(frame);
    }
    const timer = window.setInterval(() => {
      setCount((typed) => {
        const next = Math.min(typed + TYPED_PER_STEP, text.length);
        if (next === text.length) window.clearInterval(timer);
        return next;
      });
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [animate, text]);

  return <span aria-hidden>{text.slice(0, count)}</span>;
}
