"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Candy,
  Coffee,
  HandPlatter,
  Keyboard,
  MousePointerClick,
  Play,
  RotateCcw,
  ShieldCheck,
  Timer,
  Trophy,
} from "lucide-react";

import {
  type CabinetScreen,
  Deck,
  HowToPlay,
  Marquee,
  NameEntry,
  type Rule,
  ScreenCard,
} from "@/components/arcade/CabinetParts";
import type { ScreenProps } from "@/components/arcade/screen";
import {
  type Entry,
  useBest,
  useBoardRun,
} from "@/components/arcade/use-board-run";
import { useParisNight } from "@/components/chibi/use-paris-night";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import { unlockTrophy } from "@/components/trophies/trophy-store";
import { TypographyData, TypographyTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/arcade/board";
import {
  act,
  type CafeAction,
  type CafeEvent,
  type CafeInput,
  type CafeState,
  CELLS,
  colOf,
  COLS,
  createCafe,
  cupsLeft,
  elapsed,
  MIN_INPUT_GAP,
  rowOf,
  ROWS,
  score,
} from "@/lib/arcade/cafe";
import { chibiFrames } from "@/lib/chibi";
import { cn } from "@/lib/utils";

import {
  type CafeArt,
  cellAt,
  drawCafe,
  type Layout,
  layoutFor,
  type Reaction,
  SPILL_LIFE,
  TALL,
  WAVE_DELAY,
} from "./draw";

const BEST_KEY = "imjustlucas:arcade:cafe:best";
/** A press held this long on a touch screen puts a sugar down. */
const LONG_PRESS = 0.4;
/** A finger moving further than this (px) is scrolling, not pressing. */
const PRESS_SLOP = 10;
/** The result card waits for the coffee to run, or the cups to be served. */
const CARD_AFTER_SPILL = SPILL_LIFE + 0.2;
const CARD_AFTER_CLEAR = 0.8;
/** A key held through the end does not start the next run at once. */
const RETRY_GUARD_MS = 450;
/** Frames run this long once a run is over: the stars, the coffee. */
const OVER_SECONDS = 3;

const newSeed = () => Math.floor(Math.random() * 2 ** 31);
const CENTRE = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);

/** The run's own clock, in seconds, stopped while paused. */
type RunClock = { readonly elapsed: number; readonly since: number | null };

const seconds = (run: RunClock) =>
  run.elapsed + (run.since === null ? 0 : performance.now() / 1000 - run.since);
const stopped = (run: RunClock): RunClock => ({
  elapsed: seconds(run),
  since: null,
});
/** The hundredth the run has reached: where an input lands. */
const stepOf = (run: RunClock) => Math.floor(seconds(run) * 100);

type CafeResult = {
  readonly won: boolean;
  readonly time: number;
  readonly best: number | null;
  readonly newBest: boolean;
};

/** A long press under way on a touch screen. */
type Press = {
  readonly id: number;
  readonly cell: number;
  readonly x: number;
  readonly y: number;
  /** On the scene's clock. */
  readonly at: number;
  fired: boolean;
  /** A mouse press, turned on release. */
  readonly mouse: boolean;
};

/**
 * The Café cabinet (DESIGN.md, Arcade): the marquee, the screen where the
 * terrace is drawn on a canvas, and the deck with the petit café. The game
 * itself is the plain `lib/arcade/cafe.ts`; this component feeds it the
 * visitor's clicks, taps and keys with the hundredth they landed on, plays
 * what they did as the sound kit's cues and draws it. Each run is one the
 * server handed out: its inputs are recorded, and a cleared table that
 * makes the leaderboard is sent back to be replayed there.
 */
export default function CafeGame(props: ScreenProps) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const night = useParisNight();
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const descriptionId = useId();

  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const cupsRef = useRef<HTMLSpanElement>(null);
  const game = useRef<CafeState>(createCafe(newSeed()));
  const inputs = useRef<CafeInput[]>([]);
  const art = useRef<CafeArt>({ coffee: null, trophy: null });
  const layout = useRef<Layout>(TALL);
  const font = useRef("sans-serif");
  const clock = useRef(0);
  const runClock = useRef<RunClock>({ elapsed: 0, since: null });
  const openedAt = useRef(new Float64Array(CELLS).fill(Infinity));
  const sugarAt = useRef(new Float64Array(CELLS).fill(-Infinity));
  const spill = useRef<{ cell: number; at: number } | null>(null);
  const clearedAt = useRef<number | null>(null);
  const reaction = useRef<Reaction | null>(null);
  const cursor = useRef(CENTRE);
  const keysLead = useRef(false);
  const hover = useRef<number | null>(null);
  const press = useRef<Press | null>(null);
  const endedAt = useRef<number | null>(null);
  const bestPose = useRef(false);
  /** Counts the runs, so a late result card never lands on the next one. */
  const runs = useRef(0);

  const [screen, setScreen] = useState<CabinetScreen>("ready");
  const screenNow = useRef<CabinetScreen>("ready");
  const [result, setResult] = useState<CafeResult | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [live, setLive] = useState("");
  const { best, record } = useBest(BEST_KEY, "lowest");
  const { entry, begin, end, submitName } = useBoardRun("cafe", props, setLive);

  const show = useCallback((next: CabinetScreen) => {
    screenNow.current = next;
    setScreen(next);
  }, []);

  // What the frame loop reads without restarting
  const scene = useRef({ night, reducedMotion, play });
  useEffect(() => {
    scene.current = { night, reducedMotion, play };
  }, [night, reducedMotion, play]);

  /** Draws the current frame at the canvas's size, and the clock and cups. */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const shape = layout.current;
    const scale = canvas.width / shape.world.width;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const state = game.current;
    const { night, reducedMotion } = scene.current;
    const held = press.current;
    drawCafe(ctx, state, {
      layout: shape,
      night,
      reducedMotion,
      art: art.current,
      now: clock.current,
      openedAt: openedAt.current,
      sugarAt: sugarAt.current,
      spill: spill.current,
      clearedAt: clearedAt.current,
      hidden: screenNow.current === "paused",
      cursor: keysLead.current ? cursor.current : null,
      hover: hover.current,
      pressing:
        held && !held.fired && !held.mouse
          ? {
              cell: held.cell,
              progress: Math.min((clock.current - held.at) / LONG_PRESS, 1),
            }
          : held && held.mouse && !held.fired
            ? { cell: held.cell, progress: 0 }
            : null,
      reaction: reaction.current,
      best: bestPose.current,
      font: font.current,
    });
    const running = state.phase === "running" && screenNow.current !== "over";
    if (timeRef.current) {
      timeRef.current.textContent = formatTime(
        running ? elapsed(state, stepOf(runClock.current)) : elapsed(state),
      );
    }
    if (cupsRef.current) {
      const left = state.phase === "won" ? 0 : cupsLeft(state);
      cupsRef.current.textContent = String(left).padStart(2, "0");
    }
  }, []);

  // The poses, the display font, then a first frame
  useEffect(() => {
    const load = (src: string, key: keyof CafeArt) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        art.current = { ...art.current, [key]: image };
        render();
      };
      image.src = src;
    };
    load(chibiFrames("coffee")[0], "coffee");
    load(chibiFrames("trophy")[0], "trophy");
    if (screenRef.current) {
      const display = getComputedStyle(screenRef.current)
        .getPropertyValue("--font-display")
        .trim();
      if (display) font.current = `${display}, sans-serif`;
    }
    // The font may still be on its way: draw again once it is in
    void document.fonts?.ready.then(render);
  }, [render]);

  // The canvas follows the screen's size, at the device's pixel density
  useEffect(() => {
    const element = screenRef.current;
    const canvas = canvasRef.current;
    if (!element || !canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      layout.current = layoutFor(width, height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      render();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [render]);

  // Day and night, reduced motion: draw again
  useEffect(() => {
    render();
  }, [night, reducedMotion, render]);

  // The frame loop: always while a run is on (the clock, the steam, a long
  // press), and for Lucas's idle sway before it and the end after it, but
  // never for motion alone under reduced motion
  useEffect(() => {
    if (screen === "paused") {
      render();
      return;
    }
    if (screen !== "running" && reducedMotion) {
      render();
      return;
    }
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      clock.current += Math.min((now - last) / 1000, 0.25);
      last = now;
      render();
      const ended = endedAt.current;
      if (ended === null || clock.current - ended < OVER_SECONDS) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [screen, reducedMotion, render]);

  /** Says a saucer out loud for the keyboard: where it is and what it shows. */
  const describe = useCallback(
    (cell: number) => {
      const state = game.current;
      const count = state.around[cell];
      const what = !state.open[cell]
        ? state.sugar[cell]
          ? t("cabinets.cafe.what.sugar")
          : t("cabinets.cafe.what.closed")
        : state.cups[cell]
          ? t("cabinets.cafe.what.cup")
          : count === 0
            ? t("cabinets.cafe.what.empty")
            : t("cabinets.cafe.what.number", { count });
      return t("cabinets.cafe.cell", {
        row: rowOf(cell) + 1,
        col: colOf(cell) + 1,
        what,
      });
    },
    [t],
  );

  const finish = useCallback(
    (state: CafeState) => {
      runClock.current = stopped(runClock.current);
      endedAt.current = clock.current;
      press.current = null;
      setHintOpen(false);
      const won = state.phase === "won";
      const time = elapsed(state);
      const final = score(state);
      const { play, reducedMotion } = scene.current;
      let outcome: CafeResult = { won, time, best, newBest: false };
      if (won) {
        const kept = record(final);
        outcome = { won, time, best: kept.best, newBest: kept.newBest };
        bestPose.current = kept.newBest;
        if (state.sugarsPlaced === 0) unlockTrophy("noSugar");
        play("milestone");
        if (kept.newBest)
          window.setTimeout(() => scene.current.play("unlock"), 450);
        setLive(
          kept.newBest
            ? t("cabinets.cafe.overBest", { time: formatTime(time) })
            : t("cabinets.cafe.overWon", {
                time: formatTime(time),
                best: formatTime(kept.best),
              }),
        );
      } else {
        play("miss");
        setLive(t("cabinets.cafe.overLost"));
      }
      show("over");
      const wait = reducedMotion
        ? 0
        : won
          ? CARD_AFTER_CLEAR
          : CARD_AFTER_SPILL;
      const run = runs.current;
      window.setTimeout(() => {
        if (runs.current === run) setResult(outcome);
      }, wait * 1000);
      end(final, inputs.current);
    },
    [t, record, end, best, show],
  );

  /** Plays what an input did: the steam, the sugar, the spill, the sounds. */
  const playEvents = useCallback(
    (events: ReadonlyArray<CafeEvent>) => {
      const state = game.current;
      const now = clock.current;
      const { play, reducedMotion } = scene.current;
      for (const event of events) {
        if (event.kind === "open") {
          for (const { cell, wave } of event.cells) {
            openedAt.current[cell] = reducedMotion
              ? now
              : now + wave * WAVE_DELAY;
          }
          if (event.cells.length > 1) {
            play("pickup");
            reaction.current = { kind: "hop", at: now };
          } else if (!events.some((e) => e.kind === "hint")) {
            play("press");
          }
        } else if (event.kind === "sugar") {
          sugarAt.current[event.cell] = now;
          play(event.on ? "boop" : "toggleOff");
        } else if (event.kind === "hint") {
          play("toggleOn");
          reaction.current = { kind: "sip", at: now };
          setLive(t("cabinets.cafe.hintLive"));
        } else if (event.kind === "spill") {
          spill.current = { cell: event.cell, at: now };
          reaction.current = { kind: "spill", at: now };
        } else {
          clearedAt.current = now;
          reaction.current = { kind: "cheer", at: now };
        }
      }
      setHintOpen(state.phase === "running" && !state.hinted);
      if (state.phase === "won" || state.phase === "lost") finish(state);
    },
    [finish, t],
  );

  /**
   * An input on a saucer, at the hundredth the run had reached: kept when it
   * did something. One closer than the rules allow to the last is a slip
   * (a double tap) and is dropped.
   */
  const perform = useCallback(
    (cell: number, action: CafeAction) => {
      if (screenNow.current !== "running") return false;
      const state = game.current;
      const step = stepOf(runClock.current);
      const last = inputs.current.at(-1);
      if (last && step < last.step + MIN_INPUT_GAP) return false;
      const input = { step, cell, action };
      act(state, input);
      if (state.events.length === 0) return false;
      inputs.current.push(input);
      playEvents(state.events);
      return true;
    },
    [playEvents],
  );

  const start = useCallback(() => {
    // The run the server handed out, or one off the board
    game.current = createCafe(begin() ?? newSeed());
    runs.current += 1;
    inputs.current = [];
    openedAt.current.fill(Infinity);
    sugarAt.current.fill(-Infinity);
    spill.current = null;
    clearedAt.current = null;
    reaction.current = null;
    endedAt.current = null;
    bestPose.current = false;
    press.current = null;
    cursor.current = CENTRE;
    runClock.current = { elapsed: 0, since: performance.now() / 1000 };
    setResult(null);
    setHintOpen(false);
    show("running");
    setLive(t("cabinets.cafe.started"));
    screenRef.current?.focus({ preventScroll: true });
  }, [begin, show, t]);

  const pause = useCallback(() => {
    runClock.current = stopped(runClock.current);
    press.current = null;
    show("paused");
    setLive(t("pausedLive"));
    scene.current.play("toggleOff");
  }, [show, t]);

  const resume = useCallback(() => {
    runClock.current = {
      elapsed: runClock.current.elapsed,
      since: performance.now() / 1000,
    };
    show("running");
    setLive("");
    scene.current.play("toggleOn");
    screenRef.current?.focus({ preventScroll: true });
  }, [show]);

  // A hidden tab or a window left pauses the run (and hides the table)
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

  /** The petit café, served nearest where the player is looking. */
  const petitCafe = useCallback(() => {
    perform(cursor.current, "hint");
  }, [perform]);

  const canRetry = () =>
    endedAt.current === null ||
    (clock.current - endedAt.current) * 1000 > RETRY_GUARD_MS;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const onButton = (event.target as HTMLElement).closest("button");
    if (event.code === "Escape" || event.code === "KeyP") {
      if (screen === "running") pause();
      else if (screen === "paused" && event.code === "KeyP") resume();
      return;
    }
    if (onButton) return;
    const moves: Record<string, readonly [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[event.code];
    if (move && (screen === "running" || screen === "ready")) {
      event.preventDefault();
      const row = Math.min(
        Math.max(rowOf(cursor.current) + move[0], 0),
        ROWS - 1,
      );
      const col = Math.min(
        Math.max(colOf(cursor.current) + move[1], 0),
        COLS - 1,
      );
      cursor.current = row * COLS + col;
      keysLead.current = true;
      hover.current = null;
      setLive(describe(cursor.current));
      render();
      return;
    }
    const turn = event.code === "Space" || event.code === "Enter";
    const sugar = event.code === "KeyF";
    const hint = event.code === "KeyC";
    if (!turn && !sugar && !hint) return;
    event.preventDefault();
    if (event.repeat) return;
    if (screen === "running") {
      keysLead.current = true;
      const action = turn ? "reveal" : sugar ? "sugar" : "hint";
      if (perform(cursor.current, action) && game.current.phase === "running") {
        if (action !== "hint") setLive(describe(cursor.current));
      }
      render();
    } else if (turn && screen === "ready") start();
    else if (turn && screen === "paused") resume();
    else if (turn && screen === "over" && canRetry()) start();
  };

  /** The saucer under a pointer, in the layout on screen. */
  const cellFrom = (event: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { world } = layout.current;
    const x = ((event.clientX - rect.left) / rect.width) * world.width;
    const y = ((event.clientY - rect.top) / rect.height) * world.height;
    return cellAt(layout.current, x, y);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("button")) return;
    const cell = cellFrom(event);
    if (cell === null) return;
    keysLead.current = false;
    cursor.current = cell;
    const mouse = event.pointerType === "mouse";
    if (screen !== "running" && screen !== "ready") return;
    if (mouse && event.button === 2 && screen === "running") {
      event.preventDefault();
      perform(cell, "sugar");
      return;
    }
    if (event.button !== 0) return;
    // Turned on release (a mouse dragged off cancels), or a long press
    const held: Press = {
      id: event.pointerId,
      cell,
      x: event.clientX,
      y: event.clientY,
      at: clock.current,
      fired: false,
      mouse,
    };
    press.current = held;
    if (mouse || screen !== "running") return;
    window.setTimeout(() => {
      // Still held where it was: a sugar
      if (press.current !== held) return;
      held.fired = true;
      if (perform(cell, "sugar")) navigator.vibrate?.(12);
    }, LONG_PRESS * 1000);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const held = press.current;
    if (held && held.id === event.pointerId) {
      const moved = Math.hypot(event.clientX - held.x, event.clientY - held.y);
      if (!held.mouse && moved > PRESS_SLOP) press.current = null;
      if (held.mouse && cellFrom(event) !== held.cell) press.current = null;
    }
    if (event.pointerType === "mouse") {
      const cell = cellFrom(event);
      if (cell !== hover.current) {
        hover.current = cell;
        if (cell !== null) keysLead.current = false;
        if (screen !== "running" || reducedMotion) render();
      }
    }
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const held = press.current;
    press.current = null;
    if (!held || held.id !== event.pointerId || held.fired) return;
    if (cellFrom(event) !== held.cell) return;
    // A saucer turned on the table waiting for Play starts the run with it
    if (screen === "ready") start();
    cursor.current = held.cell;
    perform(held.cell, "reveal");
  };

  const rich = (key: Parameters<typeof t.rich>[0]) =>
    t.rich(key, { b: (chunks) => <b>{chunks}</b> });
  const rules: ReadonlyArray<Rule> = [
    {
      id: "turn",
      icon: MousePointerClick,
      text: rich("cabinets.cafe.rules.turn"),
      touch: rich("cabinets.cafe.rules.turnTouch"),
    },
    { id: "numbers", icon: Coffee, text: rich("cabinets.cafe.rules.numbers") },
    {
      id: "sugar",
      icon: Candy,
      text: rich("cabinets.cafe.rules.sugar"),
      touch: rich("cabinets.cafe.rules.sugarTouch"),
    },
    {
      id: "serve",
      icon: HandPlatter,
      text: rich("cabinets.cafe.rules.serve"),
      touch: rich("cabinets.cafe.rules.serveTouch"),
    },
    { id: "hint", icon: Coffee, text: rich("cabinets.cafe.rules.hint") },
    { id: "keys", icon: Keyboard, text: rich("cabinets.cafe.rules.keys") },
    { id: "fair", icon: ShieldCheck, text: rich("cabinets.cafe.rules.fair") },
    { id: "time", icon: Timer, text: rich("cabinets.cafe.rules.time") },
  ];

  const ink = night ? "text-[#f6f3ea]" : "text-[#10131f]";

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <Marquee cabinet="cafe" best={best} format={formatTime} empty="-:--.--" />

      {/* The screen */}
      <div
        ref={screenRef}
        role="application"
        tabIndex={0}
        aria-label={t("cabinets.cafe.name")}
        aria-describedby={`${descriptionId} ${hintId}`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (press.current = null)}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          hover.current = null;
          render();
        }}
        onContextMenu={(event) => event.preventDefault()}
        className="relative aspect-[4/5] touch-manipulation select-none overflow-hidden rounded-md bg-ground outline-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-ink sm:aspect-[4/3]"
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
        {/* The cups left and the clock, in the terrace's own ink */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 top-2 flex items-center gap-3 font-mono text-data tabular-nums sm:left-4 sm:right-auto sm:top-3",
            ink,
          )}
        >
          <span className="flex items-center gap-1">
            <Coffee className="size-4" />
            <span ref={cupsRef}>10</span>
          </span>
          <span className="flex items-center gap-1">
            <Timer className="size-4" />
            <span ref={timeRef}>0:00.00</span>
          </span>
        </span>
        <CafeCards
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
        cabinet="cafe"
        hintId={hintId}
        screen={screen}
        onPause={pause}
        onResume={resume}
      >
        <Button
          className="shrink-0 sm:ml-auto"
          disabled={!hintOpen || screen !== "running"}
          aria-label={t("cabinets.cafe.petitCafeLabel")}
          title={t("cabinets.cafe.petitCafeLabel")}
          onClick={petitCafe}
        >
          <Coffee aria-hidden />
          {t("cabinets.cafe.petitCafe")}
          <span aria-hidden className="text-ink-muted">
            +10s
          </span>
        </Button>
      </Deck>

      <HowToPlay rules={rules} />

      <span id={descriptionId} className="sr-only">
        {t("cabinets.cafe.game")}
      </span>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </div>
  );
}

/** The cards over the table while no run is on: ready, paused, over. */
function CafeCards({
  screen,
  best,
  result,
  entry,
  onPlay,
  onResume,
}: {
  screen: CabinetScreen;
  best: number | null;
  result: CafeResult | null;
  entry: Entry;
  onPlay: () => void;
  onResume: () => void;
}) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const asking = entry.kind === "asking" || entry.kind === "sending";
  // Over the table: on a phone it fills the screen under Lucas
  const place = "max-sm:left-0 max-sm:top-[21%]";

  if (screen === "ready") {
    return (
      <ScreenCard bare className={place}>
        <TypographyData className="hidden text-ink-muted sm:block">
          {best === null ? (
            t("firstRun")
          ) : (
            <>
              {t("best")} <span className="text-ink">{formatTime(best)}</span>
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
          {!result.won
            ? t("cabinets.cafe.spilled")
            : result.newBest
              ? t("newBest")
              : t("cabinets.cafe.cleared")}
        </TypographyTitle>
        {(result.won || result.best !== null) && (
          <TypographyData className="whitespace-nowrap text-ink-muted">
            {result.won && (
              <>
                {t("cabinets.cafe.time")}{" "}
                <span className="text-ink">{formatTime(result.time)}</span>
                {"  "}
              </>
            )}
            {result.best !== null && (
              <>
                {t("best")}{" "}
                <span className="text-ink">{formatTime(result.best)}</span>
              </>
            )}
          </TypographyData>
        )}
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
