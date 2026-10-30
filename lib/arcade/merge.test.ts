import { describe, expect, it } from "vitest";

import {
  act,
  canMove,
  CELLS,
  createMerge,
  FOUR_CHANCE,
  GOAL,
  MAX_MOVES,
  type MergeInput,
  type MergeState,
  MIN_INPUT_GAP,
  type Move,
  MOVES,
  replayMerge,
  score,
  slideBoard,
} from "./merge";

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 7919 + 13);

/** A board written row by row: "2 2 0 0 / 0 4 0 0 / …". */
const board = (rows: string) =>
  rows.split("/").flatMap((row) => row.trim().split(/\s+/).map(Number));

/** A run of `seed` standing on `values`, as if played there. */
const standing = (seed: number, values: number[]): MergeState => ({
  ...createMerge(seed),
  values,
  ids: values.map((value, cell) => (value ? cell + 1 : 0)),
  nextId: CELLS + 1,
  top: Math.max(...values),
  events: [],
});

/**
 * Plays moves as the cabinet does, 20 hundredths apart, keeping only those
 * that moved something; `strategy` picks the move, the first that moves of
 * a corner player's order by default.
 */
const player = (seed: number) => {
  const state = createMerge(seed);
  const inputs: MergeInput[] = [];
  let step = 0;
  const move = (direction: Move) => {
    step += 20;
    const made = { step, move: direction };
    act(state, made);
    if (state.events.length > 0) inputs.push(made);
    return state.events;
  };
  /** Plays to the end, trying down, left, right, then up. */
  const finish = () => {
    while (state.phase === "running") {
      for (const direction of ["down", "left", "right", "up"] as const) {
        if (move(direction).length > 0) break;
      }
    }
  };
  return { state, inputs, move, finish };
};

describe("a move", () => {
  it("slides every tile to the edge it goes to", () => {
    const played = slideBoard(
      board("0 2 0 4 / 0 0 0 0 / 8 0 0 0 / 0 0 16 0"),
      "left",
    );
    expect(played.values).toEqual(
      board("2 4 0 0 / 0 0 0 0 / 8 0 0 0 / 16 0 0 0"),
    );
    expect(played.moved).toBe(true);
    expect(played.gained).toBe(0);
    expect(played.slides).toContainEqual({ from: 3, to: 1 });
    expect(played.slides).toContainEqual({ from: 8, to: 8 });
  });

  it("goes every way: right, up and down", () => {
    const start = board("2 0 0 0 / 0 0 0 0 / 0 0 0 0 / 0 0 0 4");
    expect(slideBoard(start, "right").values).toEqual(
      board("0 0 0 2 / 0 0 0 0 / 0 0 0 0 / 0 0 0 4"),
    );
    expect(slideBoard(start, "up").values).toEqual(
      board("2 0 0 4 / 0 0 0 0 / 0 0 0 0 / 0 0 0 0"),
    );
    expect(slideBoard(start, "down").values).toEqual(
      board("0 0 0 0 / 0 0 0 0 / 0 0 0 0 / 2 0 0 4"),
    );
  });

  it("merges two equal tiles that meet, and scores the new value", () => {
    const played = slideBoard(
      board("2 0 2 0 / 0 0 0 0 / 0 0 0 0 / 0 0 0 0"),
      "left",
    );
    expect(played.values.slice(0, 4)).toEqual([4, 0, 0, 0]);
    expect(played.merged).toEqual([0]);
    expect(played.gained).toBe(4);
  });

  it("never merges a tile twice in one move", () => {
    const row = (cells: string, move: Move) =>
      slideBoard(board(`${cells} / 0 0 0 0 / 0 0 0 0 / 0 0 0 0`), move);
    // 2 2 2 2 makes two commits, never a branch
    expect(row("2 2 2 2", "left").values.slice(0, 4)).toEqual([4, 4, 0, 0]);
    expect(row("2 2 2 2", "left").gained).toBe(8);
    // A tile just merged does not merge again with the one it now meets
    expect(row("2 2 4 0", "left").values.slice(0, 4)).toEqual([4, 4, 0, 0]);
    expect(row("4 4 8 0", "left").values.slice(0, 4)).toEqual([8, 8, 0, 0]);
    // The pair nearest the edge merges first
    expect(row("2 2 2 0", "left").values.slice(0, 4)).toEqual([4, 2, 0, 0]);
    expect(row("2 2 2 0", "right").values.slice(0, 4)).toEqual([0, 0, 2, 4]);
  });

  it("merges down a column too", () => {
    const played = slideBoard(
      board("4 0 0 0 / 4 0 0 0 / 4 0 0 0 / 4 0 0 0"),
      "down",
    );
    expect(played.values).toEqual(
      board("0 0 0 0 / 0 0 0 0 / 8 0 0 0 / 8 0 0 0"),
    );
    expect(played.merged).toEqual([12, 8]);
  });

  it("does nothing when nothing can go that way", () => {
    const start = board("2 4 8 16 / 0 0 0 0 / 0 0 0 0 / 0 0 0 0");
    expect(slideBoard(start, "left").moved).toBe(false);
    expect(slideBoard(start, "up").moved).toBe(false);
    expect(slideBoard(start, "down").moved).toBe(true);

    const state = standing(1, start);
    act(state, { step: 10, move: "left" });
    expect(state.events).toEqual([]);
    expect(state.values).toEqual(start);
    expect(state.moves).toBe(0);
    expect(state.steps).toBe(0);
  });

  it("follows each tile: slides keep their ids, a merge makes a new one", () => {
    const state = standing(3, board("2 2 0 0 / 0 0 0 0 / 0 0 0 0 / 0 0 0 0"));
    act(state, { step: 10, move: "right" });
    const [slide, merge] = state.events;
    expect(slide).toEqual({
      kind: "slide",
      slides: [
        { id: 2, from: 1, to: 3 },
        { id: 1, from: 0, to: 3 },
      ],
    });
    expect(merge).toEqual({ kind: "merge", id: CELLS + 1, cell: 3, value: 4 });
    expect(state.ids[3]).toBe(CELLS + 1);
  });
});

describe("new tiles", () => {
  it("start a run with two, from the seed", () => {
    for (const seed of SEEDS) {
      const a = createMerge(seed);
      const tiles = a.values.filter((value) => value > 0);
      expect(tiles).toHaveLength(2);
      expect(tiles.every((value) => value === 2 || value === 4)).toBe(true);
      expect(a.events.map((event) => event.kind)).toEqual(["spawn", "spawn"]);
      expect(createMerge(seed).values).toEqual(a.values);
    }
    const boards = new Set(
      SEEDS.map((seed) => createMerge(seed).values.join()),
    );
    expect(boards.size).toBeGreaterThan(SEEDS.length / 2);
  });

  it("land once after every move that moves, on a cell left empty", () => {
    const play = player(77);
    for (let i = 0; i < 30; i += 1) {
      const before = play.state.values.filter((value) => value > 0).length;
      const events = play.move(MOVES[i % 4]);
      if (events.length === 0) continue;
      const spawns = events.filter((event) => event.kind === "spawn");
      const merges = events.filter((event) => event.kind === "merge");
      expect(spawns).toHaveLength(1);
      const [landed] = spawns;
      if (landed.kind !== "spawn") throw new Error("no spawn");
      expect(play.state.values[landed.cell]).toBe(landed.value);
      const slide = events.find((event) => event.kind === "slide");
      if (slide?.kind !== "slide") throw new Error("no slide");
      expect(slide.slides.some(({ to }) => to === landed.cell)).toBe(false);
      expect(play.state.values.filter((value) => value > 0)).toHaveLength(
        before - merges.length + 1,
      );
    }
  });

  it("follow the seed: the same moves make the same boards", () => {
    const a = player(2026);
    const b = player(2026);
    const c = player(2027);
    for (const direction of ["left", "down", "right", "down", "left", "up"]) {
      a.move(direction as Move);
      b.move(direction as Move);
      c.move(direction as Move);
      expect(b.state.values).toEqual(a.state.values);
    }
    expect(c.state.values).not.toEqual(a.state.values);
  });

  it("are a 4 about one time in ten", () => {
    let fours = 0;
    let all = 0;
    for (const seed of SEEDS) {
      for (const event of createMerge(seed).events) {
        if (event.kind !== "spawn") continue;
        all += 1;
        if (event.value === 4) fours += 1;
      }
    }
    // Every spawn of whole runs, too
    for (const seed of SEEDS.slice(0, 10)) {
      const play = player(seed);
      const counted = (events: MergeState["events"]) => {
        for (const event of events) {
          if (event.kind !== "spawn") continue;
          all += 1;
          if (event.value === 4) fours += 1;
        }
      };
      while (play.state.phase === "running") {
        for (const direction of ["down", "left", "right", "up"] as const) {
          const events = play.move(direction);
          counted(events);
          if (events.length > 0) break;
        }
      }
    }
    expect(fours / all).toBeGreaterThan(FOUR_CHANCE / 2);
    expect(fours / all).toBeLessThan(FOUR_CHANCE * 1.5);
  });
});

describe("the end", () => {
  it("knows when no move is left", () => {
    expect(canMove(board("2 4 2 4 / 4 2 4 2 / 2 4 2 4 / 4 2 4 2"))).toBe(false);
    expect(canMove(board("2 4 2 4 / 4 2 4 2 / 2 4 2 4 / 4 2 4 4"))).toBe(true);
    expect(canMove(board("2 4 2 4 / 4 2 4 2 / 2 4 2 4 / 4 2 2 4"))).toBe(true);
    expect(canMove(board("2 4 2 4 / 4 2 4 2 / 2 4 2 4 / 2 2 4 0"))).toBe(true);
    // Equal tiles only in a column
    expect(canMove(board("2 4 2 4 / 4 2 4 8 / 2 4 2 8 / 4 2 4 2"))).toBe(true);
  });

  it("comes with the last move, and nothing plays after it", () => {
    // Moving left fills the last cell with a tile no neighbour matches,
    // whatever it is: the 8 merges into 16, then a 2 or 4 lands on the right
    const state = standing(5, board("4 8 4 8 / 8 4 8 4 / 4 8 4 8 / 64 32 8 8"));
    act(state, { step: 10, move: "left" });
    expect(state.values.slice(12, 15)).toEqual([64, 32, 16]);
    expect(state.phase).toBe("over");
    expect(state.events.at(-1)).toEqual({ kind: "over" });
    const ended = state.values.slice();
    act(state, { step: 20, move: "up" });
    expect(state.events).toEqual([]);
    expect(state.values).toEqual(ended);
  });

  it("does not come with 2048: the release ships and the run goes on", () => {
    const state = standing(
      8,
      board("1024 1024 0 0 / 2 0 0 0 / 0 0 0 0 / 0 0 0 0"),
    );
    state.score = 10_000;
    act(state, { step: 10, move: "left" });
    expect(state.values[0]).toBe(GOAL);
    expect(state.shipped).toBe(true);
    expect(state.events.map((event) => event.kind)).toEqual([
      "slide",
      "merge",
      "spawn",
      "shipped",
    ]);
    expect(state.phase).toBe("running");
    expect(score(state)).toBe(10_000 + GOAL);
    // A second 2048 ships nothing new
    state.values = board("2048 1024 1024 0 / 0 0 0 0 / 0 0 0 0 / 0 0 0 0");
    act(state, { step: 20, move: "right" });
    expect(state.events.some((event) => event.kind === "shipped")).toBe(false);
    expect(state.top).toBe(GOAL);
  });
});

describe("the score", () => {
  it("is the sum of every merge's value", () => {
    for (const seed of SEEDS.slice(0, 10)) {
      const play = player(seed);
      let merged = 0;
      while (play.state.phase === "running") {
        for (const direction of ["down", "left", "right", "up"] as const) {
          const events = play.move(direction);
          for (const event of events) {
            if (event.kind === "merge") merged += event.value;
          }
          if (events.length > 0) break;
        }
      }
      expect(score(play.state)).toBe(merged);
      expect(score(play.state)).toBeGreaterThan(0);
      expect(play.state.moves).toBe(play.inputs.length);
    }
  });
});

describe("a replay", () => {
  it("plays a run again to the same board and score", () => {
    for (const seed of SEEDS.slice(0, 10)) {
      const play = player(seed);
      play.finish();
      const replayed = replayMerge(seed, play.inputs);
      expect(replayed?.phase).toBe("over");
      expect(replayed?.values).toEqual(play.state.values);
      expect(score(replayed!)).toBe(score(play.state));
      expect(replayed?.steps).toBe(play.state.steps);
    }
  });

  it("ignores what follows the end", () => {
    const play = player(31);
    play.finish();
    const last = play.inputs.at(-1)!;
    const replayed = replayMerge(31, [
      ...play.inputs,
      { step: last.step + 100, move: "up" },
    ]);
    expect(score(replayed!)).toBe(score(play.state));
  });

  it("refuses moves out of order, too close, unknown, idle or unfinished", () => {
    const play = player(4);
    play.finish();
    const { inputs } = play;
    const [a, b, ...rest] = inputs;
    expect(replayMerge(4, [b, a, ...rest])).toBeNull();
    expect(
      replayMerge(4, [a, { ...b, step: a.step + MIN_INPUT_GAP - 1 }, ...rest]),
    ).toBeNull();
    expect(replayMerge(4, [{ ...a, step: 1.5 }, b, ...rest])).toBeNull();
    expect(
      replayMerge(4, [{ ...a, move: "jump" as Move }, b, ...rest]),
    ).toBeNull();
    expect(replayMerge(4, inputs.slice(0, -1))).toBeNull();
    expect(replayMerge(4, [])).toBeNull();
    // A move that moves nothing was never kept by the cabinet
    const stuck = createMerge(4);
    const idle = MOVES.find((move) => !slideBoard(stuck.values, move).moved);
    if (idle) {
      expect(replayMerge(4, [{ step: 10, move: idle }, ...inputs])).toBeNull();
    }
    // More moves than any run makes
    const many = Array.from({ length: MAX_MOVES + 1 }, (_, i) => ({
      step: i * MIN_INPUT_GAP,
      move: MOVES[i % 4],
    }));
    expect(replayMerge(4, many)).toBeNull();
    // The same moves on another seed do not make the same run
    const other = replayMerge(5, inputs);
    expect(other === null || score(other) !== score(play.state)).toBe(true);
  });
});
