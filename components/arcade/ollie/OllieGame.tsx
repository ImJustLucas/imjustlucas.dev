"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  type CabinetScreen,
  Deck,
  Marquee,
  NameEntry,
  pad,
  type RunResult,
  ScreenCards,
  ScreenScore,
} from "@/components/arcade/CabinetParts";
import type { ScreenProps } from "@/components/arcade/screen";
import { useBest, useBoardRun } from "@/components/arcade/use-board-run";
import { useParisNight } from "@/components/chibi/use-paris-night";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import {
  advance,
  createOllie,
  type OllieInput,
  type OllieState,
  press,
  release,
  score,
  WORLD,
} from "@/lib/arcade/ollie";
import { chibiFrames } from "@/lib/chibi";

import {
  drawOllie,
  END_POSE_AT,
  type OllieArt,
  type OllieEnding,
} from "./draw";

const BEST_KEY = "imjustlucas:arcade:ollie:best";
/** Frames run this long after the crash: the fall, then the end pose. */
const CRASH_SECONDS = END_POSE_AT + 0.1;
/** A key held through the crash does not start the next run at once. */
const RETRY_GUARD_MS = 450;
const JUMP_KEYS = new Set(["Space", "ArrowUp", "KeyW"]);

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * The Ollie cabinet (DESIGN.md, Arcade): the marquee, the screen where the
 * street is drawn on a canvas, and the deck. The game itself is the plain
 * `lib/arcade/ollie.ts`; this component feeds it the visitor's presses and
 * the frames, plays its events as the sound kit's cues and draws it. Each run
 * is one the server handed out: its presses are recorded, and a run that
 * makes the leaderboard is sent back to be replayed there.
 */
export default function OllieGame(props: ScreenProps) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const night = useParisNight();
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const descriptionId = useId();

  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const game = useRef<OllieState>(createOllie(newSeed()));
  const art = useRef<OllieArt>({
    roll: null,
    air: null,
    sleeping: null,
    trophy: null,
  });
  const ending = useRef<OllieEnding | null>(null);
  const crashAt = useRef<number | null>(null);
  const clock = useRef(0);
  const inputs = useRef<OllieInput[]>([]);

  const [screen, setScreen] = useState<CabinetScreen>("ready");
  const [result, setResult] = useState<RunResult | null>(null);
  const [live, setLive] = useState("");
  const { best, record } = useBest(BEST_KEY);
  const { entry, begin, end, submitName } = useBoardRun(
    "ollie",
    props,
    setLive,
  );

  // What the frame loop reads without restarting
  const scene = useRef({ night, reducedMotion, play });
  useEffect(() => {
    scene.current = { night, reducedMotion, play };
  }, [night, reducedMotion, play]);

  /** Draws the current frame at the canvas's size. */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // The street fills the screen's height; a narrower phone screen (3:2)
    // shows a little less of the street ahead
    const scale = canvas.height / WORLD.height;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const { night, reducedMotion } = scene.current;
    drawOllie(ctx, game.current, {
      night,
      reducedMotion,
      art: art.current,
      crashAge:
        crashAt.current === null ? null : clock.current - crashAt.current,
      ending: ending.current,
      now: clock.current,
    });
    if (scoreRef.current) {
      scoreRef.current.textContent = pad(score(game.current));
    }
  }, []);

  // The poses, then a first frame
  useEffect(() => {
    const load = (src: string, key: keyof OllieArt) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        art.current = { ...art.current, [key]: image };
        render();
      };
      image.src = src;
    };
    load(chibiFrames("skate")[0], "roll");
    load(chibiFrames("ollie")[0], "air");
    load(chibiFrames("sleeping")[0], "sleeping");
    load(chibiFrames("trophy")[0], "trophy");
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

  // Day and night, reduced motion: redraw the still street
  useEffect(() => {
    render();
  }, [night, reducedMotion, render]);

  const finish = useCallback(() => {
    const final = score(game.current);
    const { best, newBest } = record(final);
    ending.current = newBest ? "trophy" : "sleeping";
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

  // The frame loop, while a run is on or the fall is still playing
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
        const { play } = scene.current;
        for (const event of state.events) {
          if (event === "jump") play("hop");
          if (event === "sparkle") play("pickup");
          if (event === "milestone") play("milestone");
        }
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
  }, [screen, render, finish]);

  const jump = useCallback(() => {
    const state = game.current;
    if (state.phase === "over") return;
    inputs.current.push({ step: state.steps, press: true });
    const before = state.events.length;
    press(state);
    if (state.events.slice(before).includes("jump")) scene.current.play("hop");
  }, []);

  /** The jump button comes up, recorded like the presses. */
  const letGo = useCallback(() => {
    const state = game.current;
    if (state.phase === "over") return;
    inputs.current.push({ step: state.steps, press: false });
    release(state);
  }, []);

  const start = useCallback(
    (fromButton = false) => {
      // The run the server handed out, or one off the board
      game.current = createOllie(begin() ?? newSeed());
      inputs.current = [];
      crashAt.current = null;
      ending.current = null;
      jump();
      // A press of the button or a key is a hop; a held key or finger flies
      if (fromButton) letGo();
      setResult(null);
      setScreen("running");
      setLive(t("cabinets.ollie.started"));
      screenRef.current?.focus({ preventScroll: true });
    },
    [jump, letGo, begin, t],
  );

  const pause = useCallback(() => {
    letGo();
    setScreen("paused");
    setLive(t("pausedLive"));
    scene.current.play("toggleOff");
  }, [letGo, t]);

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
    if (!JUMP_KEYS.has(event.code) && event.code !== "Enter") return;
    event.preventDefault();
    if (event.repeat) return;
    if (screen === "running") jump();
    else if (screen === "ready") start();
    else if (screen === "paused") resume();
    else if (screen === "over" && canRetry()) start();
  };

  const onKeyUp = (event: React.KeyboardEvent) => {
    if (JUMP_KEYS.has(event.code) || event.code === "Enter") letGo();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    if (screen === "running") {
      event.preventDefault();
      jump();
    } else if (screen === "ready") {
      event.preventDefault();
      start();
    }
  };

  const onPointerUp = () => {
    if (game.current.player.holding) letGo();
  };

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <Marquee cabinet="ollie" best={best} />

      {/* The screen */}
      <div
        ref={screenRef}
        role="application"
        tabIndex={0}
        aria-label={t("cabinets.ollie.name")}
        aria-describedby={`${descriptionId} ${hintId}`}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
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
        {/* Score, as the street's own ink */}
        <ScreenScore
          ref={scoreRef}
          best={best}
          hidden={screen === "ready" || screen === "over"}
          ink={night ? "text-[#f6f3ea]" : "text-[#10131f]"}
        />
        <ScreenCards
          screen={screen}
          best={best}
          result={result}
          entry={entry}
          onPlay={() => start(true)}
          onResume={resume}
        />
      </div>

      <NameEntry
        entry={entry}
        onSubmit={submitName}
        reducedMotion={reducedMotion}
      />

      <Deck
        cabinet="ollie"
        hintId={hintId}
        screen={screen}
        onPause={pause}
        onResume={resume}
      />

      <span id={descriptionId} className="sr-only">
        {t("cabinets.ollie.game")}
      </span>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </div>
  );
}
