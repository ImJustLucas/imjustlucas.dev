"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ArrowBigUpDash,
  Fish,
  MoonStar,
  Shell,
  Target,
  Tornado,
  Waves,
} from "lucide-react";

import {
  type CabinetScreen,
  Deck,
  HowToPlay,
  Marquee,
  NameEntry,
  pad,
  type Rule,
  type RunResult,
  ScreenCards,
  ScreenScore,
} from "@/components/arcade/CabinetParts";
import { BANNER_LIFE, POPUP_LIFE } from "@/components/arcade/canvas-text";
import type { ScreenProps } from "@/components/arcade/screen";
import { useBest, useBoardRun } from "@/components/arcade/use-board-run";
import { useParisNight } from "@/components/chibi/use-paris-night";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import {
  advance,
  createSurf,
  press,
  score,
  type SurfAward,
  type SurfEvent,
  type SurfInput,
  type SurfState,
  WORLD,
} from "@/lib/arcade/surf";
import { chibiFrames } from "@/lib/chibi";
import type { Cue } from "@/lib/sound/kit";

import {
  darkSky,
  drawSurf,
  END_POSE_AT,
  type SurfArt,
  type SurfEnding,
} from "./draw";

const BEST_KEY = "imjustlucas:arcade:surf:best";
/** Frames run this long after the crash: the wipeout, then the end pose. */
const CRASH_SECONDS = END_POSE_AT + 0.9;
/** A key held through the crash does not start the next run at once. */
const RETRY_GUARD_MS = 450;
const POP_KEYS = new Set(["Space", "ArrowUp", "KeyW"]);
/** The sound kit's cue for each thing that happens on the sea. */
const CUES: Partial<Record<SurfEvent, Cue>> = {
  gate: "pickup",
  perfect: "boop",
  shell: "pickup",
  dolphin: "toggleOn",
  saved: "toggleOff",
  tube: "confirm",
  tier: "milestone",
};
/** Popups won together stack this many units apart. */
const POPUP_STACK = 18;

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * The Surf cabinet (DESIGN.md, Arcade): the marquee, the screen where the
 * sea is drawn on a canvas, and the deck. The game itself is the plain
 * `lib/arcade/surf.ts`; this component feeds it the visitor's presses and
 * the frames, plays its events as the sound kit's cues and draws it, with
 * the points it awards rising as popups and a banner for each level. Each run
 * is one the server handed out: its presses are recorded, and a run that
 * makes the leaderboard is sent back to be replayed there.
 */
export default function SurfGame(props: ScreenProps) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const night = useParisNight();
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const descriptionId = useId();

  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const game = useRef<SurfState>(createSurf(newSeed()));
  const art = useRef<SurfArt>({ ride: null, wipeout: null, shaka: null });
  const ending = useRef<SurfEnding | null>(null);
  const crashAt = useRef<number | null>(null);
  const clock = useRef(0);
  const inputs = useRef<SurfInput[]>([]);
  const popups = useRef<Array<{ award: SurfAward; born: number }>>([]);
  const levelUp = useRef<{ tier: number; born: number } | null>(null);
  const font = useRef("monospace");

  const [screen, setScreen] = useState<CabinetScreen>("ready");
  const [result, setResult] = useState<RunResult | null>(null);
  const [live, setLive] = useState("");
  // The score's ink follows the sky, light from sunset on
  const [darkInk, setDarkInk] = useState(night);
  const darkInkRef = useRef(darkInk);
  const { best, record } = useBest(BEST_KEY);
  const { entry, begin, end, submitName } = useBoardRun("surf", props, setLive);

  // What the frame loop reads without restarting
  const levelLabel = useCallback(
    (level: number) => t("cabinets.surf.level", { level }),
    [t],
  );
  const scene = useRef({ night, reducedMotion, play, levelLabel });
  useEffect(() => {
    scene.current = { night, reducedMotion, play, levelLabel };
  }, [night, reducedMotion, play, levelLabel]);

  /** Draws the current frame at the canvas's size. */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // The sea fills the screen's height; a narrower phone screen (3:2)
    // shows a little less of the sea ahead
    const scale = canvas.height / WORLD.height;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const { night, reducedMotion, levelLabel } = scene.current;
    const now = clock.current;
    const up = levelUp.current;
    const tierAge = up ? now - up.born : Infinity;
    drawSurf(ctx, game.current, {
      night,
      reducedMotion,
      art: art.current,
      crashAge: crashAt.current === null ? null : now - crashAt.current,
      ending: ending.current,
      now,
      tierAge,
      popups: popups.current.map(({ award, born }) => ({
        award,
        age: now - born,
      })),
      banner:
        up && tierAge < BANNER_LIFE ? { tier: up.tier, age: tierAge } : null,
      levelLabel,
      font: font.current,
    });
    if (scoreRef.current) {
      scoreRef.current.textContent = pad(score(game.current));
    }
    const dark = darkSky(game.current.tier, tierAge, night);
    if (dark !== darkInkRef.current) {
      darkInkRef.current = dark;
      setDarkInk(dark);
    }
  }, []);

  /** Plays a frame's events as cues, and keeps its points as popups. */
  const happened = useCallback((state: SurfState) => {
    const { play, levelLabel } = scene.current;
    const now = clock.current;
    for (const event of new Set(state.events)) {
      const cue = CUES[event];
      if (cue) play(cue);
    }
    if (state.events.includes("tier")) {
      levelUp.current = { tier: state.tier, born: now };
      setLive(levelLabel(state.tier));
    }
    popups.current = popups.current.filter(
      ({ born }) => now - born < POPUP_LIFE,
    );
    for (const award of state.awards) {
      const stacked = popups.current.filter(
        ({ born }) => now - born < 0.25,
      ).length;
      popups.current.push({
        award: { ...award, lift: award.lift + stacked * POPUP_STACK },
        born: now,
      });
    }
  }, []);

  // The site's Data font, for the text drawn over the sea
  useEffect(() => {
    if (scoreRef.current) {
      font.current = getComputedStyle(scoreRef.current).fontFamily;
    }
  }, []);

  // The poses, then a first frame
  useEffect(() => {
    const load = (src: string, key: keyof SurfArt) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        art.current = { ...art.current, [key]: image };
        render();
      };
      image.src = src;
    };
    load(chibiFrames("surf-ride")[0], "ride");
    load(chibiFrames("surf-wipeout")[0], "wipeout");
    load(chibiFrames("surf")[0], "shaka");
  }, [render]);

  // The canvas follows the screen's width, at the device's pixel density
  useEffect(() => {
    const element = screenRef.current;
    const canvas = canvasRef.current;
    if (!element || !canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      render();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [render]);

  // Day and night, reduced motion: redraw the still sea
  useEffect(() => {
    render();
  }, [night, reducedMotion, render]);

  // The swell keeps rolling while no run is on, but never under reduced
  // motion and never once the run is over
  useEffect(() => {
    if (screen !== "ready" || reducedMotion) return;
    let frame = 0;
    let last = performance.now();
    const idle = (now: number) => {
      clock.current += Math.min((now - last) / 1000, 0.25);
      last = now;
      render();
      frame = requestAnimationFrame(idle);
    };
    frame = requestAnimationFrame(idle);
    return () => cancelAnimationFrame(frame);
  }, [screen, reducedMotion, render]);

  const finish = useCallback(() => {
    const final = score(game.current);
    const { best, newBest } = record(final);
    ending.current = newBest ? "shaka" : "wipeout";
    setResult({ score: final, best, newBest });
    setScreen("over");
    setLive(
      newBest
        ? t("overBest", { score: final })
        : t("over", { score: final, best }),
    );
    const { play } = scene.current;
    play("miss");
    if (newBest) window.setTimeout(() => scene.current.play("unlock"), 450);
    end(final, inputs.current);
  }, [t, record, end]);

  // The frame loop, while a run is on or the wipeout is still playing
  useEffect(() => {
    if (screen !== "running" && screen !== "over") return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      clock.current += Math.min(elapsed, 0.25);
      const state = game.current;
      if (screen === "running") {
        advance(state, elapsed);
        happened(state);
        if (state.phase === "over") {
          crashAt.current = clock.current;
          render();
          finish();
          return;
        }
      }
      render();
      const falling =
        crashAt.current !== null &&
        clock.current - crashAt.current < CRASH_SECONDS;
      if (screen === "running" || falling) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [screen, render, finish, happened]);

  /** A press: he pops off the swell, recorded at the step it landed on. */
  const pop = useCallback(() => {
    const state = game.current;
    if (state.phase === "over") return;
    inputs.current.push({ step: state.steps, press: true });
    press(state);
    scene.current.play("hop");
  }, []);

  const start = useCallback(() => {
    // The run the server handed out, or one off the board
    game.current = createSurf(begin() ?? newSeed());
    inputs.current = [];
    crashAt.current = null;
    ending.current = null;
    popups.current = [];
    levelUp.current = null;
    pop();
    setResult(null);
    setScreen("running");
    setLive(t("cabinets.surf.started"));
    screenRef.current?.focus({ preventScroll: true });
  }, [pop, begin, t]);

  const pause = useCallback(() => {
    setScreen("paused");
    setLive(t("pausedLive"));
    scene.current.play("toggleOff");
  }, [t]);

  const resume = useCallback(() => {
    setScreen("running");
    setLive("");
    scene.current.play("toggleOn");
    screenRef.current?.focus({ preventScroll: true });
  }, []);

  // A hidden tab or a window left pauses the run
  useEffect(() => {
    if (screen !== "running") return;
    const away = () => {
      if (document.visibilityState === "hidden" || !document.hasFocus()) {
        pause();
      }
    };
    document.addEventListener("visibilitychange", away);
    window.addEventListener("blur", away);
    return () => {
      document.removeEventListener("visibilitychange", away);
      window.removeEventListener("blur", away);
    };
  }, [screen, pause]);

  const canRetry = () =>
    crashAt.current === null ||
    (clock.current - crashAt.current) * 1000 > RETRY_GUARD_MS;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const onButton = (event.target as HTMLElement).closest("button");
    if (event.code === "Escape" || event.code === "KeyP") {
      if (screen === "running") pause();
      else if (screen === "paused" && event.code === "KeyP") resume();
      return;
    }
    // Buttons on the screen answer Enter and Space themselves
    if (onButton) return;
    if (!POP_KEYS.has(event.code) && event.code !== "Enter") return;
    event.preventDefault();
    if (event.repeat) return;
    if (screen === "running") pop();
    else if (screen === "ready") start();
    else if (screen === "paused") resume();
    else if (screen === "over" && canRetry()) start();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    if (screen === "running") {
      event.preventDefault();
      pop();
    } else if (screen === "ready") {
      event.preventDefault();
      start();
    }
  };

  const rich = (key: Parameters<typeof t.rich>[0]) =>
    t.rich(key, { b: (chunks) => <b>{chunks}</b> });
  const rules: ReadonlyArray<Rule> = [
    {
      id: "pop",
      icon: ArrowBigUpDash,
      text: rich("cabinets.surf.rules.pop"),
      touch: rich("cabinets.surf.rules.popTouch"),
    },
    { id: "ride", icon: Waves, text: rich("cabinets.surf.rules.ride") },
    { id: "tube", icon: Tornado, text: rich("cabinets.surf.rules.tube") },
    { id: "perfect", icon: Target, text: rich("cabinets.surf.rules.perfect") },
    { id: "shell", icon: Shell, text: rich("cabinets.surf.rules.shell") },
    { id: "dolphin", icon: Fish, text: rich("cabinets.surf.rules.dolphin") },
    { id: "level", icon: MoonStar, text: rich("cabinets.surf.rules.level") },
  ];

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <Marquee cabinet="surf" best={best} />

      {/* The screen */}
      <div
        ref={screenRef}
        role="application"
        tabIndex={0}
        aria-label={t("cabinets.surf.name")}
        aria-describedby={`${descriptionId} ${hintId}`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onContextMenu={(event) => event.preventDefault()}
        className="relative aspect-[3/2] touch-manipulation select-none overflow-hidden rounded-md bg-ground outline-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-ink sm:aspect-video"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full"
        />
        {/* The well's lip, drawn over the canvas */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_2px_0_rgb(var(--ledge))]"
        />
        {/* Score, as the sea's own ink */}
        <ScreenScore
          ref={scoreRef}
          best={best}
          hidden={screen === "ready" || screen === "over"}
          ink={darkInk ? "text-[#f3ecdf]" : "text-[#0b2b35]"}
        />
        <ScreenCards
          screen={screen}
          best={best}
          result={result}
          entry={entry}
          onPlay={start}
          onResume={resume}
        />
      </div>

      <NameEntry
        entry={entry}
        onSubmit={submitName}
        reducedMotion={reducedMotion}
      />

      <Deck
        cabinet="surf"
        hintId={hintId}
        screen={screen}
        onPause={pause}
        onResume={resume}
      />

      <HowToPlay rules={rules} />

      <span id={descriptionId} className="sr-only">
        {t("cabinets.surf.game")}
      </span>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </div>
  );
}
