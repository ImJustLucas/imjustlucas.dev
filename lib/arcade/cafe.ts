import { random } from "@/lib/arcade/run";

/**
 * Café, the third cabinet of the Arcade (DESIGN.md, Arcade): a minesweeper
 * on a Paris café terrace. A grid of upturned saucers lies on the table,
 * and under some of them waits a knocked-over cup; revealing one spills the
 * coffee and ends the run. A saucer with no cup shows how many cups stand
 * around it, in latte art; a sugar cube marks a saucer the player thinks
 * hides a cup. The run is the time it takes to clear the table: lower is
 * better. Plain game logic, no browser and no React. The cabinet only draws
 * it.
 *
 * Every run is fair: the first saucer turned is always safe, and so are the
 * eight around it, and the table is only laid once a solver that never
 * guesses clears it from there (`deal`), so it never comes down to a coin
 * toss. The table follows from the seed and the first saucer turned, so the
 * server can replay it.
 *
 * Café is played turn by turn, not frame by frame: an input carries the
 * hundredth of a second (`STEP`) it landed on, counted from the press on
 * Play, and the clock starts at the first saucer turned.
 */

export const COLS = 9;
export const ROWS = 9;
export const CELLS = COLS * ROWS;
/** The cups hidden on the table. */
export const CUPS = 10;

/** One tick of the clock: inputs land on hundredths of a second. */
export const STEP = 1 / 100;
/** The petit café, once a run: a safe saucer for 10 more seconds. */
export const HINT_STEPS = 10 * 100;
/** Two inputs are at least this far apart (50ms): a hand is not faster. */
export const MIN_INPUT_GAP = 5;
/** The longest run a replay plays out: an hour. */
export const MAX_RUN_STEPS = 60 * 60 * 100;
/** Tables dealt at most before one is kept; one is always found far sooner. */
export const MAX_DEALS = 5000;

export const CAFE_ACTIONS = ["reveal", "sugar", "hint"] as const;
export type CafeAction = (typeof CAFE_ACTIONS)[number];

/**
 * An input at the hundredth the run had reached: `reveal` turns a saucer
 * (or, on a number with as many sugars around it, turns its neighbours),
 * `sugar` puts a cube on a saucer or takes it off, `hint` serves the petit
 * café nearest `cell`. A run is its seed and these inputs.
 */
export type CafeInput = {
  readonly step: number;
  readonly cell: number;
  readonly action: CafeAction;
};

export type Phase = "ready" | "running" | "won" | "lost";

/** A saucer turned, and how far the steam had to spread to reach it. */
export type Opened = { readonly cell: number; readonly wave: number };

/** What an input did, for the cabinet to sound and draw. */
export type CafeEvent =
  | { readonly kind: "open"; readonly cells: ReadonlyArray<Opened> }
  | { readonly kind: "sugar"; readonly cell: number; readonly on: boolean }
  | { readonly kind: "hint"; readonly cell: number }
  | { readonly kind: "spill"; readonly cell: number }
  | { readonly kind: "clear" };

export type CafeState = {
  phase: Phase;
  /** The seed the table is dealt from. */
  readonly seed: number;
  /** Where a cup hides, by cell (row by row); all false until dealt. */
  cups: boolean[];
  /** How many cups stand around each cell. */
  around: number[];
  open: boolean[];
  sugar: boolean[];
  /** The step of the first saucer turned, when the clock started. */
  startStep: number;
  /** The step of the last input. */
  steps: number;
  /** Whether the petit café was served. */
  hinted: boolean;
  /** Sugar cubes put down over the run, taken off again or not. */
  sugarsPlaced: number;
  /** The saucer that hid the cup knocked over. */
  spilled: number | null;
  /** What the last input did. */
  events: CafeEvent[];
};

export const rowOf = (cell: number) => Math.floor(cell / COLS);
export const colOf = (cell: number) => cell % COLS;

/** The cells around `cell`, up to eight. */
export const neighbours = (cell: number): number[] => {
  const row = rowOf(cell);
  const col = colOf(cell);
  const around: number[] = [];
  for (let r = row - 1; r <= row + 1; r += 1) {
    for (let c = col - 1; c <= col + 1; c += 1) {
      if (
        (r !== row || c !== col) &&
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS
      ) {
        around.push(r * COLS + c);
      }
    }
  }
  return around;
};

const isCell = (cell: number) =>
  Number.isSafeInteger(cell) && cell >= 0 && cell < CELLS;

const countAround = (cups: ReadonlyArray<boolean>) =>
  Array.from(
    { length: CELLS },
    (_, cell) => neighbours(cell).filter((n) => cups[n]).length,
  );

/**
 * Turns `cell` and, from a saucer with no cup around it, every saucer
 * reached through more of them: the empty area opens as steam spreads.
 * Returns the cells turned with how many steps of steam each took.
 */
const flood = (
  open: boolean[],
  around: ReadonlyArray<number>,
  blocked: ReadonlyArray<boolean>,
  cell: number,
): Opened[] => {
  const opened: Opened[] = [{ cell, wave: 0 }];
  open[cell] = true;
  for (let at = 0; at < opened.length; at += 1) {
    const { cell: from, wave } = opened[at];
    if (around[from] !== 0) continue;
    for (const next of neighbours(from)) {
      if (open[next] || blocked[next]) continue;
      open[next] = true;
      opened.push({ cell: next, wave: wave + 1 });
    }
  }
  return opened;
};

/**
 * Whether a player who never guesses clears the table from `first`. The
 * solver reads only what a player sees (the numbers turned, the cups left)
 * and, round after round, applies what they would: a number with all its
 * cups found frees its other saucers, a number with as many saucers left as
 * cups missing marks them all, two numbers sharing saucers settle the ones
 * only one of them sees, and the count of cups left settles the rest. When
 * a round settles nothing and saucers are left, the table needs a guess.
 */
export const solvable = (
  cups: ReadonlyArray<boolean>,
  first: number,
): boolean => {
  if (cups[first]) return false;
  const around = countAround(cups);
  const open = Array<boolean>(CELLS).fill(false);
  const marked = Array<boolean>(CELLS).fill(false);
  const safeCells = CELLS - cups.filter(Boolean).length;
  let opened = flood(open, around, marked, first).length;

  const turnSafe = (cell: number) => {
    if (open[cell] || marked[cell]) return false;
    // The solver only ever turns a saucer it proved safe
    if (cups[cell]) throw new Error("The solver guessed");
    opened += flood(open, around, marked, cell).length;
    return true;
  };
  const mark = (cell: number) => {
    if (marked[cell] || open[cell]) return false;
    marked[cell] = true;
    return true;
  };

  while (opened < safeCells) {
    let progress = false;
    // What each number still says: the saucers it sees, and the cups among them
    const constraints: { cells: number[]; cups: number }[] = [];
    for (let cell = 0; cell < CELLS; cell += 1) {
      if (!open[cell] || around[cell] === 0) continue;
      const unknown = neighbours(cell).filter((n) => !open[n] && !marked[n]);
      if (unknown.length === 0) continue;
      const missing =
        around[cell] - neighbours(cell).filter((n) => marked[n]).length;
      if (missing === 0) {
        for (const n of unknown) progress = turnSafe(n) || progress;
      } else if (missing === unknown.length) {
        for (const n of unknown) progress = mark(n) || progress;
      } else {
        constraints.push({ cells: unknown, cups: missing });
      }
    }
    if (progress) continue;

    // Two numbers sharing saucers
    for (const a of constraints) {
      for (const b of constraints) {
        if (a === b) continue;
        const both = a.cells.filter((n) => b.cells.includes(n));
        if (both.length === 0) continue;
        const onlyA = a.cells.filter((n) => !both.includes(n));
        const onlyB = b.cells.filter((n) => !both.includes(n));
        // The cups the shared saucers can hold, at least and at most
        const least = Math.max(0, a.cups - onlyA.length, b.cups - onlyB.length);
        const most = Math.min(both.length, a.cups, b.cups);
        if (onlyB.length > 0 && b.cups - least === 0) {
          for (const n of onlyB) progress = turnSafe(n) || progress;
        } else if (onlyB.length > 0 && b.cups - most === onlyB.length) {
          for (const n of onlyB) progress = mark(n) || progress;
        }
      }
      if (progress) break;
    }
    if (progress) continue;

    // The cups left
    const unknown = Array.from({ length: CELLS }, (_, cell) => cell).filter(
      (cell) => !open[cell] && !marked[cell],
    );
    const left = cups.filter(Boolean).length - marked.filter(Boolean).length;
    if (left === 0) {
      for (const n of unknown) turnSafe(n);
      continue;
    }
    if (left === unknown.length) {
      for (const n of unknown) mark(n);
      continue;
    }
    return false;
  }
  return true;
};

/**
 * Lays the cups for a run of `seed` whose first saucer turned is `first`:
 * never on it nor around it, and dealt again from the seed until the solver
 * clears the table without a guess. The same seed and first saucer always
 * lay the same table; `deals` is how many it took.
 */
export const deal = (seed: number, first: number) => {
  const keepClear = new Set([first, ...neighbours(first)]);
  const free = Array.from({ length: CELLS }, (_, cell) => cell).filter(
    (cell) => !keepClear.has(cell),
  );
  let state = seed | 0;
  let cups: boolean[] = [];
  for (let deals = 1; deals <= MAX_DEALS; deals += 1) {
    // A partial Fisher-Yates shuffle of the free cells
    const pool = [...free];
    cups = Array<boolean>(CELLS).fill(false);
    for (let i = 0; i < CUPS; i += 1) {
      const [value, next] = random(state);
      state = next;
      const at = i + Math.floor(value * (pool.length - i));
      [pool[i], pool[at]] = [pool[at], pool[i]];
      cups[pool[i]] = true;
    }
    if (solvable(cups, first)) return { cups, deals };
  }
  return { cups, deals: MAX_DEALS };
};

/** A new run, waiting for its first saucer. */
export const createCafe = (seed: number): CafeState => ({
  phase: "ready",
  seed: seed | 0,
  cups: Array<boolean>(CELLS).fill(false),
  around: Array<number>(CELLS).fill(0),
  open: Array<boolean>(CELLS).fill(false),
  sugar: Array<boolean>(CELLS).fill(false),
  startStep: 0,
  steps: 0,
  hinted: false,
  sugarsPlaced: 0,
  spilled: null,
  events: [],
});

const safeLeft = (state: CafeState) =>
  state.open.filter((open, cell) => !open && !state.cups[cell]).length;

/** Turns saucers; a cup among them is knocked over, else the table may clear. */
const turn = (state: CafeState, cells: ReadonlyArray<number>) => {
  const spilled = cells.find((cell) => state.cups[cell]);
  if (spilled !== undefined) {
    state.open[spilled] = true;
    state.spilled = spilled;
    state.phase = "lost";
    state.events.push({ kind: "spill", cell: spilled });
    return;
  }
  const opened: Opened[] = [];
  for (const cell of cells) {
    if (state.open[cell]) continue;
    opened.push(...flood(state.open, state.around, state.sugar, cell));
  }
  if (opened.length > 0) state.events.push({ kind: "open", cells: opened });
  if (safeLeft(state) === 0) {
    state.phase = "won";
    state.events.push({ kind: "clear" });
  }
};

const reveal = (state: CafeState, cell: number) => {
  if (state.sugar[cell]) return;
  if (state.phase === "ready") {
    state.cups = deal(state.seed, cell).cups;
    state.around = countAround(state.cups);
    state.startStep = state.steps;
    state.phase = "running";
    turn(state, [cell]);
    return;
  }
  if (!state.open[cell]) {
    turn(state, [cell]);
    return;
  }
  // On a number with as many sugars around it: the other saucers around
  const around = neighbours(cell);
  const sugars = around.filter((n) => state.sugar[n]).length;
  if (state.around[cell] === 0 || sugars !== state.around[cell]) return;
  const closed = around.filter((n) => !state.open[n] && !state.sugar[n]);
  if (closed.length > 0) turn(state, closed);
};

const sugar = (state: CafeState, cell: number) => {
  if (state.phase !== "running" || state.open[cell]) return;
  const on = !state.sugar[cell];
  state.sugar[cell] = on;
  if (on) state.sugarsPlaced += 1;
  state.events.push({ kind: "sugar", cell, on });
};

/** The squared distance between two cells. */
const distance = (a: number, b: number) =>
  (rowOf(a) - rowOf(b)) ** 2 + (colOf(a) - colOf(b)) ** 2;

/**
 * The petit café, once a run: turns the safe saucer nearest `near` (one
 * without sugar if there is one, the lowest cell on a tie) and adds
 * `HINT_STEPS` to the time.
 */
const hint = (state: CafeState, near: number) => {
  if (state.phase !== "running" || state.hinted) return;
  const safe = Array.from({ length: CELLS }, (_, cell) => cell).filter(
    (cell) => !state.open[cell] && !state.cups[cell],
  );
  const bare = safe.filter((cell) => !state.sugar[cell]);
  const choices = bare.length > 0 ? bare : safe;
  const cell = choices.reduce((best, cell) =>
    distance(cell, near) < distance(best, near) ? cell : best,
  );
  state.hinted = true;
  state.sugar[cell] = false;
  state.events.push({ kind: "hint", cell });
  turn(state, [cell]);
};

/**
 * Plays one input, at its step. `state.events` then lists what it did;
 * empty when it did nothing (a sugared saucer turned, a second petit café,
 * anything once the run is over), and such an input is not worth keeping.
 */
export const act = (state: CafeState, input: CafeInput) => {
  state.events = [];
  if (state.phase === "won" || state.phase === "lost") return state;
  if (!isCell(input.cell)) return state;
  const before = state.steps;
  state.steps = Math.max(state.steps, input.step);
  if (input.action === "reveal") reveal(state, input.cell);
  else if (input.action === "sugar") sugar(state, input.cell);
  else hint(state, input.cell);
  if (state.events.length === 0) state.steps = before;
  return state;
};

/** Cups left to find: the cups, less the sugars on the table. */
export const cupsLeft = (state: CafeState) =>
  CUPS - state.sugar.filter(Boolean).length;

/**
 * The run's time in hundredths, from the first saucer turned to `step` (the
 * last input by default), with the petit café's 10 seconds.
 */
export const elapsed = (state: CafeState, step = state.steps) =>
  state.phase === "ready"
    ? 0
    : Math.max(0, step - state.startStep) + (state.hinted ? HINT_STEPS : 0);

/** The run's score, its clear time in hundredths; 0 unless cleared. */
export const score = (state: CafeState) =>
  state.phase === "won" ? elapsed(state) : 0;

/**
 * Plays a run again from its seed and inputs, as the cabinet played it, and
 * returns the finished run, cleared or spilled; null when the inputs are out
 * of order, closer than `MIN_INPUT_GAP`, past `MAX_RUN_STEPS`, not a known
 * action or cell, or the run never ends. Inputs after the end are ignored.
 */
export const replayCafe = (
  seed: number,
  inputs: ReadonlyArray<CafeInput>,
): CafeState | null => {
  const state = createCafe(seed);
  let last: number | null = null;
  for (const input of inputs) {
    if (state.phase === "won" || state.phase === "lost") break;
    if (!Number.isSafeInteger(input.step) || input.step > MAX_RUN_STEPS) {
      return null;
    }
    if (input.step < (last === null ? 0 : last + MIN_INPUT_GAP)) return null;
    if (!isCell(input.cell) || !CAFE_ACTIONS.includes(input.action)) {
      return null;
    }
    last = input.step;
    act(state, input);
  }
  return state.phase === "won" || state.phase === "lost" ? state : null;
};
