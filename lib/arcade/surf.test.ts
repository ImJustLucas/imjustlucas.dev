import { describe, expect, it } from "vitest";

import {
  advance,
  CEILING,
  createSurf,
  floorRange,
  gapAt,
  type Gate,
  GRAVITY,
  HIGH_MIN,
  kindsAt,
  LOW_MIN,
  MAX_FRAME,
  MAX_SHIFT,
  MAX_SPEED,
  MIN_GAP,
  PLAYER,
  POP_VELOCITY,
  press,
  replaySurf,
  score,
  START_GAP,
  STEP,
  type SurfEvent,
  type SurfInput,
  type SurfState,
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

/** A running game on an empty sea (no gate for a long while), riding. */
const emptySea = () => {
  const state = createSurf(1);
  press(state);
  play(state, 1);
  state.obstacles = [];
  state.untilNext = Infinity;
  return state;
};

/** A gate whose gap spans `floor` to `floor + gap`, `ahead` units ahead. */
const gate = (ahead: number, floor: number, gap = START_GAP): Gate => ({
  x: PLAYER.x + PLAYER.width + ahead,
  low: "rock",
  high: "piling",
  floor,
  ceiling: floor + gap,
  passed: false,
});

/**
 * Pops whenever Lucas sinks below the middle of the next gap: the bot the
 * tests ride with, and record.
 */
const autopilot = (state: SurfState, pressed: () => void) => {
  const next = state.obstacles.find(
    (g) => g.x + 40 > PLAYER.x && g.x - PLAYER.x < 260,
  );
  const aim = next ? next.floor + (next.ceiling - next.floor) * 0.25 : 30;
  if (state.player.lift < aim && state.player.velocity <= 0) pressed();
};

const peakOf = (state: SurfState) => {
  let peak = state.player.lift;
  for (let i = 0; i < 240 && state.player.velocity >= 0; i++) {
    advance(state, STEP);
    peak = Math.max(peak, state.player.lift);
  }
  return peak;
};

describe("the seeded sea", () => {
  it("lays the same gates for the same seed, and others for another", () => {
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

  it("narrows the gap as the gates go by, never under the smallest", () => {
    expect(gapAt(0)).toBe(START_GAP);
    expect(gapAt(10)).toBeLessThan(gapAt(0));
    expect(gapAt(1000)).toBe(MIN_GAP);
  });

  it("always leaves a gap within reach of the last one", () => {
    for (const gap of [START_GAP, MIN_GAP]) {
      for (let last = LOW_MIN; last <= WORLD.sea; last += 7) {
        const { min, max } = floorRange(gap, last);
        expect(min).toBeLessThanOrEqual(max);
        expect(min).toBeGreaterThanOrEqual(LOW_MIN);
        expect(max + gap).toBeLessThanOrEqual(WORLD.sea - HIGH_MIN);
      }
    }
    // The tallest gap still has room for him under the sky
    expect(WORLD.sea - HIGH_MIN).toBeGreaterThan(PLAYER.height);
  });

  it("keeps every gate within reach on a long run", () => {
    const state = createSurf(2026);
    press(state);
    let last = LOW_MIN;
    const seen = new Set<Gate>();
    for (let i = 0; i < 6000 && state.phase === "running"; i++) {
      advance(state, 1 / 60);
      autopilot(state, () => press(state));
      for (const g of state.obstacles) {
        if (seen.has(g)) continue;
        seen.add(g);
        expect(Math.abs(g.floor - last)).toBeLessThanOrEqual(MAX_SHIFT);
        expect(g.floor).toBeGreaterThanOrEqual(LOW_MIN);
        expect(g.ceiling).toBeLessThanOrEqual(WORLD.sea - HIGH_MIN);
        last = g.floor;
      }
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it("gets busier as the score grows, with gulls last", () => {
    expect(kindsAt(0)).toEqual({ low: ["rock"], high: ["piling"] });
    expect(kindsAt(8).low).toContain("buoy");
    expect(kindsAt(8).high).not.toContain("gulls");
    expect(kindsAt(20).high).toContain("gulls");
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
    expect(state.player.lift).toBeGreaterThan(0);
  });

  it("speeds up, never past the top speed", () => {
    const state = emptySea();
    const early = state.speed;
    play(state, 10);
    expect(state.speed).toBeGreaterThan(early);
    play(state, 120);
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

describe("the pop", () => {
  it("lifts him off the swell, and gravity brings him back to ride", () => {
    const state = emptySea();
    expect(state.player.riding).toBe(true);
    press(state);
    expect(peakOf(state)).toBeCloseTo(POP_VELOCITY ** 2 / (2 * GRAVITY), -1);
    const events = play(state, 2);
    expect(events).toContain("land");
    expect(state.player.riding).toBe(true);
    expect(state.player.lift).toBe(0);
  });

  it("pops again in the air, climbing higher", () => {
    const state = emptySea();
    press(state);
    const first = peakOf(state);
    press(state);
    expect(state.events).toContain("pop");
    expect(peakOf(state)).toBeGreaterThan(first * 1.5);
  });

  it("never flies off the top of the sea", () => {
    const state = emptySea();
    for (let i = 0; i < 200; i++) {
      press(state);
      advance(state, 0.05);
    }
    expect(state.player.lift).toBeLessThanOrEqual(CEILING);
    expect(WORLD.sea - CEILING - PLAYER.height).toBeGreaterThan(0);
  });
});

describe("a gate", () => {
  it("ends the run when he rides into the rock", () => {
    const state = emptySea();
    state.obstacles.push(gate(60, LOW_MIN));
    const events = play(state, 2);
    expect(events).toContain("crash");
    expect(state.phase).toBe("over");

    // A finished run no longer moves or pops
    const distance = state.distance;
    press(state);
    advance(state, 1);
    expect(state.distance).toBe(distance);
  });

  it("scores when he flies through the gap", () => {
    const state = emptySea();
    state.obstacles.push(gate(120, 40));
    const events: SurfEvent[] = [];
    for (let i = 0; i < 180; i++) {
      advance(state, 1 / 60);
      events.push(...state.events);
      autopilot(state, () => press(state));
    }
    expect(events).not.toContain("crash");
    expect(events).toContain("gate");
    expect(score(state)).toBe(1);
  });

  it("ends the run when he pops into the piling", () => {
    const state = emptySea();
    // High in the air, popping on into a gap low over the sea
    state.player = { lift: 150, velocity: 0, riding: false };
    state.obstacles.push(gate(40, LOW_MIN, MIN_GAP));
    const events: SurfEvent[] = [];
    for (let i = 0; i < 120 && state.phase === "running"; i++) {
      if (i % 8 === 0) press(state);
      advance(state, 1 / 60);
      events.push(...state.events);
    }
    expect(events).toContain("crash");
    expect(state.player.lift + PLAYER.height).toBeGreaterThan(
      LOW_MIN + MIN_GAP,
    );
  });

  it("sounds a milestone every 10 gates, instead of the gate", () => {
    const state = emptySea();
    state.gates = 9;
    state.obstacles.push({ ...gate(-20, 40), x: PLAYER.x - 40 });
    advance(state, STEP);
    expect(state.events).toContain("milestone");
    expect(state.events).not.toContain("gate");
    expect(score(state)).toBe(10);
  });
});

/**
 * Plays a run as the cabinet does, at an uneven frame rate, on autopilot,
 * and records every press (and, like Ollie's cabinet, the releases).
 */
const playRecorded = (seed: number, frames = 20000) => {
  const state = createSurf(seed);
  const inputs: SurfInput[] = [];
  const pressed = () => {
    inputs.push({ step: state.steps, press: true });
    press(state);
    inputs.push({ step: state.steps, press: false });
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
      const replay = replaySurf(seed, inputs);
      expect(replay?.phase).toBe("over");
      expect(replay && score(replay)).toBe(score(state));
      expect(replay?.steps).toBe(state.steps);
    }
  });

  it("is a run the autopilot gets through a few gates of", () => {
    const { state } = playRecorded(42);
    expect(score(state)).toBeGreaterThan(2);
  });

  it("scores differently on another seed", () => {
    const { state, inputs } = playRecorded(7);
    const other = replaySurf(8, inputs);
    expect(
      other === null ||
        score(other) !== score(state) ||
        other.steps !== state.steps,
    ).toBe(true);
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

  it("ends a run left alone on the first rock", () => {
    const replay = replaySurf(1, [{ step: 0, press: true }]);
    expect(replay?.phase).toBe("over");
    expect(replay && score(replay)).toBe(0);
  });

  it("ignores what comes after the crash", () => {
    const { state, inputs } = playRecorded(3);
    const late = [...inputs, { step: state.steps + 500, press: true }];
    expect(replaySurf(3, late)?.steps).toBe(state.steps);
  });
});
