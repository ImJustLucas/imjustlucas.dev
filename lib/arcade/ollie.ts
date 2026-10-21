/**
 * Ollie, the skate cabinet of the Arcade (DESIGN.md, Arcade): Lucas skates
 * down a Paris street and jumps the street furniture, Chrome's offline dino
 * with a skateboard. Plain game logic, no browser and no React: physics,
 * collisions, scoring and the seeded street. The cabinet only draws it.
 *
 * The world is 720 by 405 units (16:9), y pointing down, the street's top at
 * `WORLD.ground`. Time is in seconds; `advance` runs fixed steps of `STEP`.
 */

export const WORLD = { width: 720, height: 405, ground: 352 } as const;

/** Lucas's hitbox, a little smaller than his drawing so near misses count. */
export const PLAYER = { x: 104, width: 50, height: 82 } as const;

/** One fixed step of the simulation. */
export const STEP = 1 / 120;
/** The longest frame `advance` catches up on: a hidden tab never jumps ahead. */
export const MAX_FRAME = 0.25;

export const GRAVITY = 2600;
/** Take-off speed of a held jump: about 160 units high, 0.7s in the air. */
export const JUMP_VELOCITY = 920;
/** Letting go early cuts the rise to this, so a tap is a small hop. */
export const HOP_VELOCITY = 560;
/** A press this long before landing still jumps on landing. */
export const JUMP_BUFFER = 0.12;

export const START_SPEED = 340;
export const MAX_SPEED = 760;
/** Speed gained every second of the run. */
export const ACCELERATION = 9;

/** Street units per point of score. */
export const UNITS_PER_POINT = 12;
export const SPARKLE_BONUS = 15;
/** A milestone sounds every this many points. */
export const MILESTONE = 100;

export type ObstacleKind = "cone" | "cones" | "bin" | "bench" | "pigeon";

/** Width and height of each kind of street furniture. */
export const OBSTACLE_SIZE: Readonly<
  Record<ObstacleKind, { readonly width: number; readonly height: number }>
> = {
  cone: { width: 30, height: 44 },
  cones: { width: 64, height: 44 },
  bin: { width: 40, height: 62 },
  bench: { width: 92, height: 40 },
  pigeon: { width: 42, height: 26 },
};

/**
 * How high a pigeon's underside flies above the street: a low one must be
 * jumped, a high one skated under (jumping into it ends the run).
 */
export const PIGEON_ALTITUDE = { low: 46, high: 104 } as const;
/** Pigeons fly into the wind a little faster than the street goes by. */
export const PIGEON_SPEED = 40;

export const SPARKLE_RADIUS = 14;

export type Obstacle = {
  readonly kind: ObstacleKind;
  /** Left edge, in world units from the screen's left. */
  x: number;
  /** Bottom edge, in units above the street (0 on the ground). */
  readonly lift: number;
};

export type Sparkle = {
  /** Centre, in world units from the screen's left. */
  x: number;
  /** Centre, in units above the street. */
  readonly lift: number;
  taken: boolean;
};

export type Phase = "ready" | "running" | "over";

/** What happened during a frame, for the cabinet to sound and draw. */
export type OllieEvent = "jump" | "land" | "sparkle" | "milestone" | "crash";

export type OllieState = {
  phase: Phase;
  /** Seconds since the run started. */
  time: number;
  /** Street units skated. */
  distance: number;
  speed: number;
  /** Points from sparkles, on top of the distance. */
  bonus: number;
  player: {
    /** Height of his wheels above the street. */
    lift: number;
    /** Upward speed. */
    velocity: number;
    grounded: boolean;
    /** Whether the jump button is held. */
    holding: boolean;
    /** Seconds left on a buffered press. */
    buffered: number;
  };
  obstacles: Obstacle[];
  sparkles: Sparkle[];
  /** Street units left before the next piece of furniture. */
  untilNext: number;
  /** State of the seeded random generator. */
  seed: number;
  /** Time not yet simulated, below one step. */
  lag: number;
  /** Fixed steps run so far: where a press lands in a recorded run. */
  steps: number;
  /** What happened during the last `advance`. */
  events: OllieEvent[];
};

/** mulberry32: a small, fast, seeded generator; returns [0, 1) and the next seed. */
export const random = (seed: number): readonly [number, number] => {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
};

const draw = (state: OllieState) => {
  const [value, seed] = random(state.seed);
  state.seed = seed;
  return value;
};

/** A new run, waiting for the first press. The same seed lays the same street. */
export const createOllie = (seed: number): OllieState => ({
  phase: "ready",
  time: 0,
  distance: 0,
  speed: START_SPEED,
  bonus: 0,
  player: {
    lift: 0,
    velocity: 0,
    grounded: true,
    holding: false,
    buffered: 0,
  },
  obstacles: [],
  sparkles: [],
  // A clear stretch of street before the first cone
  untilNext: WORLD.width * 0.9,
  seed: seed | 0,
  lag: 0,
  steps: 0,
  events: [],
});

/** The run's score: the distance skated, plus the sparkles. */
export const score = (state: OllieState) =>
  Math.floor(state.distance / UNITS_PER_POINT) + state.bonus;

/** Time in the air of a full jump. */
export const AIR_TIME = (2 * JUMP_VELOCITY) / GRAVITY;

/**
 * The street left clear after a piece of furniture at this speed: always
 * room to land and jump again, plus a random stretch.
 */
export const gapAfter = (speed: number, value: number) =>
  speed * (AIR_TIME + 0.34 + value * 0.85);

/** What can come next, by score: the street gets busier as the run goes. */
export const kindsAt = (points: number): ReadonlyArray<ObstacleKind> => {
  if (points < 150) return ["cone", "bin"];
  if (points < 300) return ["cone", "bin", "bench", "cones"];
  return ["cone", "bin", "bench", "cones", "pigeon"];
};

const spawn = (state: OllieState) => {
  const kinds = kindsAt(score(state));
  const kind = kinds[Math.floor(draw(state) * kinds.length)];
  const x = WORLD.width + 20;
  const { width } = OBSTACLE_SIZE[kind];
  let lift = 0;
  if (kind === "pigeon") {
    lift = draw(state) < 0.5 ? PIGEON_ALTITUDE.low : PIGEON_ALTITUDE.high;
  }
  state.obstacles.push({ kind, x, lift });

  // A sparkle at the top of the jump over it, but never over a high pigeon,
  // which must be skated under
  const roll = draw(state);
  if (lift !== PIGEON_ALTITUDE.high && roll < 0.4) {
    state.sparkles.push({ x: x + width / 2, lift: 150, taken: false });
  } else if (roll > 0.85) {
    // Or one on the ground, in the clear street after it
    state.sparkles.push({
      x: x + width + state.speed * 0.5,
      lift: 30,
      taken: false,
    });
  }
  state.untilNext = width + gapAfter(state.speed, draw(state));
};

const jump = (state: OllieState) => {
  const { player } = state;
  player.velocity = JUMP_VELOCITY;
  player.grounded = false;
  player.buffered = 0;
  // A press already let go makes a hop
  if (!player.holding) player.velocity = HOP_VELOCITY;
  state.events.push("jump");
};

/** The jump button goes down: starts the run, or jumps. */
export const press = (state: OllieState) => {
  if (state.phase === "over") return;
  state.player.holding = true;
  if (state.phase === "ready") {
    state.phase = "running";
    jump(state);
    return;
  }
  if (state.player.grounded) return jump(state);
  state.player.buffered = JUMP_BUFFER;
};

/** The jump button comes up: a short press makes a short hop. */
export const release = (state: OllieState) => {
  const { player } = state;
  player.holding = false;
  if (!player.grounded && player.velocity > HOP_VELOCITY) {
    player.velocity = HOP_VELOCITY;
  }
};

type Box = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
};

/** Lucas's hitbox, in world units (y down). */
export const playerBox = (state: OllieState): Box => ({
  left: PLAYER.x,
  right: PLAYER.x + PLAYER.width,
  top: WORLD.ground - state.player.lift - PLAYER.height,
  bottom: WORLD.ground - state.player.lift,
});

/** A piece of furniture's hitbox, in world units, a little forgiving. */
export const obstacleBox = (obstacle: Obstacle): Box => {
  const { width, height } = OBSTACLE_SIZE[obstacle.kind];
  const inset = 4;
  return {
    left: obstacle.x + inset,
    right: obstacle.x + width - inset,
    top: WORLD.ground - obstacle.lift - height + inset,
    bottom: WORLD.ground - obstacle.lift - inset,
  };
};

export const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const touchesSparkle = (box: Box, sparkle: Sparkle) => {
  const cx = sparkle.x;
  const cy = WORLD.ground - sparkle.lift;
  const nearestX = Math.max(box.left, Math.min(cx, box.right));
  const nearestY = Math.max(box.top, Math.min(cy, box.bottom));
  return (nearestX - cx) ** 2 + (nearestY - cy) ** 2 <= SPARKLE_RADIUS ** 2;
};

/** One fixed step of a running game. */
const step = (state: OllieState) => {
  const dt = STEP;
  const { player } = state;
  const before = score(state);

  state.steps += 1;
  state.time += dt;
  state.speed = Math.min(MAX_SPEED, state.speed + ACCELERATION * dt);
  const moved = state.speed * dt;
  state.distance += moved;

  // Lucas
  if (player.buffered > 0) player.buffered = Math.max(0, player.buffered - dt);
  if (!player.grounded) {
    player.velocity -= GRAVITY * dt;
    player.lift += player.velocity * dt;
    if (player.lift <= 0) {
      player.lift = 0;
      player.velocity = 0;
      player.grounded = true;
      state.events.push("land");
      if (player.buffered > 0) jump(state);
    }
  }

  // The street goes by
  for (const obstacle of state.obstacles) {
    obstacle.x -= moved + (obstacle.kind === "pigeon" ? PIGEON_SPEED * dt : 0);
  }
  for (const sparkle of state.sparkles) sparkle.x -= moved;
  state.obstacles = state.obstacles.filter(
    (obstacle) => obstacle.x + OBSTACLE_SIZE[obstacle.kind].width > -40,
  );
  state.sparkles = state.sparkles.filter(
    (sparkle) => !sparkle.taken && sparkle.x > -40,
  );
  state.untilNext -= moved;
  if (state.untilNext <= 0) spawn(state);

  // Sparkles, then the crash
  const box = playerBox(state);
  for (const sparkle of state.sparkles) {
    if (!sparkle.taken && touchesSparkle(box, sparkle)) {
      sparkle.taken = true;
      state.bonus += SPARKLE_BONUS;
      state.events.push("sparkle");
    }
  }
  if (Math.floor(score(state) / MILESTONE) > Math.floor(before / MILESTONE)) {
    state.events.push("milestone");
  }
  if (
    state.obstacles.some((obstacle) => overlaps(box, obstacleBox(obstacle)))
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
export const advance = (state: OllieState, elapsed: number) => {
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
 * A press or release of the jump button, at the step the run had reached:
 * a run is its seed and these inputs, so the server can replay it.
 */
export type OllieInput = { readonly step: number; readonly press: boolean };

/** The longest run a replay plays out: 30 minutes. */
export const MAX_RUN_STEPS = 30 * 60 * 120;

/**
 * Plays a run again from its seed and inputs, step for step as the cabinet
 * played it, and returns the finished run; null when the inputs are out of
 * order or the run never ends in a crash. Inputs after the crash are ignored.
 */
export const replayOllie = (
  seed: number,
  inputs: ReadonlyArray<OllieInput>,
): OllieState | null => {
  const state = createOllie(seed);
  let at = 0;
  for (const input of inputs) {
    if (!Number.isSafeInteger(input.step) || input.step < at) return null;
    at = input.step;
    while (state.phase === "running" && state.steps < input.step) step(state);
    if (state.phase === "over") break;
    if (state.steps !== input.step) return null;
    if (input.press) press(state);
    else release(state);
  }
  while (state.phase === "running" && state.steps < MAX_RUN_STEPS) step(state);
  return state.phase === "over" ? state : null;
};

/** The better of a stored best and a finished run. */
export const bestOf = (stored: number | null, run: number) =>
  Math.max(stored ?? 0, run);

/** A stored best score, or null when it is missing or not a score. */
export const parseBest = (raw: string | null): number | null => {
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
};
