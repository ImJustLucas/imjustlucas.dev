import { Effect, Random } from "effect";
import { TestClock } from "effect/testing";

import { LEADERBOARD_SIZE, wouldRank } from "./board";
import * as cafe from "./cafe";
import {
  leaderboard,
  LIMITS,
  removeEntry,
  Scores,
  startRun,
  submitRun,
} from "./leaderboard";
import { layerInMemory } from "./leaderboard-in-memory";
import * as merge from "./merge";
import {
  advance,
  createOllie,
  type OllieInput,
  PLAYER,
  press,
  release,
  score,
  STEP,
} from "./ollie";
import * as surf from "./surf";

import { describe, expect, it } from "@effect/vitest";

const LEA = "3f2b1c9e-8d7a-4b6c-9e5f-1a2b3c4d5e6f";
const TOM = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";

/** Plays a run of `seed` as the cabinet would, jumping `jumps` obstacles. */
const play = (seed: number, jumps: number) => {
  const state = createOllie(seed);
  const inputs: OllieInput[] = [];
  const input = (pressed: boolean) => {
    inputs.push({ step: state.steps, press: pressed });
    if (pressed) press(state);
    else release(state);
  };
  input(true);
  input(false);
  let jumped = 0;
  while (state.phase !== "over") {
    advance(state, 1 / 60);
    const near = state.obstacles.find(
      (o) => o.x > PLAYER.x && o.x - PLAYER.x < 70 && o.kind !== "pigeon",
    );
    if (near && state.player.grounded && jumped < jumps) {
      input(true);
      jumped += 1;
    }
    if (!state.player.grounded && state.player.holding) {
      if (state.player.velocity < 0) input(false);
    }
  }
  return { inputs, score: score(state), seconds: state.steps * STEP };
};

/** Starts a run, plays it, waits as long as it lasted, and sends it. */
const playAndSubmit = (playerId: string, name: string, jumps: number) =>
  Effect.gen(function* () {
    const started = yield* startRun("ollie", "1.2.3.4");
    if (started.kind !== "started") throw new Error("not started");
    const run = play(started.seed, jumps);
    yield* TestClock.adjust(`${Math.ceil(run.seconds) + 1} seconds`);
    const result = yield* submitRun(
      { runId: started.runId, playerId, name, inputs: run.inputs },
      `client-${playerId}`,
    );
    return { run, result };
  });

describe("a run sent to the leaderboard", () => {
  it.effect("is replayed and kept under the player's name", () =>
    Effect.gen(function* () {
      const { run, result } = yield* playAndSubmit(LEA, "  Léa ", 3);
      expect(result).toMatchObject({ kind: "ranked", score: run.score });
      expect(yield* leaderboard("ollie")).toEqual([
        { playerId: LEA, name: "Léa", score: run.score },
      ]);
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("ranks players best first and keeps each one's best", () =>
    Effect.gen(function* () {
      const first = yield* playAndSubmit(LEA, "Léa", 0);
      const tom = yield* playAndSubmit(TOM, "Tom", 4);
      const again = yield* playAndSubmit(LEA, "Léa", 0);
      const board = yield* leaderboard("ollie");
      // Each player once, best first, with their best run
      expect(board.map((entry) => entry.playerId).sort()).toEqual(
        [LEA, TOM].sort(),
      );
      expect(board[0].score).toBeGreaterThanOrEqual(board[1].score);
      const lea = board.find((entry) => entry.playerId === LEA);
      expect(lea?.score).toBe(Math.max(first.run.score, again.run.score));
      expect(board.find((entry) => entry.playerId === TOM)?.score).toBe(
        tom.run.score,
      );
      // A run below the player's best does not rank (one equal to it
      // reports their place, which that score holds)
      if (again.run.score < first.run.score) {
        expect(again.result.kind).toBe("unranked");
      }
    }).pipe(Effect.provide(layerInMemory()), Random.withSeed("arcade")),
  );

  it.effect("never takes the browser's word for the score", () =>
    Effect.gen(function* () {
      const started = yield* startRun("ollie", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const { inputs } = play(started.seed, 2);
      yield* TestClock.adjust("1 hour");
      const result = yield* submitRun(
        {
          runId: started.runId,
          playerId: LEA,
          name: "Léa",
          inputs,
          score: 99999,
        },
        "1.2.3.4",
      );
      expect(result).toMatchObject({ kind: "ranked" });
      expect((yield* leaderboard("ollie"))[0].score).toBeLessThan(99999);
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("refuses a run sent faster than it could be played", () =>
    Effect.gen(function* () {
      const started = yield* startRun("ollie", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const { inputs } = play(started.seed, 3);
      const result = yield* submitRun(
        { runId: started.runId, playerId: LEA, name: "Léa", inputs },
        "1.2.3.4",
      );
      expect(result).toEqual({ kind: "refused" });
      expect(yield* leaderboard("ollie")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("takes a run's result only once", () =>
    Effect.gen(function* () {
      const started = yield* startRun("ollie", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const { inputs } = play(started.seed, 1);
      yield* TestClock.adjust("1 hour");
      const body = { runId: started.runId, playerId: LEA, name: "Léa", inputs };
      expect((yield* submitRun(body, "1.2.3.4")).kind).toBe("ranked");
      expect(yield* submitRun(body, "1.2.3.4")).toEqual({ kind: "expired" });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("refuses presses that do not make a run", () =>
    Effect.gen(function* () {
      const started = yield* startRun("ollie", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const result = yield* submitRun(
        {
          runId: started.runId,
          playerId: LEA,
          name: "Léa",
          inputs: [{ step: 10, press: true }],
        },
        "1.2.3.4",
      );
      expect(result).toEqual({ kind: "refused" });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("refuses a malformed body, a bad player id and a bad name", () =>
    Effect.gen(function* () {
      expect(yield* submitRun("nope", "1.2.3.4")).toEqual({ kind: "refused" });
      expect(
        yield* submitRun(
          { runId: "x", playerId: "me", name: "Léa", inputs: [] },
          "1.2.3.4",
        ),
      ).toEqual({ kind: "refused" });
      expect(
        yield* submitRun(
          { runId: "x", playerId: LEA, name: "<script>", inputs: [] },
          "1.2.3.4",
        ),
      ).toEqual({ kind: "bad-name" });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("limits how many runs one visitor starts", () =>
    Effect.gen(function* () {
      for (let i = 0; i < LIMITS.start.count; i++) {
        expect((yield* startRun("ollie", "9.9.9.9")).kind).toBe("started");
      }
      expect(yield* startRun("ollie", "9.9.9.9")).toEqual({ kind: "limited" });
      expect((yield* startRun("ollie", "8.8.8.8")).kind).toBe("started");
    }).pipe(Effect.provide(layerInMemory())),
  );
});

/** Plays a Surf run of `seed`, popping through the gates for a while. */
const playSurf = (seed: number, gates: number) => {
  const state = surf.createSurf(seed);
  const inputs: surf.SurfInput[] = [];
  const pop = () => {
    inputs.push({ step: state.steps, press: true });
    surf.press(state);
  };
  pop();
  while (state.phase !== "over") {
    surf.advance(state, 1 / 60);
    const next = state.obstacles.find(
      (g) => g.x + 40 > surf.PLAYER.x - 10 && g.x - surf.PLAYER.x < 260,
    );
    const aim = next ? next.floor + 8 : 30;
    const going = state.gates < gates;
    if (going && state.player.lift < aim && state.player.velocity <= 0) pop();
  }
  return {
    inputs,
    gates: state.gates,
    score: surf.score(state),
    seconds: state.steps * surf.STEP,
  };
};

describe("a Surf run sent to the leaderboard", () => {
  it.effect("is replayed with Surf's rules, on Surf's own board", () =>
    Effect.gen(function* () {
      const started = yield* startRun("surf", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const run = playSurf(started.seed, 6);
      // Riding on through a low gate or a tube may add a gate or two
      expect(run.gates).toBeGreaterThanOrEqual(6);
      yield* TestClock.adjust(`${Math.ceil(run.seconds) + 1} seconds`);
      const result = yield* submitRun(
        {
          runId: started.runId,
          playerId: LEA,
          name: "Léa",
          inputs: run.inputs,
        },
        "1.2.3.4",
      );
      expect(result).toMatchObject({
        kind: "ranked",
        score: run.score,
        rank: 1,
      });
      expect(yield* leaderboard("surf")).toEqual([
        { playerId: LEA, name: "Léa", score: run.score },
      ]);
      expect(yield* leaderboard("ollie")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("never scores presses with another game's rules", () =>
    Effect.gen(function* () {
      // Presses that skate an Ollie run, sent as the result of a Surf run
      const started = yield* startRun("surf", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const skated = play(started.seed, 4);
      yield* TestClock.adjust("1 hour");
      const result = yield* submitRun(
        {
          runId: started.runId,
          playerId: LEA,
          name: "Léa",
          inputs: skated.inputs,
        },
        "1.2.3.4",
      );
      const surfed = surf.replaySurf(started.seed, skated.inputs);
      if (surfed) {
        expect(result).toMatchObject({ score: surf.score(surfed) });
      } else {
        expect(result).toEqual({ kind: "refused" });
      }
      expect(result).not.toMatchObject({ score: skated.score });
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("refuses a Surf run sent faster than it could be played", () =>
    Effect.gen(function* () {
      const started = yield* startRun("surf", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      const { inputs } = playSurf(started.seed, 3);
      const result = yield* submitRun(
        { runId: started.runId, playerId: LEA, name: "Léa", inputs },
        "1.2.3.4",
      );
      expect(result).toEqual({ kind: "refused" });
      expect(yield* leaderboard("surf")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory())),
  );
});

describe("the leaderboard", () => {
  it.effect(`shows the ${LEADERBOARD_SIZE} best players`, () =>
    Effect.gen(function* () {
      const scores = yield* Scores;
      for (let i = 0; i < LEADERBOARD_SIZE + 3; i++) {
        yield* scores.record("ollie", {
          playerId: `p${i}`,
          name: `P${i}`,
          score: i * 10,
        });
      }
      const board = yield* leaderboard("ollie");
      expect(board).toHaveLength(LEADERBOARD_SIZE);
      expect(board[0].score).toBe((LEADERBOARD_SIZE + 2) * 10);
    }).pipe(Effect.provide(layerInMemory())),
  );

  it.effect("loses a player the Owner removes", () =>
    Effect.gen(function* () {
      yield* playAndSubmit(LEA, "Léa", 1);
      yield* removeEntry("ollie", LEA);
      expect(yield* leaderboard("ollie")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory())),
  );
});

describe("whether a run would rank", () => {
  const board = Array.from({ length: LEADERBOARD_SIZE }, (_, i) => ({
    playerId: `p${i}`,
    name: `P${i}`,
    score: 100 - i * 5,
  }));

  it("ranks when the board has room, or when it beats the last", () => {
    expect(wouldRank([], null, 1)).toBe(true);
    expect(wouldRank(board, null, 56)).toBe(true);
    expect(wouldRank(board, null, 55)).toBe(false);
    expect(wouldRank(board, null, 0)).toBe(false);
  });

  it("ranks a player already on the board only above their best", () => {
    expect(wouldRank(board, "p3", 85)).toBe(false);
    expect(wouldRank(board, "p3", 86)).toBe(true);
  });
});

/**
 * Plays a Café run of `seed` as the cabinet would: the middle saucer, then
 * every safe one, one every `pace` hundredths; `spill` knocks a cup over
 * instead of clearing.
 */
const playCafe = (seed: number, pace: number, spill = false) => {
  const state = cafe.createCafe(seed);
  const inputs: cafe.CafeInput[] = [];
  let step = 0;
  const input = (cell: number) => {
    const made = { step, cell, action: "reveal" as const };
    cafe.act(state, made);
    if (state.events.length > 0) inputs.push(made);
    step += pace;
  };
  input(40);
  if (spill) input(state.cups.indexOf(true));
  for (let cell = 0; cell < cafe.CELLS; cell += 1) {
    if (state.phase !== "running") break;
    if (!state.open[cell] && !state.cups[cell]) input(cell);
  }
  return {
    inputs,
    score: cafe.score(state),
    seconds: state.steps * cafe.STEP,
  };
};

const sendCafe = (playerId: string, pace: number, spill = false) =>
  Effect.gen(function* () {
    const started = yield* startRun("cafe", "1.2.3.4");
    if (started.kind !== "started") throw new Error("not started");
    const run = playCafe(started.seed, pace, spill);
    yield* TestClock.adjust(`${Math.ceil(run.seconds) + 1} seconds`);
    const result = yield* submitRun(
      { runId: started.runId, playerId, name: "Léa", inputs: run.inputs },
      `client-${playerId}`,
    );
    return { run, result };
  });

describe("a Café run sent to the leaderboard", () => {
  it.effect("is replayed, and its time kept, the fastest first", () =>
    Effect.gen(function* () {
      const slow = yield* sendCafe(LEA, 90);
      const fast = yield* sendCafe(TOM, 30);
      expect(slow.result).toMatchObject({ kind: "ranked", rank: 1 });
      expect(fast.result).toMatchObject({
        kind: "ranked",
        score: fast.run.score,
        rank: 1,
      });
      const board = yield* leaderboard("cafe");
      expect(board.map((entry) => entry.playerId)).toEqual([TOM, LEA]);
      expect(board[0].score).toBeLessThan(board[1].score);
      expect(yield* leaderboard("ollie")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory()), Random.withSeed("cafe")),
  );

  it.effect("keeps a player's fastest time, not their last", () =>
    Effect.gen(function* () {
      const fast = yield* sendCafe(LEA, 30);
      const slow = yield* sendCafe(LEA, 90);
      expect(slow.result.kind).toBe("unranked");
      expect(yield* leaderboard("cafe")).toEqual([
        { playerId: LEA, name: "Léa", score: fast.run.score },
      ]);
    }).pipe(Effect.provide(layerInMemory()), Random.withSeed("cafe")),
  );

  it.effect("refuses a table not cleared, and Ollie's presses", () =>
    Effect.gen(function* () {
      const spilled = yield* sendCafe(LEA, 40, true);
      expect(spilled.result).toEqual({ kind: "refused" });
      const started = yield* startRun("cafe", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      yield* TestClock.adjust("1 hour");
      const presses = yield* submitRun(
        {
          runId: started.runId,
          playerId: LEA,
          name: "Léa",
          inputs: [{ step: 0, press: true }],
        },
        "1.2.3.4",
      );
      expect(presses).toEqual({ kind: "refused" });
      expect(yield* leaderboard("cafe")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory())),
  );

  it("would rank a time below the board's slowest", () => {
    const times = Array.from({ length: LEADERBOARD_SIZE }, (_, i) => ({
      playerId: `p${i}`,
      name: `P${i}`,
      score: 3000 + i * 500,
    }));
    expect(wouldRank(times, null, 7499, "lowest")).toBe(true);
    expect(wouldRank(times, null, 7500, "lowest")).toBe(false);
    expect(wouldRank(times, "p2", 4000, "lowest")).toBe(false);
    expect(wouldRank(times, "p2", 3999, "lowest")).toBe(true);
    expect(wouldRank(times, null, 0, "lowest")).toBe(false);
  });
});

/**
 * Plays a Merge run of `seed` as the cabinet would, a move every `pace`
 * hundredths, trying the moves in `order` until one moves something, to
 * the end (or for `moves` moves only).
 */
const playMerge = (
  seed: number,
  pace: number,
  order: ReadonlyArray<merge.Move>,
  moves = Infinity,
) => {
  const state = merge.createMerge(seed);
  const inputs: merge.MergeInput[] = [];
  let step = 0;
  while (state.phase === "running" && inputs.length < moves) {
    step += pace;
    for (const move of order) {
      const made = { step, move };
      merge.act(state, made);
      if (state.events.length > 0) {
        inputs.push(made);
        break;
      }
    }
  }
  return {
    inputs,
    score: merge.score(state),
    seconds: state.steps * merge.STEP,
  };
};

const CORNER = ["down", "left", "right", "up"] as const;
const CLUMSY = ["up", "right", "down", "left"] as const;

const sendMerge = (
  playerId: string,
  order: ReadonlyArray<merge.Move>,
  options: { readonly moves?: number; readonly wait?: boolean } = {},
) =>
  Effect.gen(function* () {
    const started = yield* startRun("merge", "1.2.3.4");
    if (started.kind !== "started") throw new Error("not started");
    const run = playMerge(started.seed, 20, order, options.moves);
    if (options.wait !== false) {
      yield* TestClock.adjust(`${Math.ceil(run.seconds) + 1} seconds`);
    }
    const result = yield* submitRun(
      { runId: started.runId, playerId, name: "Léa", inputs: run.inputs },
      `client-${playerId}`,
    );
    return { run, result };
  });

describe("a Merge run sent to the leaderboard", () => {
  it.effect("is replayed, and its score kept, the highest first", () =>
    Effect.gen(function* () {
      const low = yield* sendMerge(LEA, CLUMSY);
      const high = yield* sendMerge(TOM, CORNER);
      expect(low.result).toMatchObject({ kind: "ranked", rank: 1 });
      expect(high.result).toMatchObject({
        kind: "ranked",
        score: high.run.score,
      });
      const board = yield* leaderboard("merge");
      expect(board.map((entry) => entry.score)).toEqual(
        [low.run.score, high.run.score].sort((a, b) => b - a),
      );
      expect(yield* leaderboard("cafe")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory()), Random.withSeed("merge")),
  );

  it.effect("refuses a run sent faster than its moves could be made", () =>
    Effect.gen(function* () {
      const sent = yield* sendMerge(LEA, CORNER, { wait: false });
      expect(sent.run.seconds).toBeGreaterThan(1);
      expect(sent.result).toEqual({ kind: "refused" });
      expect(yield* leaderboard("merge")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory()), Random.withSeed("merge")),
  );

  it.effect("refuses a run not over, and Café's actions", () =>
    Effect.gen(function* () {
      const unfinished = yield* sendMerge(LEA, CORNER, { moves: 30 });
      expect(unfinished.result).toEqual({ kind: "refused" });
      const started = yield* startRun("merge", "1.2.3.4");
      if (started.kind !== "started") throw new Error("not started");
      yield* TestClock.adjust("1 hour");
      const cells = yield* submitRun(
        {
          runId: started.runId,
          playerId: LEA,
          name: "Léa",
          inputs: [{ step: 0, cell: 4, action: "reveal" }],
        },
        "1.2.3.4",
      );
      expect(cells).toEqual({ kind: "refused" });
      expect(yield* leaderboard("merge")).toEqual([]);
    }).pipe(Effect.provide(layerInMemory()), Random.withSeed("merge")),
  );
});
