import { random } from "@/lib/arcade/run";

/**
 * Surf, the second cabinet of the Arcade (DESIGN.md, Arcade): Lucas rides
 * the swell and a press pops him off it, Flappy Bird on a surfboard. Every
 * gate is a rock or a buoy rising from the sea under a jetty piling or a
 * flock of gulls coming down from the sky, and he must fly (or ride) through
 * the gap between them. The sea is alive: the swell rolls, a big set now and
 * then lifts him for free, a wave closes into a tube he must ride low
 * through. Plain game logic, no browser and no React: physics, collisions,
 * scoring and the seeded sea. The cabinet only draws it.
 *
 * The world is 720 by 405 units (16:9), y pointing down, the calm sea's
 * surface at `WORLD.sea`. Time is in seconds; `advance` runs fixed steps of
 * `STEP`. A place on the sea is a sea unit `s`, the distance ridden plus the
 * world x: what is laid on the sea (sets, tubes) is laid in sea units.
 */

export const WORLD = { width: 720, height: 405, sea: 336 } as const;

/** Lucas's hitbox, a little smaller than his drawing so near misses count. */
export const PLAYER = { x: 118, width: 42, height: 66 } as const;
/** Where he sits on the sea: the middle of his board. */
const CENTRE = PLAYER.x + PLAYER.width / 2;

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
export const MAX_SPEED = 400;
/** Speed gained every second of the run: the top speed comes after 80s. */
export const ACCELERATION = 2.5;

/** A new level every this many gates. */
export const TIER_GATES = 10;

/** Points: a gate passed, and a perfect pass's bonus before the multiplier. */
export const POINTS = { gate: 10, perfect: 20 } as const;
/** A pass this close to the gap's middle (his middle to its) is perfect. */
export const PERFECT_BAND = 14;
export const MAX_COMBO = 5;
/** Points a second riding a tube, before the multiplier. */
export const TUBE_RATE = 40;

/** A shell's points before the combo: more the faster the sea goes. */
export const shellValue = (speed: number) => Math.round(speed / 40) * 10;

export type LowKind = "rock" | "buoy";
export type HighKind = "piling" | "gulls" | "dive";

/** How wide each obstacle is; its height is the gate's. */
export const OBSTACLE_WIDTH: Readonly<Record<LowKind | HighKind, number>> = {
  rock: 68,
  buoy: 40,
  piling: 46,
  gulls: 58,
  dive: 58,
};

/** The gap of the first gate, narrowing as the gates go by, to `MIN_GAP`. */
export const START_GAP = 174;
export const MIN_GAP = 115;
/** How much each gate passed narrows the next gap. */
export const GAP_SHRINK = 1.2;
/** The lowest a flown gap's floor sits above the sea, and its ceiling under the top. */
export const LOW_MIN = 36;
export const HIGH_MIN = 34;
/** The highest a gap's ceiling can be, in units above the sea. */
export const TOP = WORLD.sea - HIGH_MIN;
/** Sea between two gates' centres: this, plus up to `SPACING_SPREAD`. */
export const SPACING = 290;
export const SPACING_SPREAD = 90;
/**
 * More sea when the next gap sits higher or lower: this many units of
 * height per second of sea, so he always has time to climb or drop.
 */
export const SHIFT_RATE = 360;

/** The swell he rides: a gentle roll, `amp` high every `length` sea units. */
export const SWELL = { amp: 12, length: 520 } as const;
/** A big set: a wave `height` high over `length` sea units. */
export const SET = { height: 70, length: 520 } as const;
/** A tube: the wave's lip this high over the sea, for this many seconds. */
export const TUBE = { lip: 100, seconds: 2.5 } as const;
/** Diving gulls start `rise` higher and are down once `near` him. */
export const DIVE = { rise: 70, near: 120, range: 260 } as const;

export type HazardKind = "gull" | "shark";
/** A lone gull in the middle of the sky, a shark fin in the low water. */
export const HAZARD: Readonly<
  Record<
    HazardKind,
    { readonly width: number; readonly height: number; readonly speed: number }
  >
> = {
  gull: { width: 40, height: 22, speed: 50 },
  shark: { width: 34, height: 26, speed: 90 },
};

/** A lone gull or a fin reaches him this many seconds after its gate. */
export const HAZARD_AFTER = 0.55;

export type PickupKind = "shell" | "dolphin";
export const PICKUP_RADIUS = 13;

export type Gate = {
  /** Centre, in world units from the screen's left. */
  x: number;
  /** What rises from the sea, or nothing under a gate he rides through. */
  readonly low: LowKind | null;
  readonly high: HighKind;
  /** The gap's floor and ceiling, in units above the calm sea. */
  readonly floor: number;
  readonly ceiling: number;
  /** A gate to ride through: perfect only on the water. */
  readonly ride: boolean;
  /** Whether Lucas is through it. */
  passed: boolean;
};

export type Hazard = {
  readonly kind: HazardKind;
  /** Centre, in world units. */
  x: number;
  /** Bottom edge, in units above the calm sea. */
  readonly lift: number;
};

export type Pickup = {
  readonly kind: PickupKind;
  /** Centre, in world units and units above the calm sea. */
  x: number;
  readonly lift: number;
  taken: boolean;
};

/** A stretch of sea, in sea units. */
export type Stretch = { readonly from: number; readonly to: number };

export type Phase = "ready" | "running" | "over";

/** What happened during a frame, for the cabinet to sound and draw. */
export type SurfEvent =
  | "pop"
  | "land"
  | "gate"
  | "perfect"
  | "shell"
  | "dolphin"
  | "saved"
  | "tube"
  | "tier"
  | "crash";

/** Points scored during a frame, for the cabinet's popups. */
export type SurfAward = {
  readonly kind: "perfect" | "shell" | "tube";
  /** Before the multiplier `combo`. */
  readonly points: number;
  readonly combo: number;
  readonly x: number;
  readonly lift: number;
};

export type SurfState = {
  phase: Phase;
  /** Seconds since the run started. */
  time: number;
  /** Sea units ridden. */
  distance: number;
  speed: number;
  /** Gates passed. */
  gates: number;
  /** The level, from 1, a new one every `TIER_GATES` gates. */
  tier: number;
  /** Points from perfect passes, shells and tubes. */
  bonus: number;
  /** The multiplier, 1 to `MAX_COMBO`. */
  combo: number;
  player: {
    /** Height of his board above the calm sea. */
    lift: number;
    /** Upward speed. */
    velocity: number;
    /** On the swell, riding. */
    riding: boolean;
    /** A dolphin swims with him: the next hit is forgiven. */
    shield: boolean;
    /** Seconds left untouchable after a hit was forgiven. */
    safe: number;
  };
  obstacles: Gate[];
  hazards: Hazard[];
  pickups: Pickup[];
  sets: Stretch[];
  /** Tubes, with the points ridden in each so far. */
  tubes: Array<Stretch & { points: number }>;
  /** Sea units left before the next pattern. */
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
  /** The points won during the last `advance`. */
  awards: SurfAward[];
};

const draw = (state: SurfState) => {
  const [value, seed] = random(state.seed);
  state.seed = seed;
  return value;
};

/** A new run, waiting for the first press. The same seed lays the same sea. */
export const createSurf = (seed: number): SurfState => ({
  phase: "ready",
  time: 0,
  distance: 0,
  speed: START_SPEED,
  gates: 0,
  tier: 1,
  bonus: 0,
  combo: 1,
  player: { lift: 0, velocity: 0, riding: true, shield: false, safe: 0 },
  obstacles: [],
  hazards: [],
  pickups: [],
  sets: [],
  tubes: [],
  // A clear stretch of sea before the first gate
  untilNext: WORLD.width * 0.75,
  lastFloor: LOW_MIN,
  seed: seed | 0,
  lag: 0,
  steps: 0,
  events: [],
  awards: [],
});

/** The run's score: the gates passed, plus perfects, shells and tubes. */
export const score = (state: SurfState) =>
  state.gates * POINTS.gate + Math.floor(state.bonus);

/** The level after this many gates, from 1. */
export const tierAt = (gates: number) => 1 + Math.floor(gates / TIER_GATES);

/** The gap of the next gate after `passed` gates. */
export const gapAt = (passed: number) =>
  Math.max(MIN_GAP, START_GAP - passed * GAP_SHRINK);

/** The most a flown gap's floor moves from one gate to the next, by level. */
export const maxShift = (tier: number) => Math.min(100 + (tier - 1) * 25, 200);

/** Sea between two gates' centres whose floors are `from` and `to`. */
export const spacingFor = (
  speed: number,
  from: number,
  to: number,
  value: number,
) =>
  SPACING + value * SPACING_SPREAD + (speed * Math.abs(to - from)) / SHIFT_RATE;

/** The sea's surface at world `x`, in units above the calm sea. */
export const swellAt = (state: SurfState, x: number) => {
  const s = state.distance + x;
  let lift = (SWELL.amp * (1 - Math.cos((s / SWELL.length) * Math.PI * 2))) / 2;
  for (const set of state.sets) {
    if (s > set.from && s < set.to) {
      lift +=
        SET.height * Math.sin((Math.PI * (s - set.from)) / (set.to - set.from));
    }
  }
  return lift;
};

/** A gate's floor now: a buoy bobs with the swell. */
export const floorOf = (state: SurfState, gate: Gate) =>
  gate.low === "buoy" ? gate.floor + swellAt(state, gate.x) : gate.floor;

/** A gate's ceiling now: diving gulls come down as they near him. */
export const ceilingOf = (gate: Gate) => {
  if (gate.high !== "dive") return gate.ceiling;
  const far = (gate.x - PLAYER.x - DIVE.near) / DIVE.range;
  return gate.ceiling + DIVE.rise * Math.min(Math.max(far, 0), 1);
};

export type PatternId =
  | "gate"
  | "ride"
  | "top"
  | "set"
  | "dive"
  | "gull"
  | "tube"
  | "zigzag"
  | "shark";

/**
 * What the sea can lay next, each from its level on: a gate anywhere in
 * reach; a gate at the very bottom to ride through; one at the very top; a
 * big set lifting him over a rock; gulls that dive as he nears; a lone gull
 * in the middle of the sky; a tube to ride low; top, bottom, top; a shark
 * fin in the low water. The plain gate comes three times as often.
 */
export const PATTERN_TIER: Readonly<Record<PatternId, number>> = {
  gate: 1,
  ride: 1,
  top: 2,
  set: 2,
  dive: 3,
  gull: 3,
  tube: 3,
  zigzag: 4,
  shark: 4,
};

const PATTERN_IDS = Object.keys(PATTERN_TIER) as PatternId[];

/** What the sea can lay at this level. */
export const patternsAt = (tier: number): ReadonlyArray<PatternId> =>
  PATTERN_IDS.filter((id) => PATTERN_TIER[id] <= tier);

const pick = <T>(state: SurfState, items: ReadonlyArray<T>) =>
  items[Math.floor(draw(state) * items.length)];

/**
 * Lays a pattern on the sea, its first piece `x` units in (plus the room it
 * needs from the last gate's floor), and returns where it ends, in world
 * units. Its gates follow `spacingFor`; `state.lastFloor` follows them.
 */
export const layPattern = (state: SurfState, id: PatternId, x: number) => {
  const gap = gapAt(state.gates + state.obstacles.length);
  const highs: ReadonlyArray<HighKind> =
    state.tier >= 2 ? ["piling", "gulls"] : ["piling"];
  const lows: ReadonlyArray<LowKind> =
    state.tier >= 2 ? ["rock", "buoy"] : ["rock"];
  let at = x;
  let first = true;

  const gate = (spec: Omit<Gate, "x" | "passed" | "ceiling">, span = gap) => {
    at += first
      ? (state.speed * Math.abs(spec.floor - state.lastFloor)) / SHIFT_RATE
      : spacingFor(state.speed, state.lastFloor, spec.floor, draw(state));
    first = false;
    const laid = {
      ...spec,
      x: at,
      ceiling: spec.floor + span,
      passed: false,
    };
    state.obstacles.push(laid);
    state.lastFloor = spec.floor;
    return laid;
  };
  const flown = (high: HighKind) => {
    const shift = maxShift(state.tier);
    const top = TOP - gap;
    const min = Math.min(Math.max(LOW_MIN, state.lastFloor - shift), top);
    const max = Math.min(top, Math.max(LOW_MIN, state.lastFloor + shift));
    const floor = Math.round(min + draw(state) * (max - min));
    return gate({ low: pick(state, lows), high, floor, ride: false });
  };
  const ride = () =>
    gate({ low: null, high: pick(state, highs), floor: 0, ride: true });
  const top = () =>
    gate({
      low: pick(state, lows),
      high: "piling",
      floor: TOP - gap,
      ride: false,
    });
  /**
   * A lone gull or a fin, flying (or swimming) at him faster than the sea:
   * it reaches him `HAZARD_AFTER` seconds after the gate, and the next gate
   * waits as long.
   */
  const after = (laid: Gate, kind: HazardKind, lift: number) => {
    const { speed } = HAZARD[kind];
    const arrives = (laid.x - CENTRE) / state.speed;
    const ahead = speed * arrives + HAZARD_AFTER * (state.speed + speed);
    state.hazards.push({ kind, x: laid.x + ahead, lift });
    at += HAZARD_AFTER * state.speed;
  };
  /** A shell near the gap's rock, or under its ceiling: off the easy line. */
  const edgeShell = (laid: Gate) => {
    const roll = draw(state);
    if (roll < 0.2 && laid.low === "rock") {
      state.pickups.push({
        kind: "shell",
        x: laid.x,
        lift: laid.floor + 18,
        taken: false,
      });
    } else if (roll > 0.8 && laid.high !== "dive" && !laid.ride) {
      state.pickups.push({
        kind: "shell",
        x: laid.x,
        lift: laid.ceiling - 18,
        taken: false,
      });
    }
  };

  switch (id) {
    case "gate":
      edgeShell(flown(pick(state, highs)));
      break;
    case "dive":
      edgeShell(flown("dive"));
      break;
    case "ride":
      ride();
      break;
    case "top":
      edgeShell(top());
      break;
    case "zigzag":
      top();
      ride();
      edgeShell(top());
      break;
    case "set": {
      const laid = gate({
        low: "rock",
        high: pick(state, highs),
        floor: SET.height - 14,
        ride: true,
      });
      const s = state.distance + laid.x;
      state.sets.push({ from: s - SET.length / 2, to: s + SET.length / 2 });
      break;
    }
    case "gull": {
      const laid = flown(pick(state, highs));
      after(laid, "gull", Math.round(100 + draw(state) * 70));
      break;
    }
    case "shark":
      after(flown(pick(state, highs)), "shark", 0);
      break;
    case "tube": {
      at += (state.speed * state.lastFloor) / SHIFT_RATE + 120;
      const from = state.distance + at;
      const length = state.speed * TUBE.seconds;
      state.tubes.push({ from, to: from + length, points: 0 });
      for (let k = 1; k <= 3; k++) {
        state.pickups.push({
          kind: "shell",
          x: at + (length * k) / 4,
          lift: 20,
          taken: false,
        });
      }
      at += length;
      state.lastFloor = 0;
      return at;
    }
  }

  // Now and then, between this gate and the next: a shell well off the
  // line, or (from level 2) a dolphin on the water
  const roll = draw(state);
  if (state.tier >= 2 && roll < 0.06 && !state.player.shield) {
    state.pickups.push({
      kind: "dolphin",
      x: at + 150,
      lift: 16,
      taken: false,
    });
  } else if (roll > 0.85) {
    const lift = draw(state) < 0.5 ? 14 : 220;
    state.pickups.push({ kind: "shell", x: at + 150, lift, taken: false });
  }
  return at;
};

const spawn = (state: SurfState) => {
  const id = pick(state, [
    "gate",
    "gate",
    ...patternsAt(state.tier),
  ] as PatternId[]);
  const x = WORLD.width + 80;
  const end = layPattern(state, id, x);
  state.untilNext = end - x + SPACING + draw(state) * SPACING_SPREAD;
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
export const lowBox = (state: SurfState, gate: Gate): Box | null => {
  if (!gate.low) return null;
  const half = OBSTACLE_WIDTH[gate.low] / 2;
  return {
    left: gate.x - half + INSET,
    right: gate.x + half - INSET,
    top: WORLD.sea - floorOf(state, gate) + INSET,
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
    bottom: WORLD.sea - ceilingOf(gate) - INSET,
  };
};

/** A gull's or a fin's hitbox; the fin stands on the swell. */
export const hazardBox = (state: SurfState, hazard: Hazard): Box => {
  const { width, height } = HAZARD[hazard.kind];
  const base = hazard.kind === "shark" ? swellAt(state, hazard.x) : hazard.lift;
  return {
    left: hazard.x - width / 2 + INSET,
    right: hazard.x + width / 2 - INSET,
    top: WORLD.sea - base - height + INSET,
    bottom: WORLD.sea - base + (hazard.kind === "shark" ? 20 : -INSET),
  };
};

export const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const touches = (box: Box, x: number, lift: number) => {
  const cy = WORLD.sea - lift;
  const nearestX = Math.max(box.left, Math.min(x, box.right));
  const nearestY = Math.max(box.top, Math.min(cy, box.bottom));
  return (nearestX - x) ** 2 + (nearestY - cy) ** 2 <= PICKUP_RADIUS ** 2;
};

const award = (
  state: SurfState,
  kind: SurfAward["kind"],
  points: number,
  at: { readonly x: number; readonly lift: number },
) => {
  state.bonus += points * state.combo;
  state.awards.push({ kind, points, combo: state.combo, ...at });
};

/** He is through a gate: perfect near its middle, or riding a ride gate. */
const through = (state: SurfState, gate: Gate) => {
  const { player } = state;
  gate.passed = true;
  state.gates += 1;
  const middle = (floorOf(state, gate) + ceilingOf(gate)) / 2;
  const perfect = gate.ride
    ? player.riding
    : Math.abs(player.lift + PLAYER.height / 2 - middle) <= PERFECT_BAND;
  if (perfect) {
    award(state, "perfect", POINTS.perfect, {
      x: CENTRE,
      lift: player.lift + PLAYER.height + 26,
    });
    state.combo = Math.min(MAX_COMBO, state.combo + 1);
    state.events.push("perfect");
  } else {
    state.combo = 1;
    state.events.push("gate");
  }
  const tier = tierAt(state.gates);
  if (tier > state.tier) {
    state.tier = tier;
    state.events.push("tier");
  }
};

/** Something hit him: the dolphin forgives it once, otherwise it is over. */
const hit = (state: SurfState) => {
  const { player } = state;
  if (player.safe > 0) return;
  if (player.shield) {
    player.shield = false;
    player.safe = 0.8;
    state.combo = 1;
    state.events.push("saved");
    return;
  }
  state.phase = "over";
  state.events.push("crash");
};

/** One fixed step of a running game. */
const step = (state: SurfState) => {
  const dt = STEP;
  const { player } = state;

  state.steps += 1;
  state.time += dt;
  state.speed = Math.min(MAX_SPEED, state.speed + ACCELERATION * dt);
  const moved = state.speed * dt;
  state.distance += moved;
  if (player.safe > 0) player.safe = Math.max(0, player.safe - dt);

  // The sea goes by; gulls and fins come at him a little faster
  for (const gate of state.obstacles) gate.x -= moved;
  for (const hazard of state.hazards) {
    hazard.x -= moved + HAZARD[hazard.kind].speed * dt;
  }
  for (const item of state.pickups) item.x -= moved;
  const behind = state.distance - 80;
  state.obstacles = state.obstacles.filter((gate) => gate.x > -80);
  state.hazards = state.hazards.filter((hazard) => hazard.x > -80);
  state.pickups = state.pickups.filter((item) => !item.taken && item.x > -40);
  state.sets = state.sets.filter((set) => set.to > behind);
  state.untilNext -= moved;
  if (state.untilNext <= 0) spawn(state);

  // Lucas: on the swell, or flying
  const surface = swellAt(state, CENTRE);
  if (player.riding) player.lift = surface;
  else {
    player.velocity = Math.max(-MAX_FALL, player.velocity - GRAVITY * dt);
    player.lift += player.velocity * dt;
    if (player.lift >= CEILING) {
      player.lift = CEILING;
      player.velocity = Math.min(player.velocity, 0);
    }
    if (player.lift <= surface) {
      player.lift = surface;
      player.velocity = 0;
      player.riding = true;
      state.events.push("land");
    }
  }

  const box = playerBox(state);

  // Tubes: points while he rides inside, a bonus once out the far end
  for (const tube of state.tubes) {
    const left = tube.from - state.distance;
    const right = tube.to - state.distance;
    if (box.right > left && box.left < right) {
      if (player.lift + PLAYER.height > TUBE.lip - INSET) hit(state);
      else if (player.riding) {
        tube.points += TUBE_RATE * dt;
        state.bonus += TUBE_RATE * dt * state.combo;
      }
    }
  }
  const done = state.tubes.filter(
    (tube) => tube.to - state.distance < box.left,
  );
  for (const tube of done) {
    if (tube.points > 0) {
      state.awards.push({
        kind: "tube",
        points: Math.round(tube.points),
        combo: state.combo,
        x: CENTRE,
        lift: player.lift + PLAYER.height + 26,
      });
      state.combo = Math.min(MAX_COMBO, state.combo + 1);
      state.events.push("tube");
    }
  }
  state.tubes = state.tubes.filter((tube) => !done.includes(tube));

  // Gates he is through, pickups, then what hits him
  for (const gate of state.obstacles) {
    if (!gate.passed && gate.x <= CENTRE) through(state, gate);
  }
  for (const item of state.pickups) {
    if (item.taken || !touches(box, item.x, item.lift)) continue;
    item.taken = true;
    if (item.kind === "dolphin") {
      player.shield = true;
      state.events.push("dolphin");
    } else {
      award(state, "shell", shellValue(state.speed), item);
      state.events.push("shell");
    }
  }
  if (
    state.obstacles.some((gate) => {
      const low = lowBox(state, gate);
      return (low && overlaps(box, low)) || overlaps(box, highBox(gate));
    }) ||
    state.hazards.some((hazard) => overlaps(box, hazardBox(state, hazard)))
  ) {
    hit(state);
  }
};

/**
 * Moves the game on by a frame's elapsed seconds in fixed steps, so it plays
 * the same at any frame rate; a frame longer than `MAX_FRAME` (a hidden tab,
 * a hitch) only counts as `MAX_FRAME`. `state.events` and `state.awards`
 * then list what happened during the frame.
 */
export const advance = (state: SurfState, elapsed: number) => {
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
  }
  while (state.phase === "running" && state.steps < MAX_RUN_STEPS) next();
  return state.phase === "over" ? state : null;
};
