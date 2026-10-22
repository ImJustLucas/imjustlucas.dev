"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import {
  Coins as CoinsIcon,
  MousePointerClick,
  Pause,
  Play,
} from "lucide-react";

import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { SAMPLES } from "@/lib/sound/kit";

import { SceneLoading } from "./scene-loading";

// three.js, R3F and the post-processing stay out of the page's bundle (and
// out of every prefetch of this route): the scene loads after the page, under
// the same loader the scene shows while its assets load.
const SceneCanvas = dynamic(() => import("./master-dev-scene"), {
  ssr: false,
  loading: () => <SceneLoading progress={0} />,
});

const readRaised = () =>
  `rgb(${getComputedStyle(document.documentElement)
    .getPropertyValue("--raised")
    .trim()
    .split(/\s+/)
    .join(",")})`;

const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-palette"],
  });
  return () => observer.disconnect();
};

/** The palette's raised colour in the current mode, following changes. */
const useRaisedColor = () =>
  useSyncExternalStore(subscribeToTheme, readRaised, () => "rgb(20,28,72)");

/**
 * The showcase: the scene in a sunken well (night sky in the dark modes, the
 * palette's daylight in light), and under it the controls: throw a coin,
 * the hint, and pause. Still under reduced motion until the visitor plays.
 */
export default function Showcase() {
  const t = useTranslations("Mdf2025");
  const { play } = useSounds();
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  // null until the visitor chooses: still under reduced motion, moving otherwise.
  const [paused, setPaused] = useState<boolean | null>(null);
  const [throws, setThrows] = useState(0);
  const still = paused ?? reducedMotion;
  const day = resolvedTheme === "light";
  const stageColor = useRaisedColor();

  useEffect(() => {
    // Warm the HTTP cache, so the first throw sounds at once.
    for (const url of Object.values(SAMPLES)) {
      fetch(url).catch(() => {});
    }
  }, []);

  const togglePause = () => {
    play(still ? "toggleOn" : "toggleOff");
    setPaused(!still);
  };

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <div className="relative h-[clamp(240px,36dvh,300px)] overflow-hidden rounded-md bg-ground sm:h-[clamp(360px,calc(100dvh-420px),600px)]">
        <SceneCanvas
          still={still}
          day={day}
          stageColor={stageColor}
          throws={throws}
        />
        {/* The well's lip, drawn over the canvas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_2px_0_rgb(var(--ledge))]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:px-1">
        <Button disabled={still} onClick={() => setThrows((n) => n + 1)}>
          <CoinsIcon aria-hidden />
          {t("throw")}
        </Button>
        <TypographyMuted className="order-last flex basis-full items-center gap-2 sm:order-none sm:basis-auto">
          <MousePointerClick aria-hidden className="size-4 shrink-0" />
          {still ? (
            t("hintStill")
          ) : (
            <>
              <span className="[@media(pointer:coarse)]:hidden">
                {t("hint")}
              </span>
              <span className="hidden [@media(pointer:coarse)]:inline">
                {t("hintTouch")}
              </span>
            </>
          )}
        </TypographyMuted>
        <Button className="ml-auto" onClick={togglePause}>
          {still ? <Play aria-hidden /> : <Pause aria-hidden />}
          {still ? t("play") : t("pause")}
        </Button>
      </div>
    </div>
  );
}
