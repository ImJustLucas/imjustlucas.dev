"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { Hand, Keyboard, Pause, Play, RotateCcw, Trophy } from "lucide-react";

import { startRunAction, submitRunAction } from "@/app/[locale]/arcade/actions";
import type { ScreenProps } from "@/components/arcade/screen";
import { useParisNight } from "@/components/chibi/use-paris-night";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useSounds } from "@/components/sound/SoundProvider";
import {
  TypographyData,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { wouldRank } from "@/lib/arcade/board";
import {
  advance,
  bestOf,
  createOllie,
  type OllieInput,
  type OllieState,
  parseBest,
  press,
  release,
  score,
  WORLD,
} from "@/lib/arcade/ollie";
import {
  NAME_MAX_LENGTH,
  type NameProblem,
  parseName,
} from "@/lib/arcade/player-name";
import { chibiFrames } from "@/lib/chibi";
import { cn } from "@/lib/utils";

import {
  drawOllie,
  END_POSE_AT,
  type OllieArt,
  type OllieEnding,
} from "./draw";

type Screen = "ready" | "running" | "paused" | "over";
type Result = { score: number; best: number; newBest: boolean };

/** Where a finished run stands with the leaderboard. */
type Entry =
  | { readonly kind: "none" }
  | { readonly kind: "asking"; readonly problem?: NameProblem }
  | { readonly kind: "sending" }
  | { readonly kind: "ranked"; readonly rank: number }
  | { readonly kind: "missed" };

/** A run handed out by the server, and the presses made in it. */
type Run = { readonly runId: string; readonly seed: number };
type FinishedRun = Run & { readonly inputs: ReadonlyArray<OllieInput> };

/** The Admin's field, so typing a name feels like the rest of the client. */
const INPUT =
  "h-11 w-full min-w-0 rounded-md border-2 border-seam bg-ground px-3 text-base text-ink transition-colors duration-hover ease-out placeholder:text-ink-muted/75 hover:border-ink-muted/40 aria-[invalid=true]:border-busy-ink";

const BEST_KEY = "imjustlucas:arcade:ollie:best";
/** Frames run this long after the crash: the fall, then the end pose. */
const CRASH_SECONDS = END_POSE_AT + 0.1;
/** A key held through the crash does not start the next run at once. */
const RETRY_GUARD_MS = 450;
const JUMP_KEYS = new Set(["Space", "ArrowUp", "KeyW"]);

const readBest = () => {
  try {
    return parseBest(window.localStorage.getItem(BEST_KEY));
  } catch {
    return null;
  }
};

const writeBest = (best: number) => {
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Storage refused: the best holds for this visit only
  }
};

const newSeed = () => Math.floor(Math.random() * 2 ** 31);
const pad = (value: number) => String(value).padStart(5, "0");

/**
 * The Ollie cabinet (DESIGN.md, Arcade): the marquee, the screen where the
 * street is drawn on a canvas, and the deck. The game itself is the plain
 * `lib/arcade/ollie.ts`; this component feeds it the visitor's presses and
 * the frames, plays its events as the sound kit's cues and draws it. Each run
 * is one the server handed out: its presses are recorded, and a run that
 * makes the leaderboard is sent back to be replayed there.
 */
export default function OllieGame({
  board,
  player,
  onBoard,
  remember,
}: ScreenProps) {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const night = useParisNight();
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const descriptionId = useId();
  const nameId = useId();
  const nameHintId = useId();

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
  const nextRun = useRef<Run | null>(null);
  const activeRun = useRef<Run | null>(null);
  const finished = useRef<FinishedRun | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const entryRef = useRef<HTMLFormElement>(null);

  const [screen, setScreen] = useState<Screen>("ready");
  const [best, setBest] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [live, setLive] = useState("");
  const [entry, setEntry] = useState<Entry>({ kind: "none" });

  // What the frame loop reads without restarting
  const scene = useRef({ night, reducedMotion, play, best, board, player });
  useEffect(() => {
    scene.current = { night, reducedMotion, play, best, board, player };
  }, [night, reducedMotion, play, best, board, player]);

  /** Asks the server for the next run, ready before Play is pressed. */
  const fetchRun = useCallback(() => {
    startRunAction("ollie")
      .then((run) => {
        if (run.kind === "started") nextRun.current = run;
      })
      .catch(() => {
        // Offline or resting: the next run plays off the board
      });
  }, []);

  useEffect(fetchRun, [fetchRun]);

  useEffect(() => {
    const check = () => setBest(readBest());
    check();
  }, []);

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

  /** Sends the finished run under `name`, and shows where it landed. */
  const send = useCallback(
    (name: string) => {
      const run = finished.current;
      const id = scene.current.player?.id;
      if (!run || !id) return;
      setEntry({ kind: "sending" });
      submitRunAction({
        runId: run.runId,
        playerId: id,
        name,
        inputs: run.inputs,
      })
        .then((sent) => {
          if (sent.kind === "ranked" || sent.kind === "unranked") {
            finished.current = null;
            onBoard(sent.top);
          }
          if (sent.kind === "ranked") {
            setEntry({ kind: "ranked", rank: sent.rank });
            setLive(t("entry.rankedLive", { rank: sent.rank }));
            scene.current.play("toggleOn");
          } else if (sent.kind === "bad-name") {
            setEntry({ kind: "asking", problem: "blocked" });
          } else {
            setEntry({ kind: "missed" });
          }
        })
        .catch(() => setEntry({ kind: "missed" }));
    },
    [onBoard, t],
  );

  const finish = useCallback(() => {
    const final = score(game.current);
    const stored = scene.current.best;
    const newBest = final > 0 && final > (stored ?? 0);
    const next = bestOf(stored, final);
    if (newBest) writeBest(next);
    ending.current = newBest ? "trophy" : "sleeping";
    setBest(next);
    setResult({ score: final, best: next, newBest });
    setScreen("over");
    setLive(
      newBest
        ? t("overBest", { score: final })
        : t("over", { score: final, best: next }),
    );
    const { play } = scene.current;
    play("miss");
    if (newBest) window.setTimeout(() => scene.current.play("unlock"), 450);

    // A run good enough for the board goes back to the server, under the
    // player's name, asked for the first time
    const run = activeRun.current;
    activeRun.current = null;
    const { board, player } = scene.current;
    if (
      run &&
      player &&
      board?.kind === "board" &&
      wouldRank(board.top, player.id, final)
    ) {
      finished.current = { ...run, inputs: inputs.current };
      if (player.name) send(player.name);
      else setEntry({ kind: "asking" });
    }
  }, [t, send]);

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
      const run = nextRun.current;
      nextRun.current = null;
      activeRun.current = run;
      game.current = createOllie(run?.seed ?? newSeed());
      inputs.current = [];
      crashAt.current = null;
      ending.current = null;
      fetchRun();
      jump();
      // A press of the button or a key is a hop; a held key or finger flies
      if (fromButton) letGo();
      setResult(null);
      setEntry({ kind: "none" });
      setScreen("running");
      setLive(t("started"));
      screenRef.current?.focus({ preventScroll: true });
    },
    [jump, letGo, fetchRun, t],
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

  const submitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseName(nameRef.current?.value ?? "");
    if (!parsed.ok) {
      setEntry({ kind: "asking", problem: parsed.problem });
      nameRef.current?.focus();
      return;
    }
    remember(parsed.name);
    send(parsed.name);
  };

  const asking = entry.kind === "asking" || entry.kind === "sending";

  // On a keyboard, typing goes straight to the name,
  const askingFirst = entry.kind === "asking" && !entry.problem;
  // and on a phone, the strip scrolls into view under the screen
  useEffect(() => {
    if (!askingFirst) return;
    entryRef.current?.scrollIntoView({
      block: "nearest",
      behavior: scene.current.reducedMotion ? "auto" : "smooth",
    });
    if (window.matchMedia("(pointer: fine)").matches) {
      nameRef.current?.focus({ preventScroll: true });
    }
  }, [askingFirst]);

  return (
    <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-3 sm:gap-4 sm:p-4">
      {/* The marquee */}
      <div className="flex items-baseline justify-between gap-4 px-1">
        <TypographyTitle as="h2" className="text-[1.375rem]">
          {t("cabinets.ollie.name")}
        </TypographyTitle>
        <TypographyData className="text-ink-muted">
          {t("best")}{" "}
          <span className="text-ink">
            {best === null ? "-----" : pad(best)}
          </span>
        </TypographyData>
      </div>

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
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3 top-2 font-mono text-data tabular-nums sm:right-4 sm:top-3",
            night ? "text-[#f6f3ea]" : "text-[#10131f]",
            // The cards carry the score when the street stands still
            (screen === "ready" || screen === "over") && "opacity-0",
          )}
        >
          {best !== null && (
            <span className="opacity-60">
              {t("best")} {pad(best)}{" "}
            </span>
          )}
          <span ref={scoreRef}>00000</span>
        </span>

        {screen === "ready" && (
          <ScreenCard bare>
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
                start(true);
              }}
            >
              <Play aria-hidden />
              {t("play")}
            </Button>
          </ScreenCard>
        )}

        {screen === "paused" && (
          <ScreenCard>
            <TypographyTitle as="p">{t("paused")}</TypographyTitle>
            <Button
              variant="play"
              className="sm:h-[52px] sm:px-6"
              onClick={resume}
            >
              <Play aria-hidden />
              {t("resume")}
            </Button>
          </ScreenCard>
        )}

        {screen === "over" && result && (
          <ScreenCard>
            <div className="flex flex-col items-center gap-1">
              <TypographyTitle as="p">
                {result.newBest ? t("newBest") : t("gameOver")}
              </TypographyTitle>
              <TypographyData className="whitespace-nowrap text-ink-muted">
                {t("score")}{" "}
                <span className="text-ink">{pad(result.score)}</span>
                {"  "}
                {t("best")} <span className="text-ink">{pad(result.best)}</span>
              </TypographyData>
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
                start(true);
              }}
            >
              <RotateCcw aria-hidden />
              {t("playAgain")}
            </Button>
          </ScreenCard>
        )}
      </div>

      {/* A run for the board: the first name, asked once */}
      {asking && (
        <form
          ref={entryRef}
          onSubmit={submitName}
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
                aria-invalid={entry.kind === "asking" && !!entry.problem}
                aria-describedby={nameHintId}
                className={INPUT}
              />
            </div>
            <Button
              type="submit"
              variant="play"
              disabled={entry.kind === "sending"}
              className="shrink-0"
            >
              {entry.kind === "sending"
                ? t("entry.sending")
                : t("entry.submit")}
            </Button>
          </div>
          <span
            id={nameHintId}
            role={
              entry.kind === "asking" && entry.problem ? "alert" : undefined
            }
            className={cn(
              "text-label",
              entry.kind === "asking" && entry.problem
                ? "text-busy-ink"
                : "text-ink-muted",
            )}
          >
            {entry.kind === "asking" && entry.problem
              ? t(`entry.problems.${entry.problem}`)
              : t("entry.hint")}
          </span>
        </form>
      )}

      {/* The deck */}
      <div className="flex items-center gap-x-4 gap-y-3 sm:px-1">
        <TypographyMuted className="flex items-center gap-2">
          <span id={hintId} className="contents">
            <Keyboard
              aria-hidden
              className="size-4 shrink-0 [@media(pointer:coarse)]:hidden"
            />
            <Hand
              aria-hidden
              className="hidden size-4 shrink-0 [@media(pointer:coarse)]:inline"
            />
            <span className="[@media(pointer:coarse)]:hidden">{t("hint")}</span>
            <span className="hidden [@media(pointer:coarse)]:inline">
              {t("hintTouch")}
            </span>
          </span>
        </TypographyMuted>
        <Button
          className="ml-auto shrink-0"
          disabled={screen !== "running" && screen !== "paused"}
          onClick={screen === "paused" ? resume : pause}
        >
          {screen === "paused" ? <Play aria-hidden /> : <Pause aria-hidden />}
          {screen === "paused" ? t("resume") : t("pause")}
        </Button>
      </div>

      <span id={descriptionId} className="sr-only">
        {t("game")}
      </span>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
    </div>
  );
}

/** A card over the street: the client's window on the game's screen. */
function ScreenCard({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  /** On phones, the button stands alone on the street, with no card. */
  bare?: boolean;
}) {
  return (
    // Clear of Lucas, who rides in the left quarter of the street
    <div className="absolute inset-y-0 left-[27%] right-0 flex items-center justify-center p-3">
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
