import { describe, expect, it } from "vitest";

import {
  advance,
  AIR_TIME,
  bestOf,
  createOllie,
  gapAfter,
  HOP_VELOCITY,
  JUMP_VELOCITY,
  kindsAt,
  MAX_FRAME,
  MAX_SPEED,
  OBSTACLE_SIZE,
  type OllieEvent,
  type OllieState,
  parseBest,
  PIGEON_ALTITUDE,
  PLAYER,
  press,
  random,
  release,
  score,
  SPARKLE_BONUS,
  START_SPEED,
  STEP,
  UNITS_PER_POINT,
} from "./ollie";

/** Runs the game for `seconds`, in 60fps frames, collecting every event. */
const play = (state: OllieState, seconds: number) => {
  const events: OllieEvent[] = [];
  for (let t = 0; t < seconds; t += 1 / 60) {
    advance(state, 1 / 60);
    events.push(...state.events);
  }
  return events;
};

/** A running game on an empty street (no furniture for a long while). */
const emptyStreet = () => {
  const state = createOllie(1);
  press(state);
  release(state);
  play(state, 1);
  state.obstacles = [];
  state.sparkles = [];
  state.untilNext = Infinity;
  return state;
};

const peakOf = (state: OllieState) => {
  let peak = 0;
  for (let i = 0; i < 240 && !state.player.grounded; i++) {
    advance(state, STEP);
    peak = Math.max(peak, state.player.lift);
  }
  return peak;
};

describe("the seeded street", () => {
  it("draws numbers in [0, 1), the same for the same seed", () => {
    let seed = 42;
    const first: number[] = [];
    for (let i = 0; i < 100; i++) {
      const [value, next] = random(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      first.push(value);
      seed = next;
    }
    expect(random(42)[0]).toBe(first[0]);
  });

  it("lays the same street for the same seed, and another for another", () => {
    const run = (seed: number) => {
      const state = createOllie(seed);
      press(state);
      // Keep jumping so the run lasts
      const kinds: string[] = [];
      for (let i = 0; i < 600; i++) {
        advance(state, 1 / 60);
        for (const obstacle of state.obstacles) kinds.push(obstacle.kind);
      }
      return { kinds: [...new Set(kinds)], seed: state.seed };
    };
    expect(run(7)).toEqual(run(7));
    expect(run(7).seed).not.toBe(run(8).seed);
  });

  it("always leaves room to land and jump again", () => {
    for (const speed of [START_SPEED, MAX_SPEED]) {
      expect(gapAfter(speed, 0)).toBeGreaterThan(speed * AIR_TIME);
    }
    expect(gapAfter(START_SPEED, 0.99)).toBeGreaterThan(
      gapAfter(START_SPEED, 0),
    );
  });

  it("gets busier as the score grows, with pigeons last", () => {
    expect(kindsAt(0)).not.toContain("bench");
    expect(kindsAt(0)).not.toContain("pigeon");
    expect(kindsAt(200)).toContain("bench");
    expect(kindsAt(200)).not.toContain("pigeon");
    expect(kindsAt(400)).toContain("pigeon");
  });
});

describe("a run", () => {
  it("waits for the first press, then starts with a jump", () => {
    const state = createOllie(3);
    advance(state, 1);
    expect(state.phase).toBe("ready");
    expect(state.distance).toBe(0);

    press(state);
    expect(state.phase).toBe("running");
    expect(state.events).toContain("jump");
    advance(state, 0.1);
    expect(state.distance).toBeGreaterThan(0);
  });

  it("speeds up, never past the top speed", () => {
    const state = emptyStreet();
    const early = state.speed;
    play(state, 10);
    expect(state.speed).toBeGreaterThan(early);
    play(state, 120);
    expect(state.speed).toBe(MAX_SPEED);
  });

  it("scores the distance, plus a bonus per sparkle", () => {
    const state = emptyStreet();
    expect(score(state)).toBe(Math.floor(state.distance / UNITS_PER_POINT));
    state.sparkles.push({ x: PLAYER.x + 10, lift: 30, taken: false });
    const before = score(state);
    const events = play(state, STEP * 2);
    expect(events).toContain("sparkle");
    expect(score(state)).toBeGreaterThanOrEqual(before + SPARKLE_BONUS);
    expect(state.sparkles).toHaveLength(0);
  });

  it("sounds a milestone every 100 points", () => {
    const state = emptyStreet();
    const events = play(state, 10);
    const milestones = events.filter((event) => event === "milestone");
    expect(milestones.length).toBe(Math.floor(score(state) / 100));
  });

  it("plays the same at 30, 60 or 144 frames a second", () => {
    const at = (fps: number) => {
      const state = emptyStreet();
      for (let i = 0; i < fps * 5; i++) advance(state, 1 / fps);
      return state.distance;
    };
    expect(at(30)).toBeCloseTo(at(60), -1);
    expect(at(144)).toBeCloseTo(at(60), -1);
  });

  it("never jumps ahead after a long frame (a hidden tab)", () => {
    const state = emptyStreet();
    const before = state.distance;
    advance(state, 30);
    expect(state.distance - before).toBeLessThanOrEqual(
      MAX_SPEED * MAX_FRAME + 1,
    );
  });
});

describe("the jump", () => {
  it("goes higher when held than when tapped", () => {
    const held = emptyStreet();
    press(held);
    const high = peakOf(held);

    const tapped = emptyStreet();
    press(tapped);
    release(tapped);
    const low = peakOf(tapped);

    expect(high).toBeCloseTo(JUMP_VELOCITY ** 2 / (2 * 2600), -1);
    expect(low).toBeLessThan(high);
    // Even a tap clears a cone
    expect(low).toBeGreaterThan(OBSTACLE_SIZE.cone.height);
    expect(low).toBeCloseTo(HOP_VELOCITY ** 2 / (2 * 2600), -1);
  });

  it("does not jump again in the air, but remembers a press just before landing", () => {
    const state = emptyStreet();
    press(state);
    release(state);
    advance(state, 0.1);
    press(state);
    release(state);
    expect(state.events).not.toContain("jump");

    // Falling, a few units above the street
    while (state.player.velocity > 0 || state.player.lift > 12) {
      advance(state, STEP);
    }
    press(state);

    // Land, then the buffered press jumps at once
    const events: OllieEvent[] = [];
    for (let i = 0; i < 120 && !events.includes("land"); i++) {
      advance(state, STEP);
      events.push(...state.events);
    }
    expect(events).toContain("land");
    expect(events.indexOf("jump")).toBeGreaterThan(events.indexOf("land"));
    expect(state.player.grounded).toBe(false);
  });
});

describe("the crash", () => {
  it("ends the run on a cone left unjumped", () => {
    const state = emptyStreet();
    state.obstacles.push({ kind: "cone", x: PLAYER.x + 120, lift: 0 });
    const events = play(state, 2);
    expect(events).toContain("crash");
    expect(state.phase).toBe("over");

    // A finished run no longer moves or jumps
    const distance = state.distance;
    press(state);
    advance(state, 1);
    expect(state.distance).toBe(distance);
  });

  it("clears a cone with a jump", () => {
    const state = emptyStreet();
    state.obstacles.push({ kind: "cone", x: PLAYER.x + 140, lift: 0 });
    press(state);
    const events = play(state, 1.5);
    expect(events).not.toContain("crash");
  });

  it("skates under a high pigeon, but a jump flies into it", () => {
    const under = emptyStreet();
    under.obstacles.push({
      kind: "pigeon",
      x: PLAYER.x + 140,
      lift: PIGEON_ALTITUDE.high,
    });
    expect(play(under, 1.5)).not.toContain("crash");

    // Jumping just as it comes: he rises into it
    const into = emptyStreet();
    into.obstacles.push({
      kind: "pigeon",
      x: PLAYER.x + PLAYER.width + 20,
      lift: PIGEON_ALTITUDE.high,
    });
    press(into);
    expect(play(into, 1.5)).toContain("crash");
  });

  it("must jump a low pigeon", () => {
    const state = emptyStreet();
    state.obstacles.push({
      kind: "pigeon",
      x: PLAYER.x + 140,
      lift: PIGEON_ALTITUDE.low,
    });
    expect(play(state, 1.5)).toContain("crash");
  });
});

describe("the best score", () => {
  it("keeps the better of the stored best and the run", () => {
    expect(bestOf(null, 120)).toBe(120);
    expect(bestOf(300, 120)).toBe(300);
    expect(bestOf(100, 120)).toBe(120);
  });

  it("reads only a whole, non-negative stored score", () => {
    expect(parseBest(null)).toBeNull();
    expect(parseBest("250")).toBe(250);
    expect(parseBest("-3")).toBeNull();
    expect(parseBest("12.5")).toBeNull();
    expect(parseBest("lol")).toBeNull();
  });
});
