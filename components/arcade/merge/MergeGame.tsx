"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  Gem,
  GitMerge,
  GitPullRequestClosed,
  Hash,
  Keyboard,
  Layers,
  Move as MoveIcon,
  Rocket,
  SquarePlus,
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
import type { ScreenProps } from "@/components/arcade/screen";
import { useBest, useBoardRun } from "@/components/arcade/use-board-run";
import { useParisNight } from "@/components/chibi/use-paris-night";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import { unlockTrophy } from "@/components/trophies/trophy-store";
import { TypographyData } from "@/components/typography";
import {
  act,
  createMerge,
  type MergeEvent,
  type MergeInput,
  type MergeState,
  MIN_INPUT_GAP,
  type Move,
  score,
  SIZE,
} from "@/lib/arcade/merge";
import { chibiFrames } from "@/lib/chibi";
import { cn } from "@/lib/utils";

import {
  drawMerge,
  type DrawnTile,
  type Layout,
  layoutFor,
  type MergeArt,
  type MergedPopup,
  type Reaction,
  SLIDE,
  TALL,
} from "./draw";

const BEST_KEY = "imjustlucas:arcade:merge:best";
/** A pointer moving this far (px) before it lifts is a swipe. */
const SWIPE = 24;
/** The result card waits for the last move and Lucas's slump. */
const CARD_AFTER = 0.9;
/** A key held through the end does not start the next run at once. */
const RETRY_GUARD_MS = 450;
/** Frames run this long once a run is over. */
const OVER_SECONDS = 3;
/** A merge this big or more makes Lucas hop and says "merged". */
const BIG_MERGE = 128;
const MERGED_FROM = 64;
/** A new top tile this big or more plays the milestone and is announced. */
const MILESTONE_FROM = 128;

/** The keys that move: the arrows and WASD. */
const KEYS: Readonly<Record<string, Move>> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

/** The tiles' names in the dictionaries, from 2 to 1024; then versions. */
const TIERS = [
  "typo",
  "commit",
  "branch",
  "pr",
  "review",
  "feature",
  "hotfix",
  "sprint",
  "milestone",
  "rc",
] as const;

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/** The run's own clock, in seconds, stopped while paused. */
type RunClock = { readonly elapsed: number; readonly since: number | null };

const seconds = (run: RunClock) =>
  run.elapsed + (run.since === null ? 0 : performance.now() / 1000 - run.since);
const stopped = (run: RunClock): RunClock => ({
  elapsed: seconds(run),
  since: null,
});
/** The hundredth the run has reached: where a move lands. */
const stepOf = (run: RunClock) => Math.floor(seconds(run) * 100);

/** A run's tiles as drawn from the start: there already, or landing now. */
const tilesOf = (state: MergeState, bornAt: number) =>
  new Map<number, DrawnTile>(
    state.values.flatMap((value, cell) =>
      value === 0
        ? []
        : [
            [
              state.ids[cell],
              {
                id: state.ids[cell],
                value,
                from: cell,
                to: cell,
                movedAt: -Infinity,
                bornAt,
                born: "spawn",
                merging: false,
              },
            ],
          ],
    ),
  );

/**
 * The Merge cabinet (DESIGN.md, Arcade): the marquee, the screen where
 * Lucas codes beside the editor drawn on a canvas, and the deck. The game
 * itself is the plain `lib/arcade/merge.ts`; this component feeds it the
 * visitor's keys and swipes with the hundredth they landed on, plays what
 * they did as the sound kit's cues and draws it. Each run is one the server
 * handed out: its moves are recorded, and a run that makes the leaderboard
 * is sent back to be replayed there.
 */
export default function MergeGame(props: ScreenProps) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const night = useParisNight();
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const descriptionId = useId();

  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const game = useRef<MergeState>(createMerge(newSeed()));
  const inputs = useRef<MergeInput[]>([]);
  /** The tiles as drawn, by id: the board waiting for Play fills in on mount. */
  const drawn = useRef(new Map<number, DrawnTile>());
  const popups = useRef<MergedPopup[]>([]);
  const art = useRef<MergeArt>({ coding: null, trophy: null });
  const layout = useRef<Layout>(TALL);
  const font = useRef({ display: "sans-serif", data: "monospace" });
  const clock = useRef(0);
  const runClock = useRef<RunClock>({ elapsed: 0, since: null });
  const reaction = useRef<Reaction | null>(null);
  const shippedAt = useRef<number | null>(null);
  const endedAt = useRef<number | null>(null);
  const bestPose = useRef(false);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  /** Counts the runs, so a late result card never lands on the next one. */
  const runs = useRef(0);

  const [screen, setScreen] = useState<CabinetScreen>("ready");
  const screenNow = useRef<CabinetScreen>("ready");
  const [result, setResult] = useState<RunResult | null>(null);
  const [top, setTop] = useState(0);
  const [live, setLive] = useState("");
  const { best, record } = useBest(BEST_KEY);
  const { entry, begin, end, submitName } = useBoardRun(
    "merge",
    props,
    setLive,
  );

  const show = useCallback((next: CabinetScreen) => {
    screenNow.current = next;
    setScreen(next);
  }, []);

  /** A tile's name: "typo" to "RC", then the version it ships ("v2.0"). */
  const name = useCallback(
    (value: number) => {
      const tier = Math.round(Math.log2(value));
      return tier <= TIERS.length
        ? t(`cabinets.merge.tiers.${TIERS[tier - 1]}`)
        : `v${tier - 9}.0`;
    },
    [t],
  );

  // What the frame loop reads without restarting
  const scene = useRef({ night, reducedMotion, play, name, t });
  useEffect(() => {
    scene.current = { night, reducedMotion, play, name, t };
  }, [night, reducedMotion, play, name, t]);

  /** Draws the current frame at the canvas's size, and the score. */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const shape = layout.current;
    const scale = canvas.width / shape.world.width;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const state = game.current;
    const { night, reducedMotion, name, t } = scene.current;
    drawMerge(ctx, {
      layout: shape,
      night,
      reducedMotion,
      now: clock.current,
      tiles: drawn.current.values(),
      popups: popups.current,
      art: art.current,
      reaction: reaction.current,
      best: bestPose.current,
      shippedAt: shippedAt.current,
      endedAt: endedAt.current,
      typing: screenNow.current === "running",
      top: state.top,
      name,
      words: {
        file: t("cabinets.merge.file"),
        branch: t("cabinets.merge.branch"),
        shipped: t("cabinets.merge.shipped"),
        merged: t("cabinets.merge.merged"),
      },
      font: font.current,
    });
    if (scoreRef.current) scoreRef.current.textContent = pad(score(state));
  }, []);

  // The board waiting for Play, the poses, the display and Data fonts,
  // then a first frame
  useEffect(() => {
    drawn.current = tilesOf(game.current, -Infinity);
    const load = (src: string, key: keyof MergeArt) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        art.current = { ...art.current, [key]: image };
        render();
      };
      image.src = src;
    };
    load(chibiFrames("coding")[0], "coding");
    load(chibiFrames("trophy")[0], "trophy");
    if (screenRef.current) {
      const display = getComputedStyle(screenRef.current)
        .getPropertyValue("--font-display")
        .trim();
      if (display) font.current.display = `${display}, sans-serif`;
    }
    if (scoreRef.current) {
      font.current.data = getComputedStyle(scoreRef.current).fontFamily;
    }
    // The fonts may still be on their way: draw again once they are in
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

  // Day and night, reduced motion, the Locale's names: draw again
  useEffect(() => {
    render();
  }, [night, reducedMotion, name, render]);

  // The frame loop: while a run is on (the slides), and for Lucas's sway
  // before it and the end after it, but never for motion alone under
  // reduced motion
  useEffect(() => {
    if (screen === "paused" || (screen !== "running" && reducedMotion)) {
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

  const finish = useCallback(
    (state: MergeState) => {
      runClock.current = stopped(runClock.current);
      endedAt.current = clock.current;
      reaction.current = { kind: "slump", at: clock.current };
      const final = score(state);
      const kept = record(final);
      bestPose.current = kept.newBest;
      const { play, reducedMotion, name, t } = scene.current;
      play("miss");
      if (kept.newBest) {
        window.setTimeout(() => scene.current.play("unlock"), 450);
      }
      setLive(
        kept.newBest
          ? t("cabinets.merge.overBest", { score: final, top: name(state.top) })
          : t("cabinets.merge.overLive", {
              score: final,
              best: kept.best,
              top: name(state.top),
            }),
      );
      show("over");
      const outcome = { score: final, best: kept.best, newBest: kept.newBest };
      const run = runs.current;
      window.setTimeout(
        () => {
          if (runs.current === run) setResult(outcome);
        },
        reducedMotion ? 0 : CARD_AFTER * 1000,
      );
      end(final, inputs.current);
    },
    [record, end, show],
  );

  /** Plays what a move did: the slides, merges, new tile, the sounds. */
  const playEvents = useCallback(
    (events: ReadonlyArray<MergeEvent>, topBefore: number) => {
      const state = game.current;
      const now = clock.current;
      const { play, name, t } = scene.current;
      const tiles = drawn.current;
      // The last move's tiles settle where they went
      for (const [id, item] of tiles) {
        if (item.merging) tiles.delete(id);
        else tiles.set(id, { ...item, from: item.to });
      }
      popups.current = popups.current.filter((popup) => now - popup.at < 1);

      const mergedAt = new Set(
        events.flatMap((event) => (event.kind === "merge" ? [event.cell] : [])),
      );
      let biggest = 0;
      for (const event of events) {
        if (event.kind === "slide") {
          for (const { id, to } of event.slides) {
            const item = tiles.get(id);
            if (!item) continue;
            tiles.set(id, {
              ...item,
              to,
              movedAt: now,
              merging: mergedAt.has(to),
            });
          }
        } else if (event.kind === "merge" || event.kind === "spawn") {
          tiles.set(event.id, {
            id: event.id,
            value: event.value,
            from: event.cell,
            to: event.cell,
            movedAt: -Infinity,
            bornAt: now + SLIDE,
            born: event.kind,
            merging: false,
          });
          if (event.kind === "merge") {
            biggest = Math.max(biggest, event.value);
            if (event.value >= MERGED_FROM) {
              popups.current.push({
                cell: event.cell,
                value: event.value,
                at: now + SLIDE,
              });
            }
          }
        }
      }

      const shipped = events.some((event) => event.kind === "shipped");
      if (shipped) {
        shippedAt.current = now + SLIDE;
        reaction.current = { kind: "cheer", at: now + SLIDE };
        unlockTrophy("shipped");
        play("unlock");
        setLive(t("cabinets.merge.shippedLive"));
      } else if (state.top > topBefore && state.top >= MILESTONE_FROM) {
        reaction.current = { kind: "hop", at: now + SLIDE };
        play("milestone");
        setLive(
          t("cabinets.merge.topLive", {
            value: state.top,
            name: name(state.top),
          }),
        );
      } else if (biggest > 0) {
        if (biggest >= BIG_MERGE) {
          reaction.current = { kind: "hop", at: now + SLIDE };
        }
        play("boop");
      } else {
        play("tick");
      }
      setTop(state.top);
      if (state.phase === "over") finish(state);
    },
    [finish],
  );

  /**
   * A move, at the hundredth the run had reached: kept when it moved
   * something. One closer than the rules allow to the last (a key held
   * down repeats faster) is dropped.
   */
  const perform = useCallback(
    (move: Move) => {
      if (screenNow.current !== "running") return false;
      const state = game.current;
      const step = stepOf(runClock.current);
      const last = inputs.current.at(-1);
      if (last && step < last.step + MIN_INPUT_GAP) return false;
      const input = { step, move };
      const topBefore = state.top;
      act(state, input);
      if (state.events.length === 0) return false;
      inputs.current.push(input);
      playEvents(state.events, topBefore);
      render();
      return true;
    },
    [playEvents, render],
  );

  const start = useCallback(() => {
    // The run the server handed out, or one off the board
    game.current = createMerge(begin() ?? newSeed());
    runs.current += 1;
    inputs.current = [];
    drawn.current = tilesOf(game.current, clock.current);
    popups.current = [];
    reaction.current = null;
    shippedAt.current = null;
    endedAt.current = null;
    bestPose.current = false;
    runClock.current = { elapsed: 0, since: performance.now() / 1000 };
    setResult(null);
    setTop(game.current.top);
    show("running");
    setLive(t("cabinets.merge.started"));
    screenRef.current?.focus({ preventScroll: true });
  }, [begin, show, t]);

  const pause = useCallback(() => {
    runClock.current = stopped(runClock.current);
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

  /** Says the board out loud, row by row. */
  const readBoard = () => {
    const { values } = game.current;
    const rows = Array.from({ length: SIZE }, (_, row) =>
      t("cabinets.merge.row", {
        row: row + 1,
        cells: values
          .slice(row * SIZE, row * SIZE + SIZE)
          .map((value) =>
            value === 0 ? t("cabinets.merge.emptyCell") : String(value),
          )
          .join(", "),
      }),
    );
    setLive(rows.join(". "));
  };

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
    const move = KEYS[event.code];
    if (move) {
      event.preventDefault();
      // A move on the board waiting for Play starts the run with it
      if (screen === "ready" && !event.repeat) start();
      perform(move);
      return;
    }
    if (event.code === "KeyR" && screen !== "ready") {
      readBoard();
      return;
    }
    if (event.code !== "Space" && event.code !== "Enter") return;
    event.preventDefault();
    if (event.repeat) return;
    if (screen === "ready") start();
    else if (screen === "paused") resume();
    else if (screen === "over" && canRetry()) start();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (screen !== "running" && screen !== "ready") return;
    swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const from = swipe.current;
    swipe.current = null;
    if (!from || from.id !== event.pointerId) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return;
    const move: Move =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    if (screen === "ready") start();
    perform(move);
  };

  const rich = (key: Parameters<typeof t.rich>[0]) =>
    t.rich(key, { b: (chunks) => <b>{chunks}</b> });
  const rules: ReadonlyArray<Rule> = [
    {
      id: "move",
      icon: MoveIcon,
      text: rich("cabinets.merge.rules.move"),
      touch: rich("cabinets.merge.rules.moveTouch"),
    },
    { id: "merge", icon: GitMerge, text: rich("cabinets.merge.rules.merge") },
    { id: "ladder", icon: Layers, text: rich("cabinets.merge.rules.ladder") },
    { id: "rarity", icon: Gem, text: rich("cabinets.merge.rules.rarity") },
    { id: "spawn", icon: SquarePlus, text: rich("cabinets.merge.rules.spawn") },
    { id: "score", icon: Hash, text: rich("cabinets.merge.rules.score") },
    { id: "ship", icon: Rocket, text: rich("cabinets.merge.rules.ship") },
    {
      id: "conflict",
      icon: GitPullRequestClosed,
      text: rich("cabinets.merge.rules.conflict"),
    },
    { id: "keys", icon: Keyboard, text: rich("cabinets.merge.rules.keys") },
  ];

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      <Marquee cabinet="merge" best={best} />

      {/* The screen */}
      <div
        ref={screenRef}
        role="application"
        tabIndex={0}
        aria-label={t("cabinets.merge.name")}
        aria-describedby={`${descriptionId} ${hintId}`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        // A swipe on the board moves the tiles, not the page, while a run is on
        className={cn(
          "relative aspect-[4/5] select-none overflow-hidden rounded-md bg-ground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-ink sm:aspect-[4/3]",
          screen === "running" ? "touch-none" : "touch-manipulation",
        )}
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
        {/* Score, in the editor's own ink */}
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
          onPlay={start}
          onResume={resume}
          overTitle={t("cabinets.merge.over")}
          extra={
            top > 0 && (
              <TypographyData className="whitespace-nowrap text-ink-muted">
                {t("cabinets.merge.top")}{" "}
                <span className="text-ink">
                  {name(top)} · {top}
                </span>
              </TypographyData>
            )
          }
          // Over the board: on a phone it fills the screen under Lucas
          place="max-sm:left-0 max-sm:top-[23%]"
        />
      </div>

      <NameEntry
        entry={entry}
        onSubmit={submitName}
        reducedMotion={reducedMotion}
      />

      <Deck
        cabinet="merge"
        hintId={hintId}
        screen={screen}
        onPause={pause}
        onResume={resume}
      />

      <HowToPlay rules={rules} />

      <span id={descriptionId} className="sr-only">
        {t("cabinets.merge.game")}
      </span>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </div>
  );
}
