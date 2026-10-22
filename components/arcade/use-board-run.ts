"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { startRunAction, submitRunAction } from "@/app/[locale]/arcade/actions";
import type { ScreenProps } from "@/components/arcade/screen";
import { useSounds } from "@/components/sound/SoundProvider";
import { unlockTrophy } from "@/components/trophies/trophy-store";
import { type LeaderboardGame, wouldRank } from "@/lib/arcade/board";
import { type NameProblem, parseName } from "@/lib/arcade/player-name";
import { bestOf, parseBest } from "@/lib/arcade/run";

/** Where a finished run stands with the leaderboard. */
export type Entry =
  | { readonly kind: "none" }
  | { readonly kind: "asking"; readonly problem?: NameProblem }
  | { readonly kind: "sending" }
  | { readonly kind: "ranked"; readonly rank: number }
  | { readonly kind: "missed" };

/** A press or release, at the step the run had reached. */
type Input = { readonly step: number; readonly press: boolean };

/** A run handed out by the server, and the inputs made in it. */
type Run = { readonly runId: string; readonly seed: number };
type FinishedRun = Run & { readonly inputs: ReadonlyArray<Input> };

/**
 * A cabinet's runs and the leaderboard (docs/arcade.md): each run is one
 * the server handed out, fetched before Play is pressed; a finished run good
 * enough for the board goes back with its inputs under the player's first
 * name, asked for the first time. `announce` reads a line to the live region.
 */
export const useBoardRun = (
  game: LeaderboardGame,
  { board, player, onBoard, remember }: ScreenProps,
  announce: (line: string) => void,
) => {
  const t = useTranslations("Arcade");
  const { play } = useSounds();
  const nextRun = useRef<Run | null>(null);
  const activeRun = useRef<Run | null>(null);
  const finished = useRef<FinishedRun | null>(null);
  const [entry, setEntry] = useState<Entry>({ kind: "none" });

  // What the callbacks read without changing
  const latest = useRef({ board, player, play, announce });
  useEffect(() => {
    latest.current = { board, player, play, announce };
  }, [board, player, play, announce]);

  /** Asks the server for the next run, ready before Play is pressed. */
  const fetchRun = useCallback(() => {
    startRunAction(game)
      .then((run) => {
        if (run.kind === "started") nextRun.current = run;
      })
      .catch(() => {
        // Offline or resting: the next run plays off the board
      });
  }, [game]);

  useEffect(fetchRun, [fetchRun]);

  /**
   * A run begins: the seed the server handed out, or null to play one off
   * the board. The next one is fetched at once.
   */
  const begin = useCallback(() => {
    const run = nextRun.current;
    nextRun.current = null;
    activeRun.current = run;
    finished.current = null;
    setEntry({ kind: "none" });
    fetchRun();
    return run?.seed ?? null;
  }, [fetchRun]);

  /** Sends the finished run under `name`, and shows where it landed. */
  const send = useCallback(
    (name: string) => {
      const run = finished.current;
      const id = latest.current.player?.id;
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
            unlockTrophy("top10");
            setEntry({ kind: "ranked", rank: sent.rank });
            latest.current.announce(t("entry.rankedLive", { rank: sent.rank }));
            latest.current.play("toggleOn");
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

  /** The run is over with `points`: sent when it would make the board. */
  const end = useCallback(
    (points: number, inputs: ReadonlyArray<Input>) => {
      unlockTrophy(game);
      const run = activeRun.current;
      activeRun.current = null;
      const { board, player } = latest.current;
      if (
        run &&
        player &&
        board?.kind === "board" &&
        wouldRank(board.top, player.id, points)
      ) {
        finished.current = { ...run, inputs };
        if (player.name) send(player.name);
        else setEntry({ kind: "asking" });
      }
    },
    [game, send],
  );

  /** The first name typed: kept and sent, or what is wrong with it. */
  const submitName = useCallback(
    (raw: string) => {
      const parsed = parseName(raw);
      if (!parsed.ok) {
        setEntry({ kind: "asking", problem: parsed.problem });
        return false;
      }
      remember(parsed.name);
      send(parsed.name);
      return true;
    },
    [remember, send],
  );

  return { entry, begin, end, submitName };
};

/**
 * The visitor's own best at a game, kept in their browser under `key` (for
 * the visit only when storage refuses). Null before a first run.
 */
export const useBest = (key: string) => {
  const [best, setBest] = useState<number | null>(null);
  const stored = useRef<number | null>(null);

  useEffect(() => {
    const check = () => {
      try {
        stored.current = parseBest(window.localStorage.getItem(key));
      } catch {
        stored.current = null;
      }
      setBest(stored.current);
    };
    check();
  }, [key]);

  /** A finished run's score: the new best, and whether it beat the old one. */
  const record = useCallback(
    (points: number) => {
      const newBest = points > 0 && points > (stored.current ?? 0);
      const next = bestOf(stored.current, points);
      if (newBest) {
        try {
          window.localStorage.setItem(key, String(next));
        } catch {
          // Storage refused: the best holds for this visit only
        }
      }
      stored.current = next;
      setBest(next);
      return { best: next, newBest };
    },
    [key],
  );

  return { best, record };
};
