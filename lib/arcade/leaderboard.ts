import { Clock, Context, Data, Effect, Random, Schema } from "effect";

import {
  type CellInput,
  LEADERBOARD_GAMES,
  LEADERBOARD_SIZE,
  type LeaderboardEntry,
  type LeaderboardGame,
  type MoveInput,
  type PressInput,
  type RunInput,
  type StartedRun,
  type SubmittedRun,
} from "@/lib/arcade/board";
import * as cafe from "@/lib/arcade/cafe";
import * as merge from "@/lib/arcade/merge";
import * as ollie from "@/lib/arcade/ollie";
import { isPlayerId, parseName } from "@/lib/arcade/player-name";
import * as surf from "@/lib/arcade/surf";

/**
 * The Arcade's leaderboards (DESIGN.md, Arcade): the ten best players of each
 * game, every visitor's best kept once under the first name they chose. A
 * score is never taken from the browser: the server hands out each run's
 * seed, the browser sends back the presses it made, and the server replays
 * the run with the game's own rules to know its score. The plain shapes are
 * in `board.ts`; a game's best is its highest score, or its lowest time
 * (`SCORE_ORDER`).
 */

/** How long a run handed out stays open for its result (3 hours). */
export const RUN_TTL_SECONDS = 3 * 60 * 60;

/** Runs one visitor may start, and results they may send, per window. */
export const LIMITS = {
  start: { count: 60, windowSeconds: 10 * 60 },
  submit: { count: 20, windowSeconds: 10 * 60 },
} as const;

/** What a replay says of a run: how many steps it took, and its score. */
type Replayed = { readonly steps: number; readonly points: number };

/** The inputs, when they are all presses (Ollie, Surf); else null. */
const presses = (inputs: ReadonlyArray<RunInput>) =>
  inputs.every((input) => "press" in input)
    ? (inputs as ReadonlyArray<PressInput>)
    : null;

/** The inputs, when they are all actions on a cell (Café); else null. */
const cellInputs = (inputs: ReadonlyArray<RunInput>) =>
  inputs.every((input) => "cell" in input)
    ? (inputs as ReadonlyArray<CellInput>)
    : null;

/** The inputs, when they are all moves (Merge); else null. */
const moves = (inputs: ReadonlyArray<RunInput>) =>
  inputs.every((input) => "move" in input)
    ? (inputs as ReadonlyArray<MoveInput>)
    : null;

/**
 * Each game's own rules, replaying a run from its seed and inputs: null when
 * the inputs do not make a run that could have been played (or, in Café, a
 * table that was not cleared).
 */
const REPLAY: {
  readonly [G in LeaderboardGame]: {
    readonly step: number;
    readonly replay: (
      seed: number,
      inputs: ReadonlyArray<RunInput>,
    ) => Replayed | null;
  };
} = {
  ollie: {
    step: ollie.STEP,
    replay: (seed, inputs) => {
      const pressed = presses(inputs);
      const run = pressed && ollie.replayOllie(seed, pressed);
      return run && { steps: run.steps, points: ollie.score(run) };
    },
  },
  surf: {
    step: surf.STEP,
    replay: (seed, inputs) => {
      const pressed = presses(inputs);
      const run = pressed && surf.replaySurf(seed, pressed);
      return run && { steps: run.steps, points: surf.score(run) };
    },
  },
  cafe: {
    step: cafe.STEP,
    replay: (seed, inputs) => {
      const actions = cellInputs(inputs);
      const run = actions && cafe.replayCafe(seed, actions);
      return run?.phase === "won"
        ? { steps: run.steps, points: cafe.score(run) }
        : null;
    },
  },
  merge: {
    step: merge.STEP,
    replay: (seed, inputs) => {
      const moved = moves(inputs);
      const run = moved && merge.replayMerge(seed, moved);
      return run && { steps: run.steps, points: merge.score(run) };
    },
  },
};

/**
 * The most inputs a result may carry: one press and release every 5 steps,
 * or Merge's most moves.
 */
const MAX_INPUTS = Math.max(
  ollie.MAX_RUN_STEPS / 10,
  surf.MAX_RUN_STEPS / 10,
  merge.MAX_MOVES,
);

/** A run handed out, waiting for its result. */
export const OpenRun = Schema.Struct({
  game: Schema.Literals(LEADERBOARD_GAMES),
  seed: Schema.Number,
  /** When it was handed out, in milliseconds. */
  startedAt: Schema.Number,
});
export type OpenRun = typeof OpenRun.Type;

/** The leaderboard store could not be reached. */
export class ScoresUnavailable extends Data.TaggedError("ScoresUnavailable")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The one seam under the leaderboards. Adapters: Upstash Redis (production),
 * in memory (tests).
 */
export class Scores extends Context.Service<
  Scores,
  {
    readonly openRun: (
      id: string,
      run: OpenRun,
    ) => Effect.Effect<void, ScoresUnavailable>;
    /** The open run, closed at once: a run's result is taken only once. */
    readonly takeRun: (
      id: string,
    ) => Effect.Effect<OpenRun | undefined, ScoresUnavailable>;
    /** The best players, best first. */
    readonly top: (
      game: LeaderboardGame,
      count: number,
    ) => Effect.Effect<ReadonlyArray<LeaderboardEntry>, ScoresUnavailable>;
    /** Keeps a player's score when it beats their best, and their name. */
    readonly record: (
      game: LeaderboardGame,
      entry: LeaderboardEntry,
    ) => Effect.Effect<void, ScoresUnavailable>;
    readonly remove: (
      game: LeaderboardGame,
      playerId: string,
    ) => Effect.Effect<void, ScoresUnavailable>;
    /** Counts one more use of `key` in its window; false past the limit. */
    readonly allow: (
      key: string,
      limit: { readonly count: number; readonly windowSeconds: number },
    ) => Effect.Effect<boolean, ScoresUnavailable>;
  }
>()("arcade/Scores") {}

/** Hands out a new run of `game` to the visitor `client` (an IP address). */
export const startRun = (game: LeaderboardGame, client: string) =>
  Effect.gen(function* () {
    const scores = yield* Scores;
    if (!(yield* scores.allow(`start:${client}`, LIMITS.start))) {
      return { kind: "limited" } as StartedRun;
    }
    const runId = crypto.randomUUID();
    const seed = yield* Random.nextIntBetween(0, 2 ** 31 - 1);
    const startedAt = yield* Clock.currentTimeMillis;
    yield* scores.openRun(runId, { game, seed, startedAt });
    return { kind: "started", runId, seed } as StartedRun;
  });

/** What the browser sends at the end of a run, unchecked. */
const Submission = Schema.Struct({
  runId: Schema.String,
  playerId: Schema.String,
  name: Schema.String,
  inputs: Schema.Array(
    Schema.Union([
      Schema.Struct({ step: Schema.Number, press: Schema.Boolean }),
      Schema.Struct({
        step: Schema.Number,
        cell: Schema.Number,
        action: Schema.Literals(cafe.CAFE_ACTIONS),
      }),
      Schema.Struct({
        step: Schema.Number,
        move: Schema.Literals(merge.MOVES),
      }),
    ]),
  ).check(Schema.isMaxLength(MAX_INPUTS)),
});

/**
 * Takes a run's result: replays it from its seed and presses, refuses one
 * played faster than real time, and keeps the score if it is the player's
 * best. The browser's own idea of the score is never asked for.
 */
export const submitRun = (input: unknown, client: string) =>
  Effect.gen(function* () {
    const scores = yield* Scores;
    if (!(yield* scores.allow(`submit:${client}`, LIMITS.submit))) {
      return { kind: "limited" } as SubmittedRun;
    }
    const submission = yield* Effect.option(
      Schema.decodeUnknownEffect(Submission)(input),
    );
    if (submission._tag === "None" || !isPlayerId(submission.value.playerId)) {
      return { kind: "refused" } as SubmittedRun;
    }
    const { runId, playerId, inputs } = submission.value;
    const name = parseName(submission.value.name);
    if (!name.ok) return { kind: "bad-name" } as SubmittedRun;

    const run = yield* scores.takeRun(runId);
    if (!run) return { kind: "expired" } as SubmittedRun;

    // The game's own rules play the run again (Café's only a cleared table)
    const rules = REPLAY[run.game];
    const played = rules.replay(run.seed, inputs);
    if (!played) return { kind: "refused" } as SubmittedRun;
    // A run takes at least as long as its steps (pauses only add time)
    const now = yield* Clock.currentTimeMillis;
    if (now - run.startedAt < played.steps * rules.step * 1000 * 0.95) {
      return { kind: "refused" } as SubmittedRun;
    }

    const { points } = played;
    if (points > 0) {
      yield* scores.record(run.game, {
        playerId,
        name: name.name,
        score: points,
      });
    }
    const top = yield* scores.top(run.game, LEADERBOARD_SIZE);
    const at = top.findIndex(
      (entry) => entry.playerId === playerId && entry.score === points,
    );
    return (
      at >= 0
        ? { kind: "ranked", score: points, rank: at + 1, top }
        : { kind: "unranked", score: points, top }
    ) as SubmittedRun;
  });

/** A game's leaderboard, best first. */
export const leaderboard = (game: LeaderboardGame) =>
  Effect.gen(function* () {
    const scores = yield* Scores;
    return yield* scores.top(game, LEADERBOARD_SIZE);
  });

/** Takes a player off a game's leaderboard (the Owner, from the Admin). */
export const removeEntry = (game: LeaderboardGame, playerId: string) =>
  Effect.gen(function* () {
    const scores = yield* Scores;
    yield* scores.remove(game, playerId);
  });
