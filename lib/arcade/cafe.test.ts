import { describe, expect, it } from "vitest";

import {
  act,
  type CafeInput,
  type CafeState,
  CELLS,
  COLS,
  createCafe,
  CUPS,
  cupsLeft,
  deal,
  elapsed,
  HINT_STEPS,
  MIN_INPUT_GAP,
  neighbours,
  replayCafe,
  ROWS,
  score,
  solvable,
} from "./cafe";

const SEEDS = Array.from({ length: 120 }, (_, i) => i * 7919 + 13);
const CENTRE = 4 * COLS + 4;
const at = (row: number, col: number) => row * COLS + col;

/** Plays inputs as the cabinet does, keeping only those that did something. */
const player = (seed: number) => {
  const state = createCafe(seed);
  const inputs: CafeInput[] = [];
  let step = 0;
  const input = (cell: number, action: CafeInput["action"] = "reveal") => {
    step += 40;
    const made = { step, cell, action };
    act(state, made);
    if (state.events.length > 0) inputs.push(made);
    return state.events;
  };
  return { state, inputs, input };
};

/** Turns every safe saucer left, one by one: a player who knows the table. */
const clear = (play: ReturnType<typeof player>) => {
  for (let cell = 0; cell < CELLS; cell += 1) {
    if (play.state.phase !== "running") break;
    if (!play.state.open[cell] && !play.state.cups[cell]) play.input(cell);
  }
};

const firstCup = (state: CafeState) => state.cups.indexOf(true);

describe("the table", () => {
  it("has neighbours in the corners, on the edges and in the middle", () => {
    expect(neighbours(at(0, 0)).sort((a, b) => a - b)).toEqual([
      at(0, 1),
      at(1, 0),
      at(1, 1),
    ]);
    expect(neighbours(at(0, 4))).toHaveLength(5);
    expect(neighbours(CENTRE)).toHaveLength(8);
    expect(neighbours(at(8, 8))).toHaveLength(3);
  });

  it("waits for its first saucer before laying the cups", () => {
    const state = createCafe(1);
    expect(state.phase).toBe("ready");
    expect(state.cups.some(Boolean)).toBe(false);
    // Neither a sugar nor the petit café lays it
    act(state, { step: 10, cell: 3, action: "sugar" });
    act(state, { step: 20, cell: 3, action: "hint" });
    expect(state.phase).toBe("ready");
    expect(state.events).toEqual([]);
  });
});

describe("the first saucer", () => {
  it("is always safe, and so are the eight around it", () => {
    for (const seed of SEEDS) {
      for (const first of [0, at(0, 4), CENTRE, at(8, 8), at(6, 1)]) {
        const { cups } = deal(seed, first);
        expect(cups.filter(Boolean)).toHaveLength(CUPS);
        expect(cups[first]).toBe(false);
        for (const n of neighbours(first)) expect(cups[n]).toBe(false);
      }
    }
  });

  it("opens an area, never a lone number", () => {
    for (const seed of SEEDS) {
      const state = createCafe(seed);
      act(state, { step: 0, cell: at(2, 6), action: "reveal" });
      expect(state.phase).toBe("running");
      expect(state.around[at(2, 6)]).toBe(0);
      expect(state.open.filter(Boolean).length).toBeGreaterThan(9);
    }
  });

  it("lays the same table for the same seed and saucer", () => {
    expect(deal(42, CENTRE)).toEqual(deal(42, CENTRE));
    expect(deal(42, CENTRE).cups).not.toEqual(deal(43, CENTRE).cups);
    expect(deal(42, CENTRE).cups).not.toEqual(deal(42, 0).cups);
  });
});

describe("a fair table", () => {
  it("is always cleared by a solver that never guesses", () => {
    for (const seed of SEEDS) {
      const first = seed % CELLS;
      const { cups, deals } = deal(seed, first);
      expect(deals).toBeLessThan(200);
      expect(solvable(cups, first)).toBe(true);
    }
  });

  it("is dealt again when it would come down to a guess", () => {
    // A wall of cups across row 1, and the tenth somewhere in row 0: the
    // wall is found, but nothing tells which saucer of row 0 hides it
    const cups = Array<boolean>(CELLS).fill(false);
    for (let col = 0; col < COLS; col += 1) cups[at(1, col)] = true;
    cups[at(0, 3)] = true;
    expect(solvable(cups, at(8, 8))).toBe(false);
    // Some seeds needed several deals: every one kept was solvable
    expect(SEEDS.some((seed) => deal(seed, CENTRE).deals > 1)).toBe(true);
  });

  it("never turns a cup while solving any table, fair or not", () => {
    for (const seed of SEEDS) {
      // Cups anywhere but the first saucer, dealt without the retry
      const first = (seed * 31) % CELLS;
      const cups = Array<boolean>(CELLS).fill(false);
      let placed = 0;
      for (
        let cell = (seed * 17) % CELLS;
        placed < 14;
        cell = (cell + 23) % CELLS
      ) {
        if (cell !== first && !cups[cell]) {
          cups[cell] = true;
          placed += 1;
        }
      }
      expect(() => solvable(cups, first)).not.toThrow();
    }
  });
});

describe("the steam", () => {
  it("spreads from the first saucer, one wave a step, through the empty ones", () => {
    const state = createCafe(7);
    act(state, { step: 0, cell: CENTRE, action: "reveal" });
    const [event] = state.events;
    if (event?.kind !== "open") throw new Error("nothing opened");
    const wave = new Map(event.cells.map(({ cell, wave }) => [cell, wave]));
    expect(wave.get(CENTRE)).toBe(0);
    for (const { cell, wave: w } of event.cells) {
      if (cell === CENTRE) continue;
      // Reached from an empty saucer one wave closer
      expect(
        neighbours(cell).some(
          (n) => state.around[n] === 0 && wave.get(n) === w - 1,
        ),
      ).toBe(true);
    }
    // Every empty saucer turned opened all of its neighbours
    for (let cell = 0; cell < CELLS; cell += 1) {
      if (state.open[cell] && state.around[cell] === 0) {
        for (const n of neighbours(cell)) expect(state.open[n]).toBe(true);
      }
    }
  });

  it("goes round a sugared saucer", () => {
    for (const seed of SEEDS) {
      const play = player(seed);
      play.input(CENTRE);
      // An empty saucer still closed, next to a safe one
      const empty = play.state.around.findIndex(
        (count, cell) =>
          count === 0 && !play.state.open[cell] && !play.state.cups[cell],
      );
      if (empty < 0) continue;
      const blocked = neighbours(empty).find((n) => !play.state.open[n]);
      if (blocked === undefined) continue;
      play.input(blocked, "sugar");
      play.input(empty);
      expect(play.state.open[empty]).toBe(true);
      expect(play.state.open[blocked]).toBe(false);
      expect(play.state.sugar[blocked]).toBe(true);
      return;
    }
    throw new Error("no seed had a second empty area");
  });
});

describe("sugar", () => {
  it("goes on a closed saucer and comes off again, counted once put", () => {
    const play = player(3);
    play.input(CENTRE);
    const closed = play.state.open.indexOf(false);
    play.input(closed, "sugar");
    expect(play.state.sugar[closed]).toBe(true);
    expect(cupsLeft(play.state)).toBe(CUPS - 1);
    // A sugared saucer does not turn
    expect(play.input(closed)).toEqual([]);
    play.input(closed, "sugar");
    expect(play.state.sugar[closed]).toBe(false);
    expect(cupsLeft(play.state)).toBe(CUPS);
    expect(play.state.sugarsPlaced).toBe(1);
  });

  it("lets a number with all its cups sugared turn its other saucers", () => {
    for (const seed of SEEDS) {
      const play = player(seed);
      play.input(CENTRE);
      const number = play.state.around.findIndex(
        (count, cell) => count > 0 && play.state.open[cell],
      );
      const around = neighbours(number);
      const closedSafe = around.filter(
        (n) => !play.state.open[n] && !play.state.cups[n],
      );
      if (closedSafe.length === 0) continue;
      for (const n of around) if (play.state.cups[n]) play.input(n, "sugar");
      play.input(number);
      for (const n of closedSafe) expect(play.state.open[n]).toBe(true);
      return;
    }
    throw new Error("no number had a safe saucer left around it");
  });
});

describe("a run", () => {
  it("is cleared once every safe saucer is turned, its score the time", () => {
    const play = player(11);
    play.input(CENTRE);
    const start = play.state.startStep;
    clear(play);
    expect(play.state.phase).toBe("won");
    expect(play.state.events.at(-1)).toEqual({ kind: "clear" });
    expect(score(play.state)).toBe(play.state.steps - start);
    // Nothing moves once it is over
    expect(play.input(firstCup(play.state))).toEqual([]);
    expect(play.state.phase).toBe("won");
  });

  it("is lost when a cup is knocked over, with no score", () => {
    const play = player(11);
    play.input(CENTRE);
    const cup = firstCup(play.state);
    expect(play.input(cup)).toEqual([{ kind: "spill", cell: cup }]);
    expect(play.state.phase).toBe("lost");
    expect(play.state.spilled).toBe(cup);
    expect(score(play.state)).toBe(0);
  });

  it("is lost too when a wrong sugar lets a number turn a cup", () => {
    for (const seed of SEEDS) {
      const play = player(seed);
      play.input(CENTRE);
      const number = play.state.around.findIndex(
        (count, cell) => count === 1 && play.state.open[cell],
      );
      if (number < 0) continue;
      const around = neighbours(number).filter((n) => !play.state.open[n]);
      const safe = around.find((n) => !play.state.cups[n]);
      if (safe === undefined) continue;
      play.input(safe, "sugar");
      play.input(number);
      expect(play.state.phase).toBe("lost");
      return;
    }
    throw new Error("no 1 had a safe saucer beside its cup");
  });
});

describe("the petit café", () => {
  it("turns the safe saucer nearest the one asked, once, for 10 seconds", () => {
    const play = player(5);
    play.input(CENTRE);
    const near = play.state.open.indexOf(false);
    const events = play.input(near, "hint");
    const served = events.find((event) => event.kind === "hint");
    if (served?.kind !== "hint") throw new Error("no petit café");
    expect(play.state.cups[served.cell]).toBe(false);
    expect(play.state.open[served.cell]).toBe(true);
    if (!play.state.cups[near]) expect(served.cell).toBe(near);
    // Only one a run
    expect(play.input(near, "hint")).toEqual([]);
    clear(play);
    expect(play.state.phase).toBe("won");
    expect(score(play.state)).toBe(
      play.state.steps - play.state.startStep + HINT_STEPS,
    );
    expect(elapsed(play.state)).toBe(score(play.state));
  });

  it("can clear the table with the last safe saucer", () => {
    const play = player(9);
    play.input(CENTRE);
    const left = () =>
      Array.from({ length: CELLS }, (_, cell) => cell).filter(
        (cell) => !play.state.open[cell] && !play.state.cups[cell],
      );
    while (left().length > 1) play.input(left()[0]);
    play.input(0, "hint");
    expect(play.state.phase).toBe("won");
  });
});

describe("a replay", () => {
  it("plays a cleared run again to the same time", () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const play = player(seed);
      play.input(at(seed % ROWS, 2));
      play.input(play.state.open.indexOf(false), "hint");
      clear(play);
      const replayed = replayCafe(seed, play.inputs);
      expect(replayed?.phase).toBe("won");
      expect(score(replayed!)).toBe(score(play.state));
      expect(replayed?.steps).toBe(play.state.steps);
    }
  });

  it("plays a spilled run again to the spill, and ignores what follows", () => {
    const play = player(21);
    play.input(CENTRE);
    play.input(firstCup(play.state));
    const replayed = replayCafe(21, [
      ...play.inputs,
      { step: 99999, cell: 0, action: "reveal" },
    ]);
    expect(replayed?.phase).toBe("lost");
    expect(score(replayed!)).toBe(0);
  });

  it("refuses inputs out of order, too close, unknown or unfinished", () => {
    const play = player(4);
    play.input(CENTRE);
    clear(play);
    const { inputs } = play;
    const [a, b] = inputs;
    expect(replayCafe(4, [b, a, ...inputs.slice(2)])).toBeNull();
    expect(
      replayCafe(4, [a, { ...b, step: a.step + MIN_INPUT_GAP - 1 }]),
    ).toBeNull();
    expect(replayCafe(4, [{ ...a, cell: CELLS }])).toBeNull();
    expect(replayCafe(4, [{ ...a, cell: 1.5 }])).toBeNull();
    expect(
      replayCafe(4, [{ ...a, action: "explode" as CafeInput["action"] }]),
    ).toBeNull();
    expect(replayCafe(4, inputs.slice(0, -1))).toBeNull();
    expect(replayCafe(4, [])).toBeNull();
    // The same inputs on another seed lay another table
    expect(score(replayCafe(5, inputs) ?? createCafe(5))).not.toBe(
      score(play.state),
    );
  });
});
