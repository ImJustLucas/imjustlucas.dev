import { describe, expect, it } from "vitest";

import {
  advance,
  CEILING,
  ceilingOf,
  createSurf,
  DIVE,
  floorOf,
  gapAt,
  type Gate,
  type HighKind,
  layPattern,
  type LowKind,
  MAX_COMBO,
  MAX_FRAME,
  MAX_SPEED,
  maxShift,
  MIN_GAP,
  PATTERN_TIER,
  type PatternId,
  patternsAt,
  PLAYER,
  POINTS,
  POP_VELOCITY,
  press,
  replaySurf,
  score,
  SET,
  shellValue,
  SPACING,
  spacingFor,
  START_GAP,
  START_SPEED,
  STEP,
  type SurfEvent,
  type SurfInput,
  type SurfState,
  SWELL,
  swellAt,
  tierAt,
  TOP,
  TUBE,
  TUBE_RATE,
  WORLD,
} from "./surf";

/** Runs the game for `seconds`, in 60fps frames, collecting every event. */
const play = (state: SurfState, seconds: number) => {
  const events: SurfEvent[] = [];
  for (let t = 0; t < seconds; t += 1 / 60) {
    advance(state, 1 / 60);
    events.push(...state.events);
  }
  return events;
};

/** A running game on an empty sea (nothing laid for a long while), riding. */
const emptySea = (speed?: number) => {
  const state = createSurf(1);
  press(state);
  play(state, 1);
  state.obstacles = [];
  state.hazards = [];
  state.pickups = [];
  state.untilNext = Infinity;
  if (speed) state.speed = speed;
  return state;
};

const CENTRE = PLAYER.x + PLAYER.width / 2;

/** A gate whose gap spans `floor` to `floor + gap`, its centre `ahead` units ahead. */
const gate = (
  ahead: number,
  floor: number,
  gap = START_GAP,
  kinds: { low?: LowKind | null; high?: HighKind; ride?: boolean } = {},
): Gate => ({
  x: CENTRE + ahead,
  low: kinds.low === undefined ? "rock" : kinds.low,
  high: kinds.high ?? "piling",
  floor,
  ceiling: floor + gap,
  ride: kinds.ride ?? false,
  passed: false,
});

const clone = (state: SurfState) => structuredClone(state);

/** Plays `steps` steps from a copy, pressing first or not; a hit the dolphin forgave counts as lost. */
const go = (state: SurfState, pressed: boolean, steps: number) => {
  const next = clone(state);
  if (pressed) press(next);
  for (let i = 0; i < steps && next.phase === "running"; i++) {
    advance(next, STEP);
    if (next.events.includes("saved")) next.phase = "over";
  }
  return next;
};

/** Where he'd like his board: the next gap's middle, or the water. */
const aimOf = (state: SurfState) => {
  const tube = state.tubes.find(
    (t) =>
      t.from - state.distance < PLAYER.x + 400 &&
      t.to - state.distance > PLAYER.x,
  );
  if (tube) return 0;
  const next = state.obstacles.find((g) => !g.passed);
  if (!next) return 60;
  if (next.ride) return 0;
  return (floorOf(state, next) + ceilingOf(next)) / 2 - PLAYER.height / 2;
};

/**
 * Whether a player pressing at most 20 times a second can keep Lucas going
 * until `done`: a search over pressing or not every 50ms, nearest the next
 * gap's middle first. The dolphin's help does not count.
 */
const survives = (
  start: SurfState,
  done: (state: SurfState) => boolean,
  budget = 60000,
) => {
  const stack = [clone(start)];
  const seen = new Set<string>();
  let visits = 0;
  while (stack.length > 0) {
    const state = stack.pop()!;
    if (state.phase !== "running") continue;
    if (done(state)) return true;
    if (++visits > budget) return false;
    const { lift, velocity, riding } = state.player;
    const key = `${state.steps}:${Math.round(lift / 4)}:${Math.round(velocity / 40)}:${riding}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const wait = go(state, false, 6);
    const popped = go(state, true, 6);
    if (lift < aimOf(state)) stack.push(wait, popped);
    else stack.push(popped, wait);
  }
  return false;
};

/** Everything laid is behind him. */
const allPassed = (state: SurfState) =>
  state.obstacles.every((g) => g.passed) &&
  state.tubes.length === 0 &&
  state.hazards.every((h) => h.x < PLAYER.x - 40);

/** Patterns laid one after the other, as the sea lays them. */
const sea = (
  speed: number,
  ids: PatternId[],
  options: { tier?: number; lastFloor?: number; gates?: number } = {},
) => {
  const state = emptySea(speed);
  state.tier = options.tier ?? 5;
  state.gates = options.gates ?? 60;
  state.lastFloor = options.lastFloor ?? 36;
  state.seed = 4;
  let x = WORLD.width;
  for (const id of ids) {
    x = layPattern(state, id, x) + SPACING;
  }
  state.pickups = [];
  return state;
};

/**
 * Pops whenever Lucas sinks below his aim: the bot the tests ride with,
 * and record.
 */
const autopilot = (state: SurfState, pressed: () => void) => {
  // A gate counts until it is behind him, not just through its middle
  const next = state.obstacles.find(
    (g) => g.x + 40 > PLAYER.x && g.x - CENTRE < 300,
  );
  const aim =
    !next || next.ride || aimOf(state) === 0
      ? aimOf(state)
      : floorOf(state, next) + (ceilingOf(next) - floorOf(state, next)) * 0.25;
  if (state.player.lift < aim && state.player.velocity <= 0) pressed();
};

describe("the seeded sea", () => {
  it("lays the same sea for the same seed, and another for another", () => {
    const run = (seed: number) => {
      const state = createSurf(seed);
      press(state);
      const floors: number[] = [];
      for (let i = 0; i < 1200 && state.phase === "running"; i++) {
        advance(state, 1 / 60);
        autopilot(state, () => press(state));
        for (const g of state.obstacles) floors.push(g.floor);
      }
      return { floors: [...new Set(floors)], seed: state.seed };
    };
    expect(run(7)).toEqual(run(7));
    expect(run(7).floors).not.toEqual(run(8).floors);
  });

  it("narrows the gap as the gates go by, down to about 115", () => {
    expect(gapAt(0)).toBe(START_GAP);
    expect(gapAt(10)).toBeLessThan(gapAt(0));
    expect(gapAt(1000)).toBe(MIN_GAP);
    expect(MIN_GAP).toBeLessThanOrEqual(120);
  });

  it("brings a new level every 10 gates, and harder patterns with it", () => {
    expect(tierAt(0)).toBe(1);
    expect(tierAt(9)).toBe(1);
    expect(tierAt(10)).toBe(2);
    expect(patternsAt(1)).toEqual(["gate", "ride"]);
    expect(patternsAt(2)).toContain("top");
    expect(patternsAt(2)).toContain("set");
    expect(patternsAt(3)).toEqual(
      expect.arrayContaining(["dive", "gull", "tube"]),
    );
    expect(patternsAt(4)).toEqual(Object.keys(PATTERN_TIER));
    expect(maxShift(5)).toBeGreaterThan(maxShift(1));
  });

  it("leaves more sea before a gap far above or below the last", () => {
    expect(spacingFor(MAX_SPEED, 36, 180, 0)).toBeGreaterThan(
      spacingFor(MAX_SPEED, 36, 40, 0),
    );
  });

  it("puts gates at the very bottom and the very top, not just mid-screen", () => {
    const state = createSurf(11);
    press(state);
    state.tier = 4;
    state.player.safe = Infinity;
    const floors = new Set<number>();
    const ceilings = new Set<number>();
    for (let i = 0; i < 60 * 120; i++) {
      advance(state, 1 / 60);
      for (const g of state.obstacles) {
        floors.add(g.floor);
        ceilings.add(g.ceiling);
      }
    }
    expect([...floors]).toContain(0);
    expect(Math.max(...ceilings)).toBe(TOP);
  });
});

describe("every gate within reach", () => {
  const ids = Object.keys(PATTERN_TIER) as PatternId[];

  it("knows an impossible sea when it sees one", () => {
    const state = emptySea(MAX_SPEED);
    state.obstacles.push(gate(300, 36, 40), gate(340, 230, 40));
    expect(survives(state, allPassed)).toBe(false);
  });

  it("lets every pattern be ridden, slow or fast", () => {
    for (const speed of [START_SPEED, MAX_SPEED]) {
      for (const id of ids) {
        for (const lastFloor of [0, 36, TOP - MIN_GAP]) {
          expect(
            survives(sea(speed, [id], { lastFloor }), allPassed),
            `${id} at ${speed} from ${lastFloor}`,
          ).toBe(true);
        }
      }
    }
  });

  it("lets any pattern follow any other at top speed, with the narrowest gap", () => {
    for (const a of ids) {
      for (const b of ids) {
        expect(survives(sea(MAX_SPEED, [a, b]), allPassed), `${a}, ${b}`).toBe(
          true,
        );
      }
    }
  });

  it("no longer lets a player hover mid-screen through it all", () => {
    const hover = (seed: number) => {
      const state = createSurf(seed);
      press(state);
      for (let i = 0; i < 60 * 600 && state.phase === "running"; i++) {
        advance(state, 1 / 60);
        if (state.player.lift < 110 && state.player.velocity <= 0) {
          press(state);
        }
      }
      return state.gates;
    };
    const reached = [1, 2, 3, 4, 5, 6].map(hover);
    expect(Math.max(...reached)).toBeLessThan(20);
  });

  it("gets a player through 50 gates of real runs", () => {
    for (const seed of [1, 42, 2026]) {
      const state = createSurf(seed);
      press(state);
      expect(
        survives(state, (s) => s.gates >= 50, 200000),
        `seed ${seed}`,
      ).toBe(true);
    }
  });
});

describe("a run", () => {
  it("waits for the first press, then starts with a pop", () => {
    const state = createSurf(3);
    advance(state, 1);
    expect(state.phase).toBe("ready");
    expect(state.distance).toBe(0);

    press(state);
    expect(state.phase).toBe("running");
    expect(state.events).toContain("pop");
    advance(state, 0.1);
    expect(state.distance).toBeGreaterThan(0);
  });

  it("speeds up past 300, never past the top speed", () => {
    const state = emptySea();
    play(state, 60);
    expect(state.speed).toBeGreaterThan(300);
    play(state, 60);
    expect(state.speed).toBe(MAX_SPEED);
  });

  it("plays the same at 30, 60 or 144 frames a second", () => {
    const at = (fps: number) => {
      const state = emptySea();
      for (let i = 0; i < fps * 5; i++) advance(state, 1 / fps);
      return state.distance;
    };
    expect(at(30)).toBeCloseTo(at(60), -1);
    expect(at(144)).toBeCloseTo(at(60), -1);
  });

  it("never jumps ahead after a long frame (a hidden tab)", () => {
    const state = emptySea();
    const before = state.distance;
    advance(state, 30);
    expect(state.distance - before).toBeLessThanOrEqual(
      MAX_SPEED * MAX_FRAME + 1,
    );
  });
});

describe("the sea", () => {
  it("rolls under him, and he rides it", () => {
    const state = emptySea();
    const lifts: number[] = [];
    for (let i = 0; i < 240; i++) {
      advance(state, STEP);
      lifts.push(state.player.lift);
      expect(state.player.lift).toBeCloseTo(swellAt(state, CENTRE));
    }
    expect(Math.max(...lifts) - Math.min(...lifts)).toBeGreaterThan(
      SWELL.amp * 0.8,
    );
  });

  it("lifts him over a rock on a big set, without a press", () => {
    const state = emptySea(MAX_SPEED);
    const rockAt = 400;
    const s = state.distance + CENTRE + rockAt;
    state.sets.push({ from: s - SET.length / 2, to: s + SET.length / 2 });
    state.obstacles.push(
      gate(rockAt, SET.height - 14, START_GAP, { ride: true }),
    );
    const events = play(state, 2);
    expect(events).not.toContain("crash");
    expect(events).toContain("perfect");
    expect(state.gates).toBe(1);
  });

  it("rides through a gate at the very bottom, but a pop hits its piling", () => {
    const riding = emptySea();
    riding.obstacles.push(gate(300, 0, MIN_GAP, { low: null, ride: true }));
    expect(play(riding, 2)).toContain("perfect");

    const popping = emptySea();
    popping.obstacles.push(gate(120, 0, MIN_GAP, { low: null, ride: true }));
    press(popping);
    advance(popping, STEP * 6);
    press(popping);
    expect(play(popping, 2)).toContain("crash");
  });

  it("scores a tube ridden low, and ends the run on its lip if he pops", () => {
    const state = emptySea();
    const from = state.distance + PLAYER.x + 200;
    const length = state.speed * TUBE.seconds;
    state.tubes.push({ from, to: from + length, points: 0 });
    const before = state.bonus;
    const awards = [];
    for (let i = 0; i < 4 * 120 && state.phase === "running"; i++) {
      advance(state, STEP);
      awards.push(...state.awards);
    }
    expect(state.phase).toBe("running");
    // In the tube from his front edge's entry to his back edge's exit
    const ridden = (length + PLAYER.width) / state.speed;
    expect(state.bonus - before).toBeCloseTo(TUBE_RATE * ridden, -1);
    expect(awards).toEqual([expect.objectContaining({ kind: "tube" })]);
    expect(state.combo).toBe(2);

    const popping = emptySea();
    const at = popping.distance + PLAYER.x;
    popping.tubes.push({ from: at, to: at + 600, points: 0 });
    press(popping);
    expect(play(popping, 1)).toContain("crash");
  });

  it("brings diving gulls down as they near him", () => {
    const dive = gate(600, 80, MIN_GAP, { high: "dive" });
    expect(ceilingOf(dive)).toBe(dive.ceiling + DIVE.rise);
    dive.x = PLAYER.x + DIVE.near;
    expect(ceilingOf(dive)).toBe(dive.ceiling);
  });

  it("bobs a buoy with the swell", () => {
    const state = emptySea();
    const buoy = gate(400, 60, START_GAP, { low: "buoy" });
    const floors = new Set<number>();
    for (let i = 0; i < 120; i++) {
      advance(state, STEP);
      floors.add(Math.round(floorOf(state, buoy)));
    }
    expect(floors.size).toBeGreaterThan(5);
  });

  it("sends a shark fin through the low water: pop over it", () => {
    const riding = emptySea();
    riding.hazards.push({ kind: "shark", x: CENTRE + 300, lift: 0 });
    expect(play(riding, 2)).toContain("crash");

    const popping = emptySea();
    popping.hazards.push({ kind: "shark", x: CENTRE + 140, lift: 0 });
    const events: SurfEvent[] = [];
    for (let i = 0; i < 120; i++) {
      advance(popping, STEP);
      events.push(...popping.events);
      if (popping.player.lift < 40 && i < 60) press(popping);
    }
    expect(events).not.toContain("crash");
  });
});

describe("the pop", () => {
  it("lifts him off the swell, and gravity brings him back to ride", () => {
    const state = emptySea();
    press(state);
    expect(state.player.velocity).toBe(POP_VELOCITY);
    const events = play(state, 1);
    expect(events).toContain("land");
    expect(state.player.riding).toBe(true);
  });

  it("never flies off the top of the sea", () => {
    const state = emptySea();
    for (let i = 0; i < 200; i++) {
      press(state);
      advance(state, STEP * 3);
    }
    expect(state.player.lift).toBeLessThanOrEqual(CEILING);
  });
});

describe("scoring", () => {
  /** Flies him level through a gate, at `offset` from its middle. */
  const pass = (state: SurfState, offset: number) => {
    const g = gate(120, 100, START_GAP);
    state.obstacles.push(g);
    const middle = (g.floor + g.ceiling) / 2 - PLAYER.height / 2 + offset;
    state.player.riding = false;
    while (!g.passed && state.phase === "running") {
      state.player.lift = middle;
      state.player.velocity = 0;
      advance(state, STEP);
    }
    state.obstacles = [];
    state.player.lift = 0;
    state.player.riding = true;
  };

  it("pays a perfect pass, and climbs the multiplier on perfects in a row", () => {
    const state = emptySea();
    for (let combo = 1; combo <= MAX_COMBO + 1; combo++) {
      const before = state.bonus;
      pass(state, 4);
      expect(state.bonus - before).toBe(
        POINTS.perfect * Math.min(combo, MAX_COMBO),
      );
    }
    expect(state.combo).toBe(MAX_COMBO);
    const before = state.bonus;
    pass(state, 40);
    expect(state.bonus).toBe(before);
    expect(state.combo).toBe(1);
    expect(score(state)).toBe(state.gates * POINTS.gate + state.bonus);
  });

  it("pays a shell more the faster he goes, times the multiplier", () => {
    expect(shellValue(MAX_SPEED)).toBe(shellValue(START_SPEED) * 2);
    const state = emptySea(MAX_SPEED);
    state.combo = 3;
    state.pickups.push({
      kind: "shell",
      x: CENTRE + 4,
      lift: 20,
      taken: false,
    });
    const events = play(state, STEP * 3);
    expect(events).toContain("shell");
    expect(state.bonus).toBe(shellValue(MAX_SPEED) * 3);
  });

  it("forgives one hit with a dolphin", () => {
    const state = emptySea();
    state.pickups.push({
      kind: "dolphin",
      x: CENTRE + 4,
      lift: 16,
      taken: false,
    });
    expect(play(state, STEP * 3)).toContain("dolphin");
    expect(state.player.shield).toBe(true);

    state.obstacles.push(gate(200, 60));
    const events = play(state, 2);
    expect(events).toContain("saved");
    expect(events).not.toContain("crash");
    expect(state.player.shield).toBe(false);

    state.obstacles.push(gate(200, 60));
    expect(play(state, 2)).toContain("crash");
  });
});

/** Plays a run as the cabinet does, at an uneven frame rate, on autopilot. */
const playRecorded = (seed: number, frames = 20000) => {
  const state = createSurf(seed);
  const inputs: SurfInput[] = [];
  const pressed = () => {
    inputs.push({ step: state.steps, press: true });
    press(state);
  };
  pressed();
  for (let i = 0; i < frames && state.phase !== "over"; i++) {
    advance(state, i % 3 === 0 ? 1 / 30 : 1 / 90);
    autopilot(state, pressed);
  }
  return { state, inputs };
};

describe("a replayed run", () => {
  it("scores exactly as the run that was played", () => {
    for (const seed of [1, 42, 2026]) {
      const { state, inputs } = playRecorded(seed);
      expect(state.phase).toBe("over");
      expect(state.gates).toBeGreaterThan(3);
      const replay = replaySurf(seed, inputs);
      expect(replay?.phase).toBe("over");
      expect(replay && score(replay)).toBe(score(state));
      expect(replay?.steps).toBe(state.steps);
    }
  });

  it("skips releases, which Surf has no use for", () => {
    const { state, inputs } = playRecorded(5);
    const withReleases = inputs.flatMap((input) => [
      input,
      { step: input.step, press: false },
    ]);
    expect(replaySurf(5, withReleases)?.steps).toBe(state.steps);
  });

  it("refuses inputs out of order, or a run that never starts", () => {
    expect(replaySurf(1, [])).toBeNull();
    expect(replaySurf(1, [{ step: 5, press: true }])).toBeNull();
    expect(
      replaySurf(1, [
        { step: 0, press: true },
        { step: 40, press: true },
        { step: 20, press: true },
      ]),
    ).toBeNull();
  });

  it("ends a run left alone", () => {
    expect(replaySurf(1, [{ step: 0, press: true }])?.phase).toBe("over");
  });

  it("ignores what comes after the crash", () => {
    const { state, inputs } = playRecorded(3);
    const late = [...inputs, { step: state.steps + 500, press: true }];
    expect(replaySurf(3, late)?.steps).toBe(state.steps);
  });
});
