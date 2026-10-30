import { random } from "@/lib/arcade/run";

/**
 * Merge, the fourth cabinet of the Arcade (DESIGN.md, Arcade): a 2048 in
 * git. Tiles on a 4 by 4 board slide all the way in the direction played,
 * and two of the same value meeting merge into one of twice the value,
 * once per move: a typo fix and a typo fix make a commit, two commits a
 * branch, and so on up to 2048, v2.0, the release. Plain game logic, no
 * browser and no React. The cabinet only draws it.
 *
 * After every move that moves something, a new tile lands on an empty cell
 * from the seed (a 2, one time in ten a 4), so the same seed and moves
 * always make the same board, and the server can replay the run. The run
 * ends when no move is left; reaching 2048 does not end it.
 *
 * Merge is played turn by turn, like Café: an input is a move at the
 * hundredth of a second (`STEP`) it landed on, counted from the press on
 * Play.
 */

export const SIZE = 4;
export const CELLS = SIZE * SIZE;
/** The tile that ships the release: v2.0. */
export const GOAL = 2048;
/** How often a new tile is a 4 rather than a 2. */
export const FOUR_CHANCE = 0.1;

/** One tick of the clock: inputs land on hundredths of a second. */
export const STEP = 1 / 100;
/** Two moves are at least this far apart (50ms): a hand is not faster. */
export const MIN_INPUT_GAP = 5;
/** The longest run a replay plays out: three hours, as long as a run stays open. */
export const MAX_RUN_STEPS = 3 * 60 * 60 * 100;
/** The most moves a run may send: far past a 32768 tile (about 16,000). */
export const MAX_MOVES = 20_000;

export const MOVES = ["up", "down", "left", "right"] as const;
export type Move = (typeof MOVES)[number];

/** A move at the hundredth the run had reached. A run is its seed and these. */
export type MergeInput = { readonly step: number; readonly move: Move };

export type Phase = "running" | "over";

/** A tile going from one cell to another, into a merge or not. */
export type Slide = {
  readonly id: number;
  readonly from: number;
  readonly to: number;
};

/** What a move did, for the cabinet to sound and draw. */
export type MergeEvent =
  | { readonly kind: "slide"; readonly slides: ReadonlyArray<Slide> }
  /** Two tiles merged into a new one, `id`, at `cell`. */
  | {
      readonly kind: "merge";
      readonly id: number;
      readonly cell: number;
      readonly value: number;
    }
  | {
      readonly kind: "spawn";
      readonly id: number;
      readonly cell: number;
      readonly value: number;
    }
  /** The first 2048 of the run: the release shipped. */
  | { readonly kind: "shipped" }
  | { readonly kind: "over" };

export type MergeState = {
  phase: Phase;
  /** The seed the run was handed out with. */
  readonly seed: number;
  /** The generator's state, where the next tile comes from. */
  rng: number;
  /** Each cell's value, row by row; 0 when empty. */
  values: number[];
  /** Each cell's tile, for the cabinet to follow it; 0 when empty. */
  ids: number[];
  nextId: number;
  /** The sum of every merge's value. */
  score: number;
  /** Moves that moved something. */
  moves: number;
  /** The step of the last move. */
  steps: number;
  /** The biggest tile reached. */
  top: number;
  /** Whether 2048 was reached. */
  shipped: boolean;
  /** What the last move did. */
  events: MergeEvent[];
};

export const rowOf = (cell: number) => Math.floor(cell / SIZE);
export const colOf = (cell: number) => cell % SIZE;

/** The board's lines as a move pushes them, each from the edge it goes to. */
const lines = (move: Move): number[][] =>
  Array.from({ length: SIZE }, (_, line) =>
    Array.from({ length: SIZE }, (_, at) => {
      if (move === "left") return line * SIZE + at;
      if (move === "right") return line * SIZE + (SIZE - 1 - at);
      if (move === "up") return at * SIZE + line;
      return (SIZE - 1 - at) * SIZE + line;
    }),
  );

/**
 * A board after `move`, with no new tile: every tile slides to the edge,
 * and two of the same value meeting merge, the pair nearest the edge first,
 * a tile merging at most once a move (2 2 2 2 makes 4 4, never 8).
 * `merged` lists the cells holding a merged tile, `gained` their sum.
 */
export const slideBoard = (values: ReadonlyArray<number>, move: Move) => {
  const next = Array<number>(CELLS).fill(0);
  const slides: { from: number; to: number }[] = [];
  const merged: number[] = [];
  let gained = 0;
  for (const line of lines(move)) {
    // What lands on the line, from its edge, and whether it merged yet
    const out: { value: number; merged: boolean }[] = [];
    for (const cell of line) {
      const value = values[cell];
      if (value === 0) continue;
      const last = out.at(-1);
      if (last && !last.merged && last.value === value) {
        last.value *= 2;
        last.merged = true;
        gained += last.value;
      } else {
        out.push({ value, merged: false });
      }
      slides.push({ from: cell, to: line[out.length - 1] });
    }
    out.forEach(({ value, merged: done }, at) => {
      next[line[at]] = value;
      if (done) merged.push(line[at]);
    });
  }
  const moved = merged.length > 0 || slides.some(({ from, to }) => from !== to);
  return { values: next, slides, merged, gained, moved };
};

/** Whether any move is left: an empty cell, or two equal neighbours. */
export const canMove = (values: ReadonlyArray<number>) =>
  values.some(
    (value, cell) =>
      value === 0 ||
      (colOf(cell) < SIZE - 1 && values[cell + 1] === value) ||
      (rowOf(cell) < SIZE - 1 && values[cell + SIZE] === value),
  );

/** A new tile on an empty cell, from the seed: a 2, or now and then a 4. */
const spawn = (state: MergeState) => {
  const empty = state.values.flatMap((value, cell) =>
    value === 0 ? [cell] : [],
  );
  if (empty.length === 0) return;
  const [where, afterWhere] = random(state.rng);
  const [kind, afterKind] = random(afterWhere);
  state.rng = afterKind;
  const cell = empty[Math.floor(where * empty.length)];
  const value = kind < FOUR_CHANCE ? 4 : 2;
  const id = state.nextId;
  state.nextId += 1;
  state.values[cell] = value;
  state.ids[cell] = id;
  state.top = Math.max(state.top, value);
  state.events.push({ kind: "spawn", id, cell, value });
};

/** A new run: two tiles on the board, its `events` their spawns. */
export const createMerge = (seed: number): MergeState => {
  const state: MergeState = {
    phase: "running",
    seed: seed | 0,
    rng: seed | 0,
    values: Array<number>(CELLS).fill(0),
    ids: Array<number>(CELLS).fill(0),
    nextId: 1,
    score: 0,
    moves: 0,
    steps: 0,
    top: 0,
    shipped: false,
    events: [],
  };
  spawn(state);
  spawn(state);
  return state;
};

/**
 * Plays one move, at its step. `state.events` then lists what it did;
 * empty when nothing could move that way (or the run is over), and such a
 * move is not worth keeping.
 */
export const act = (state: MergeState, input: MergeInput) => {
  state.events = [];
  if (state.phase === "over" || !MOVES.includes(input.move)) return state;
  const played = slideBoard(state.values, input.move);
  if (!played.moved) return state;

  const ids = Array<number>(CELLS).fill(0);
  const slides = played.slides.map(({ from, to }) => {
    ids[to] = state.ids[from];
    return { id: state.ids[from], from, to };
  });
  state.events.push({ kind: "slide", slides });
  for (const cell of played.merged) {
    ids[cell] = state.nextId;
    state.nextId += 1;
    state.top = Math.max(state.top, played.values[cell]);
    state.events.push({
      kind: "merge",
      id: ids[cell],
      cell,
      value: played.values[cell],
    });
  }
  state.values = played.values;
  state.ids = ids;
  state.score += played.gained;
  state.moves += 1;
  state.steps = Math.max(state.steps, input.step);
  spawn(state);

  if (!state.shipped && state.top >= GOAL) {
    state.shipped = true;
    state.events.push({ kind: "shipped" });
  }
  if (!canMove(state.values)) {
    state.phase = "over";
    state.events.push({ kind: "over" });
  }
  return state;
};

/** The run's score: the sum of every merge's value, as in the classic. */
export const score = (state: MergeState) => state.score;

/**
 * Plays a run again from its seed and moves, as the cabinet played it, and
 * returns it once no move is left; null when the inputs are out of order,
 * closer than `MIN_INPUT_GAP`, past `MAX_RUN_STEPS` or `MAX_MOVES`, not a
 * move, a move that moves nothing (the cabinet never keeps one), or the
 * run is not over. Inputs after the end are ignored.
 */
export const replayMerge = (
  seed: number,
  inputs: ReadonlyArray<MergeInput>,
): MergeState | null => {
  if (inputs.length > MAX_MOVES) return null;
  const state = createMerge(seed);
  let last: number | null = null;
  for (const input of inputs) {
    if (state.phase === "over") break;
    if (!Number.isSafeInteger(input.step) || input.step > MAX_RUN_STEPS) {
      return null;
    }
    if (input.step < (last === null ? 0 : last + MIN_INPUT_GAP)) return null;
    if (!MOVES.includes(input.move)) return null;
    last = input.step;
    act(state, input);
    if (state.events.length === 0) return null;
  }
  return state.phase === "over" ? state : null;
};
