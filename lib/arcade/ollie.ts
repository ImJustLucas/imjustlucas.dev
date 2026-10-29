import { random } from "@/lib/arcade/run";

/**
 * Ollie, the skate cabinet of the Arcade (DESIGN.md, Arcade): Lucas skates
 * down a Paris street and jumps the street furniture, Chrome's offline dino
 * with a skateboard. Plain game logic, no browser and no React: physics,
 * collisions, tricks, scoring and the seeded street. The cabinet only draws
 * it.
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
/** Rolling off the end of a bench, a press this soon after still jumps. */
export const COYOTE_TIME = 0.1;
/** How long a kickflip turns: landing before it is done is a crash. */
export const FLIP_TIME = 0.26;

export const START_SPEED = 340;
export const MAX_SPEED = 950;
/** Speed gained every second of the run: the top speed comes after 51s. */
export const ACCELERATION = 12;

/** A new level every this many seconds. */
export const TIER_TIME = 30;
/**
 * Seconds of clear street between two pieces of furniture, on average: from
 * `start` the gap shrinks with the run's time down to `end`, reached after
 * `GAP_SHRINK` seconds (level 6).
 */
export const GAP_TIME = { start: 1.9, end: 0.8 } as const;
export const GAP_SHRINK = 150;

/** Street units per point of score: the distance is the smallest share. */
export const UNITS_PER_POINT = 20;
/** Points, before the combo multiplier. */
export const POINTS = {
  /** Each piece of furniture jumped. */
  clear: 20,
  /** Each kickflip landed. */
  kickflip: 50,
  /** A high pigeon skated under. */
  under: 40,
} as const;
/** Grinding a bench scores this per street unit ridden on it. */
export const GRIND_PER_UNIT = 0.5;
export const MAX_COMBO = 5;

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

/** How much smaller than its drawing a hitbox is, on every side. */
const INSET = 4;

/**
 * How high a pigeon's underside flies above the street: a low one must be
 * jumped, a high one skated under (jumping into it ends the run).
 */
export const PIGEON_ALTITUDE = { low: 46, high: 104 } as const;
/** Pigeons fly into the wind a little faster than the street goes by. */
export const PIGEON_SPEED = 40;

export const SPARKLE_RADIUS = 14;

/** A sparkle's points before the combo: more the faster the street goes. */
export const sparkleValue = (speed: number) => Math.round(speed / 50) * 10;

export type Obstacle = {
  readonly kind: ObstacleKind;
  /** Left edge, in world units from the screen's left. */
  x: number;
  /** Bottom edge, in units above the street (0 on the ground). */
  readonly lift: number;
  /** Behind Lucas now, jumped, ground or skated under. */
  passed: boolean;
};

export type Sparkle = {
  /** Centre, in world units from the screen's left. */
  x: number;
  /** Centre, in units above the street. */
  readonly lift: number;
  taken: boolean;
};

/** One piece of a pattern: what, and the seconds of street before it. */
type Piece = {
  readonly kind: ObstacleKind;
  readonly flight?: keyof typeof PIGEON_ALTITUDE;
  readonly gap?: number;
};

export type PatternId =
  | "cone"
  | "bin"
  | "bench"
  | "cones"
  | "lowPigeon"
  | "highPigeon"
  | "rejump"
  | "benchPigeon"
  | "pigeonBin";

/**
 * What the street can lay next, each from its level on. The last three are
 * the hard ones, every one of them clearable (tested): two cones to jump
 * one after the other, landing straight into the second jump; a bench, then
 * a low pigeon (jump both, or grind the bench and ollie off over it); a high
 * pigeon to skate under right before a bin to jump.
 */
export const PATTERNS: Readonly<
  Record<
    PatternId,
    { readonly tier: number; readonly pieces: ReadonlyArray<Piece> }
  >
> = {
  cone: { tier: 1, pieces: [{ kind: "cone" }] },
  bin: { tier: 1, pieces: [{ kind: "bin" }] },
  bench: { tier: 1, pieces: [{ kind: "bench" }] },
  cones: { tier: 2, pieces: [{ kind: "cones" }] },
  lowPigeon: { tier: 2, pieces: [{ kind: "pigeon", flight: "low" }] },
  highPigeon: { tier: 2, pieces: [{ kind: "pigeon", flight: "high" }] },
  rejump: { tier: 3, pieces: [{ kind: "cone" }, { kind: "cone", gap: 0.55 }] },
  benchPigeon: {
    tier: 4,
    pieces: [{ kind: "bench" }, { kind: "pigeon", flight: "low", gap: 0.45 }],
  },
  pigeonBin: {
    tier: 5,
    pieces: [
      { kind: "pigeon", flight: "high" },
      { kind: "bin", gap: 0.2 },
    ],
  },
};

const PATTERN_IDS = Object.keys(PATTERNS) as PatternId[];

/** What the street can lay at this level. */
export const patternsAt = (tier: number): ReadonlyArray<PatternId> =>
  PATTERN_IDS.filter((id) => PATTERNS[id].tier <= tier);

/** The level at this many seconds into a run, from 1. */
export const tierAt = (time: number) => 1 + Math.floor(time / TIER_TIME);

/**
 * The seconds of clear street after a pattern, this far into the run, with
 * a random spread of 15% either way.
 */
export const gapTime = (time: number, value: number) => {
  const busy = Math.min(Math.max(time, 0) / GAP_SHRINK, 1);
  const base = GAP_TIME.start + (GAP_TIME.end - GAP_TIME.start) * busy;
  return base * (0.85 + value * 0.3);
};

export type Phase = "ready" | "running" | "over";

/** What happened during a frame, for the cabinet to sound and draw. */
export type OllieEvent =
  | "jump"
  | "kickflip"
  | "land"
  | "trick"
  | "sparkle"
  | "tier"
  | "crash";

/**
 * Points scored during a frame, for the cabinet's popups: `points` before
 * the multiplier `combo`, where they were won.
 */
export type OllieAward = {
  readonly kind: "clear" | "kickflip" | "trick" | "grind" | "under" | "sparkle";
  readonly points: number;
  readonly combo: number;
  readonly x: number;
  readonly lift: number;
};

export type OllieState = {
  phase: Phase;
  /** Seconds since the run started. */
  time: number;
  /** The level, from 1, a new one every `TIER_TIME`. */
  tier: number;
  /** Street units skated. */
  distance: number;
  speed: number;
  /** Points from tricks and sparkles, on top of the distance. */
  bonus: number;
  /** The multiplier, 1 to `MAX_COMBO`. */
  combo: number;
  player: {
    /** Height of his wheels above the street. */
    lift: number;
    /** Upward speed. */
    velocity: number;
    /** On the street or grinding a bench. */
    grounded: boolean;
    /** Whether the jump button is held. */
    holding: boolean;
    /** Seconds left on a buffered press. */
    buffered: number;
    /** Seconds left to still jump after rolling off a bench. */
    coyote: number;
    /** Seconds left on the kickflip turning now, 0 when none. */
    flip: number;
    /** The bench he grinds, or null. */
    rail: Obstacle | null;
    /** Street units ridden on that bench. */
    ground: number;
  };
  /** The jump going on: kickflips landed and furniture cleared so far. */
  air: { flips: number; cleared: number };
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
  /** The points won during the last `advance`. */
  awards: OllieAward[];
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
  tier: 1,
  distance: 0,
  speed: START_SPEED,
  bonus: 0,
  combo: 1,
  player: {
    lift: 0,
    velocity: 0,
    grounded: true,
    holding: false,
    buffered: 0,
    coyote: 0,
    flip: 0,
    rail: null,
    ground: 0,
  },
  air: { flips: 0, cleared: 0 },
  obstacles: [],
  sparkles: [],
  // A clear stretch of street before the first cone
  untilNext: WORLD.width * 0.9,
  seed: seed | 0,
  lag: 0,
  steps: 0,
  events: [],
  awards: [],
});

/** The run's score: the distance skated, plus tricks and sparkles. */
export const score = (state: OllieState) =>
  Math.floor(state.distance / UNITS_PER_POINT) + state.bonus;

/**
 * Lays a pattern's furniture on the street, its first piece's left edge at
 * `x`, and returns what it laid; the gaps inside it follow the speed.
 */
export const layPattern = (state: OllieState, id: PatternId, x: number) => {
  const laid: Obstacle[] = [];
  let at = x;
  for (const piece of PATTERNS[id].pieces) {
    at += (piece.gap ?? 0) * state.speed;
    const lift = piece.flight ? PIGEON_ALTITUDE[piece.flight] : 0;
    const obstacle = { kind: piece.kind, x: at, lift, passed: false };
    state.obstacles.push(obstacle);
    laid.push(obstacle);
    at += OBSTACLE_SIZE[piece.kind].width;
  }
  return laid;
};

const spawn = (state: OllieState) => {
  const patterns = patternsAt(state.tier);
  const id = patterns[Math.floor(draw(state) * patterns.length)];
  const x = WORLD.width + 20;
  const laid = layPattern(state, id, x);

  for (const obstacle of laid) {
    const { width } = OBSTACLE_SIZE[obstacle.kind];
    const roll = draw(state);
    if (obstacle.lift === PIGEON_ALTITUDE.high) {
      // Under a high pigeon, for the one who stays on the ground
      if (roll < 0.5) {
        state.sparkles.push({
          x: obstacle.x + width / 2,
          lift: 30,
          taken: false,
        });
      }
    } else if (roll < 0.4) {
      // At the top of a held jump over it
      state.sparkles.push({
        x: obstacle.x + width / 2,
        lift: 150,
        taken: false,
      });
    }
  }
  // Now and then one on the ground, in the clear street after the pattern
  const last = laid[laid.length - 1];
  const end = last.x + OBSTACLE_SIZE[last.kind].width;
  if (draw(state) > 0.85) {
    state.sparkles.push({ x: end + state.speed * 0.5, lift: 30, taken: false });
  }
  state.untilNext = end - x + state.speed * gapTime(state.time, draw(state));
};

/** Seconds before he would land on a surface this far under his wheels. */
const timeToLand = (height: number, velocity: number) =>
  (velocity + Math.sqrt(Math.max(velocity ** 2 + 2 * GRAVITY * height, 0))) /
  GRAVITY;

/** Lucas's left and right, against a bench's top. */
const onTop = (bench: Obstacle) =>
  PLAYER.x < bench.x + OBSTACLE_SIZE.bench.width - INSET &&
  PLAYER.x + PLAYER.width > bench.x + INSET;

const award = (
  state: OllieState,
  kind: OllieAward["kind"],
  points: number,
  combo: number,
  at = { x: PLAYER.x + PLAYER.width / 2, lift: state.player.lift + 96 },
) => {
  state.bonus += points * combo;
  state.awards.push({ kind, points, combo, ...at });
};

/** A clear with style: scored at the multiplier, which then goes up. */
const styled = (
  state: OllieState,
  kind: OllieAward["kind"],
  points: number,
) => {
  award(state, kind, points, state.combo);
  state.combo = Math.min(MAX_COMBO, state.combo + 1);
  state.events.push("trick");
};

/** He leaves the bench he was grinding: the grind scores. */
const endGrind = (state: OllieState) => {
  const { player } = state;
  if (!player.rail) return;
  player.rail.passed = true;
  const points = Math.round(player.ground * GRIND_PER_UNIT) + POINTS.clear;
  player.rail = null;
  player.ground = 0;
  styled(state, "grind", points);
};

const crash = (state: OllieState) => {
  state.phase = "over";
  state.events.push("crash");
};

const jump = (state: OllieState) => {
  const { player } = state;
  endGrind(state);
  player.velocity = JUMP_VELOCITY;
  player.grounded = false;
  player.buffered = 0;
  player.coyote = 0;
  // A press already let go makes a hop
  if (!player.holding) player.velocity = HOP_VELOCITY;
  state.events.push("jump");
};

/**
 * He lands, on the street or on a bench to grind: a kickflip still turning
 * is a crash; otherwise the jump scores. Furniture cleared with a kickflip
 * raises the multiplier, cleared without one drops it back to x1.
 */
const land = (state: OllieState, rail: Obstacle | null = null) => {
  const { player, air } = state;
  player.lift = rail ? OBSTACLE_SIZE.bench.height : 0;
  player.rail = rail;
  player.velocity = 0;
  player.grounded = true;
  state.events.push("land");
  if (player.flip > 0) return crash(state);

  const flips = air.flips * POINTS.kickflip;
  const cleared = air.cleared * POINTS.clear;
  state.air = { flips: 0, cleared: 0 };
  if (cleared > 0 && flips > 0) styled(state, "trick", cleared + flips);
  else if (cleared > 0) {
    state.combo = 1;
    award(state, "clear", cleared, 1);
  } else if (flips > 0) award(state, "kickflip", flips, state.combo);
  if (player.buffered > 0) jump(state);
};

/**
 * The button goes down: starts the run, or jumps. In the air it starts a
 * kickflip, unless he is about to land, when it jumps again on landing.
 */
export const press = (state: OllieState) => {
  if (state.phase === "over") return;
  const { player } = state;
  player.holding = true;
  if (state.phase === "ready") {
    state.phase = "running";
    jump(state);
    return;
  }
  if (player.grounded || player.coyote > 0) return jump(state);

  const bench = state.obstacles.find(
    (obstacle) =>
      obstacle.kind === "bench" &&
      onTop(obstacle) &&
      player.lift >= OBSTACLE_SIZE.bench.height - INSET,
  );
  const below = bench ? OBSTACLE_SIZE.bench.height : 0;
  if (timeToLand(player.lift - below, player.velocity) <= JUMP_BUFFER) {
    player.buffered = JUMP_BUFFER;
  } else if (player.flip === 0) {
    player.flip = FLIP_TIME;
    state.events.push("kickflip");
  }
};

/** The button comes up: a short press makes a short hop. */
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
  return {
    left: obstacle.x + INSET,
    right: obstacle.x + width - INSET,
    top: WORLD.ground - obstacle.lift - height + INSET,
    bottom: WORLD.ground - obstacle.lift - INSET,
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

  state.steps += 1;
  state.time += dt;
  const tier = tierAt(state.time);
  if (tier > state.tier) {
    state.tier = tier;
    state.events.push("tier");
  }
  state.speed = Math.min(MAX_SPEED, state.speed + ACCELERATION * dt);
  const moved = state.speed * dt;
  state.distance += moved;

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

  // Lucas: grinding, rolling off the bench's end, flying, landing
  if (player.buffered > 0) player.buffered = Math.max(0, player.buffered - dt);
  if (player.coyote > 0) player.coyote = Math.max(0, player.coyote - dt);
  if (player.rail) {
    if (onTop(player.rail)) player.ground += moved;
    else {
      endGrind(state);
      player.grounded = false;
      player.coyote = COYOTE_TIME;
    }
  }
  if (player.flip > 0) {
    player.flip = Math.max(0, player.flip - dt);
    if (player.flip === 0) state.air.flips += 1;
  }
  if (!player.grounded) {
    const before = player.lift;
    player.velocity -= GRAVITY * dt;
    player.lift += player.velocity * dt;
    const top = OBSTACLE_SIZE.bench.height;
    const bench =
      player.velocity < 0 &&
      before >= top - INSET &&
      player.lift <= top &&
      state.obstacles.find(
        (obstacle) =>
          obstacle.kind === "bench" && !obstacle.passed && onTop(obstacle),
      );
    if (bench) land(state, bench);
    else if (player.lift <= 0) land(state);
    if (state.phase === "over") return;
  }

  // Furniture left behind: jumped, or a high pigeon skated under
  for (const obstacle of state.obstacles) {
    if (
      obstacle.passed ||
      obstacle.x + OBSTACLE_SIZE[obstacle.kind].width - INSET >= PLAYER.x
    ) {
      continue;
    }
    obstacle.passed = true;
    if (!player.grounded) state.air.cleared += 1;
    else if (obstacle.kind === "pigeon") styled(state, "under", POINTS.under);
  }

  // Sparkles, then the crash
  const box = playerBox(state);
  for (const sparkle of state.sparkles) {
    if (!sparkle.taken && touchesSparkle(box, sparkle)) {
      sparkle.taken = true;
      award(state, "sparkle", sparkleValue(state.speed), state.combo, {
        x: sparkle.x,
        lift: sparkle.lift,
      });
      state.events.push("sparkle");
    }
  }
  if (
    state.obstacles.some((obstacle) => overlaps(box, obstacleBox(obstacle)))
  ) {
    crash(state);
  }
};

/**
 * Moves the game on by a frame's elapsed seconds in fixed steps, so it plays
 * the same at any frame rate; a frame longer than `MAX_FRAME` (a hidden tab,
 * a hitch) only counts as `MAX_FRAME`. `state.events` and `state.awards`
 * then list what happened during the frame.
 */
export const advance = (state: OllieState, elapsed: number) => {
  state.events = [];
  state.awards = [];
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
  // A replay keeps no frame's events or awards, however long the run
  const next = () => {
    step(state);
    state.events = [];
    state.awards = [];
  };
  let at = 0;
  for (const input of inputs) {
    if (!Number.isSafeInteger(input.step) || input.step < at) return null;
    at = input.step;
    while (state.phase === "running" && state.steps < input.step) next();
    if (state.phase === "over") break;
    if (state.steps !== input.step) return null;
    if (input.press) press(state);
    else release(state);
  }
  while (state.phase === "running" && state.steps < MAX_RUN_STEPS) next();
  return state.phase === "over" ? state : null;
};
