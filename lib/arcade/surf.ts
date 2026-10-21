import { random } from "@/lib/arcade/run";

/**
 * Surf, the second cabinet of the Arcade (DESIGN.md, Arcade): Lucas rides
 * the swell and a press pops him off it, Flappy Bird on a surfboard. Every
 * gate is a rock or a buoy rising from the sea under a jetty piling or a
 * flock of gulls coming down from the sky, and he must fly through the gap
 * between them. Plain game logic, no browser and no React: physics,
 * collisions, scoring and the seeded gates. The cabinet only draws it.
 *
 * The world is 720 by 405 units (16:9), y pointing down, the sea's surface
 * at `WORLD.sea`. Time is in seconds; `advance` runs fixed steps of `STEP`.
 */

export const WORLD = { width: 720, height: 405, sea: 336 } as const;

/** Lucas's hitbox, a little smaller than his drawing so near misses count. */
export const PLAYER = { x: 118, width: 42, height: 66 } as const;

/** One fixed step of the simulation. */
export const STEP = 1 / 120;
/** The longest frame `advance` catches up on: a hidden tab never jumps ahead. */
export const MAX_FRAME = 0.25;

export const GRAVITY = 1900;
/** A press sets his upward speed to this: about 58 units higher, every time. */
export const POP_VELOCITY = 470;
/** He never falls faster than this. */
export const MAX_FALL = 760;
/** The highest his board can fly: his head stays under the top of the screen. */
export const CEILING = WORLD.sea - PLAYER.height - 8;

export const START_SPEED = 200;
export const MAX_SPEED = 300;
/** Speed gained every second of the run. */
export const ACCELERATION = 2.5;

/** A milestone sounds every this many gates. */
export const MILESTONE = 10;

export type LowKind = "rock" | "buoy";
export type HighKind = "piling" | "gulls";

/** How wide each obstacle is; its height is the gate's. */
export const OBSTACLE_WIDTH: Readonly<Record<LowKind | HighKind, number>> = {
  rock: 68,
  buoy: 40,
  piling: 46,
  gulls: 58,
};

/** The gap of the first gate, narrowing as the gates go by, to `MIN_GAP`. */
export const START_GAP = 174;
export const MIN_GAP = 146;
/** How much each gate passed narrows the next gap. */
export const GAP_SHRINK = 1.2;
/** The lowest a gap's floor sits above the sea, and its ceiling under the top. */
export const LOW_MIN = 36;
export const HIGH_MIN = 34;
/** The most a gap's floor moves from one gate to the next, up or down. */
export const MAX_SHIFT = 100;
/** Sea between two gates' centres: this, plus up to `SPACING_SPREAD`. */
export const SPACING = 290;
export const SPACING_SPREAD = 90;

export type Gate = {
  /** Centre, in world units from the screen's left. */
  x: number;
  readonly low: LowKind;
  readonly high: HighKind;
  /** The gap's floor and ceiling, in units above the sea. */
  readonly floor: number;
  readonly ceiling: number;
  /** Whether Lucas is past it. */
  passed: boolean;
};

export type Phase = "ready" | "running" | "over";

/** What happened during a frame, for the cabinet to sound and draw. */
export type SurfEvent = "pop" | "land" | "gate" | "milestone" | "crash";

export type SurfState = {
  phase: Phase;
  /** Seconds since the run started. */
  time: number;
  /** Sea units ridden. */
  distance: number;
  speed: number;
  /** Gates passed: the score. */
  gates: number;
  player: {
    /** Height of his board above the sea. */
    lift: number;
    /** Upward speed. */
    velocity: number;
    /** On the swell, riding. */
    riding: boolean;
  };
  obstacles: Gate[];
  /** Sea units left before the next gate. */
  untilNext: number;
  /** The last gate's floor, so the next one stays within reach. */
  lastFloor: number;
  /** State of the seeded random generator. */
  seed: number;
  /** Time not yet simulated, below one step. */
  lag: number;
  /** Fixed steps run so far: where a press lands in a recorded run. */
  steps: number;
  /** What happened during the last `advance`. */
  events: SurfEvent[];
};

const draw = (state: SurfState) => {
  const [value, seed] = random(state.seed);
  state.seed = seed;
  return value;
};

/** A new run, waiting for the first press. The same seed lays the same gates. */
export const createSurf = (seed: number): SurfState => ({
  phase: "ready",
  time: 0,
  distance: 0,
  speed: START_SPEED,
  gates: 0,
  player: { lift: 0, velocity: 0, riding: true },
  obstacles: [],
  // A clear stretch of sea before the first gate
  untilNext: WORLD.width * 0.75,
  lastFloor: LOW_MIN,
  seed: seed | 0,
  lag: 0,
  steps: 0,
  events: [],
});

/** The run's score: the gates passed. */
export const score = (state: SurfState) => state.gates;

/** The gap of the next gate after `passed` gates. */
export const gapAt = (passed: number) =>
  Math.max(MIN_GAP, START_GAP - passed * GAP_SHRINK);

/** What can rise and come down, by score: the sea gets busier as it goes. */
export const kindsAt = (
  points: number,
): {
  readonly low: ReadonlyArray<LowKind>;
  readonly high: ReadonlyArray<HighKind>;
} => {
  if (points < 5) return { low: ["rock"], high: ["piling"] };
  if (points < 15) return { low: ["rock", "buoy"], high: ["piling"] };
  return { low: ["rock", "buoy"], high: ["piling", "gulls"] };
};

/**
 * Where the next gap's floor can sit: above the sea, under the sky, and
 * within `MAX_SHIFT` of the last one.
 */
export const floorRange = (gap: number, last: number) => {
  const top = WORLD.sea - HIGH_MIN - gap;
  return {
    min: Math.min(Math.max(LOW_MIN, last - MAX_SHIFT), top),
    max: Math.min(top, last + MAX_SHIFT),
  };
};

const pick = <T>(state: SurfState, items: ReadonlyArray<T>) =>
  items[Math.floor(draw(state) * items.length)];

const spawn = (state: SurfState) => {
  const kinds = kindsAt(state.gates);
  const low = pick(state, kinds.low);
  const high = pick(state, kinds.high);
  // The gates already on the sea count, so the gap narrows in order
  const gap = gapAt(state.gates + state.obstacles.length);
  const range = floorRange(gap, state.lastFloor);
  const floor = Math.round(range.min + draw(state) * (range.max - range.min));
  const width = Math.max(OBSTACLE_WIDTH[low], OBSTACLE_WIDTH[high]);
  state.obstacles.push({
    x: WORLD.width + width,
    low,
    high,
    floor,
    ceiling: floor + gap,
    passed: false,
  });
  state.lastFloor = floor;
  state.untilNext = SPACING + draw(state) * SPACING_SPREAD;
};

const pop = (state: SurfState) => {
  state.player.velocity = POP_VELOCITY;
  state.player.riding = false;
  state.events.push("pop");
};

/** A press: starts the run, or pops him up, on the swell or in the air. */
export const press = (state: SurfState) => {
  if (state.phase === "over") return;
  if (state.phase === "ready") state.phase = "running";
  pop(state);
};

type Box = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
};

/** Lucas's hitbox, in world units (y down). */
export const playerBox = (state: SurfState): Box => ({
  left: PLAYER.x,
  right: PLAYER.x + PLAYER.width,
  top: WORLD.sea - state.player.lift - PLAYER.height,
  bottom: WORLD.sea - state.player.lift,
});

/** How far each hitbox sits inside its drawing, so a graze is forgiven. */
const INSET = 5;

/** The rock or buoy under the gap, in world units, a little forgiving. */
export const lowBox = (gate: Gate): Box => {
  const half = OBSTACLE_WIDTH[gate.low] / 2;
  return {
    left: gate.x - half + INSET,
    right: gate.x + half - INSET,
    top: WORLD.sea - gate.floor + INSET,
    bottom: WORLD.height,
  };
};

/** The piling or gulls over the gap, in world units, a little forgiving. */
export const highBox = (gate: Gate): Box => {
  const half = OBSTACLE_WIDTH[gate.high] / 2;
  return {
    left: gate.x - half + INSET,
    right: gate.x + half - INSET,
    top: -WORLD.height,
    bottom: WORLD.sea - gate.ceiling - INSET,
  };
};

export const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/** One fixed step of a running game. */
const step = (state: SurfState) => {
  const dt = STEP;
  const { player } = state;

  state.steps += 1;
  state.time += dt;
  state.speed = Math.min(MAX_SPEED, state.speed + ACCELERATION * dt);
  const moved = state.speed * dt;
  state.distance += moved;

  // Lucas
  if (!player.riding) {
    player.velocity = Math.max(-MAX_FALL, player.velocity - GRAVITY * dt);
    player.lift += player.velocity * dt;
    if (player.lift >= CEILING) {
      player.lift = CEILING;
      player.velocity = Math.min(player.velocity, 0);
    }
    if (player.lift <= 0) {
      player.lift = 0;
      player.velocity = 0;
      player.riding = true;
      state.events.push("land");
    }
  }

  // The sea goes by
  for (const gate of state.obstacles) gate.x -= moved;
  state.obstacles = state.obstacles.filter((gate) => gate.x > -80);
  state.untilNext -= moved;
  if (state.untilNext <= 0) spawn(state);

  // Gates passed, then the crash
  const box = playerBox(state);
  for (const gate of state.obstacles) {
    const width = Math.max(OBSTACLE_WIDTH[gate.low], OBSTACLE_WIDTH[gate.high]);
    if (!gate.passed && gate.x + width / 2 < box.left) {
      gate.passed = true;
      state.gates += 1;
      state.events.push(state.gates % MILESTONE === 0 ? "milestone" : "gate");
    }
  }
  if (
    state.obstacles.some(
      (gate) => overlaps(box, lowBox(gate)) || overlaps(box, highBox(gate)),
    )
  ) {
    state.phase = "over";
    state.events.push("crash");
  }
};

/**
 * Moves the game on by a frame's elapsed seconds in fixed steps, so it plays
 * the same at any frame rate; a frame longer than `MAX_FRAME` (a hidden tab,
 * a hitch) only counts as `MAX_FRAME`. `state.events` then lists what
 * happened during the frame.
 */
export const advance = (state: SurfState, elapsed: number) => {
  state.events = [];
  if (state.phase !== "running") return state;
  state.lag += Math.min(Math.max(elapsed, 0), MAX_FRAME);
  while (state.lag >= STEP && state.phase === "running") {
    state.lag -= STEP;
    step(state);
  }
  return state;
};

/**
 * A press at the step the run had reached: a run is its seed and these
 * presses, so the server can replay it. The leaderboard's inputs also carry
 * releases, for Ollie; Surf has nothing to do on one and skips it.
 */
export type SurfInput = { readonly step: number; readonly press: boolean };

/** The longest run a replay plays out: 30 minutes. */
export const MAX_RUN_STEPS = 30 * 60 * 120;

/**
 * Plays a run again from its seed and presses, step for step as the cabinet
 * played it, and returns the finished run; null when the inputs are out of
 * order or the run never ends in a crash. Inputs after the crash are ignored.
 */
export const replaySurf = (
  seed: number,
  inputs: ReadonlyArray<SurfInput>,
): SurfState | null => {
  const state = createSurf(seed);
  let at = 0;
  for (const input of inputs) {
    if (!Number.isSafeInteger(input.step) || input.step < at) return null;
    at = input.step;
    while (state.phase === "running" && state.steps < input.step) step(state);
    if (state.phase === "over") break;
    if (state.steps !== input.step) return null;
    if (input.press) press(state);
  }
  while (state.phase === "running" && state.steps < MAX_RUN_STEPS) step(state);
  return state.phase === "over" ? state : null;
};
