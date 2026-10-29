import { describe, expect, it } from "vitest";

import {
  advance,
  createOllie,
  FLIP_TIME,
  GAP_SHRINK,
  GAP_TIME,
  gapTime,
  HOP_VELOCITY,
  JUMP_VELOCITY,
  layPattern,
  MAX_COMBO,
  MAX_FRAME,
  MAX_SPEED,
  OBSTACLE_SIZE,
  type ObstacleKind,
  type OllieAward,
  type OllieEvent,
  type OllieInput,
  type OllieState,
  type PatternId,
  PATTERNS,
  patternsAt,
  PIGEON_ALTITUDE,
  PLAYER,
  POINTS,
  press,
  release,
  replayOllie,
  score,
  sparkleValue,
  START_SPEED,
  STEP,
  TIER_TIME,
  tierAt,
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

/** Runs the game step by step until `done`, collecting every award. */
const awardsUntil = (state: OllieState, done: () => boolean) => {
  const awards: OllieAward[] = [];
  for (let i = 0; i < 600 && state.phase === "running" && !done(); i++) {
    advance(state, STEP);
    awards.push(...state.awards);
  }
  return awards;
};

/** A running game on an empty street (no furniture for a long while). */
const emptyStreet = (speed?: number) => {
  const state = createOllie(1);
  press(state);
  release(state);
  play(state, 1);
  state.obstacles = [];
  state.sparkles = [];
  state.untilNext = Infinity;
  if (speed) state.speed = speed;
  return state;
};

const put = (state: OllieState, kind: ObstacleKind, x: number, lift = 0) => {
  const obstacle = { kind, x, lift, passed: false };
  state.obstacles.push(obstacle);
  return obstacle;
};

const peakOf = (state: OllieState) => {
  let peak = 0;
  for (let i = 0; i < 240 && !state.player.grounded; i++) {
    advance(state, STEP);
    peak = Math.max(peak, state.player.lift);
  }
  return peak;
};

const land = (state: OllieState) => {
  for (let i = 0; i < 240 && !state.player.grounded; i++) advance(state, STEP);
};

/**
 * A held jump, then a kickflip: let go once the rise is past a hop's (an
 * earlier release makes it a hop), then press again.
 */
const jumpAndFlip = (state: OllieState) => {
  press(state);
  while (state.player.velocity > HOP_VELOCITY) advance(state, STEP);
  release(state);
  press(state);
  release(state);
};

const clone = (state: OllieState) => structuredClone(state);

/** Plays on until he lands, or the run ends. */
const fly = (state: OllieState) => {
  for (let i = 0; i < 240; i++) {
    if (state.phase !== "running" || state.player.grounded) break;
    advance(state, STEP);
    if (state.player.holding && state.player.velocity < 0) release(state);
  }
  return state;
};

/**
 * Whether some way of jumping, at most `jumps` times, gets Lucas past all
 * the furniture on the street without a crash: a search over every step on
 * the ground, waiting, tapping or holding the button.
 */
const clearable = (start: OllieState, jumps = Infinity) => {
  const queue: Array<[OllieState, number]> = [[fly(clone(start)), 0]];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const [state, used] = queue.pop()!;
    if (state.phase !== "running") continue;
    if (state.obstacles.every((obstacle) => obstacle.passed)) return true;
    const key = `${state.steps}:${state.player.lift}:${used}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const wait = clone(state);
    advance(wait, STEP * 2);
    queue.push([fly(wait), used]);
    if (used >= jumps) continue;
    for (const hold of [false, true]) {
      const jumped = clone(state);
      press(jumped);
      if (!hold) release(jumped);
      queue.push([fly(jumped), used + 1]);
    }
  }
  return false;
};

/** Patterns laid one after the other, `gap` seconds of street apart. */
const street = (speed: number, ids: PatternId[], gap: number) => {
  const state = emptyStreet(speed);
  let x = 720;
  for (const id of ids) {
    const laid = layPattern(state, id, x);
    const last = laid[laid.length - 1];
    x = last.x + OBSTACLE_SIZE[last.kind].width + gap * speed;
  }
  return state;
};

const PATTERN_IDS = Object.keys(PATTERNS) as PatternId[];

describe("the seeded street", () => {
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

  it("leaves less and less time between the furniture, from about 1.9s to 0.8s", () => {
    expect(gapTime(0, 0.5)).toBeCloseTo(GAP_TIME.start);
    expect(gapTime(GAP_SHRINK, 0.5)).toBeCloseTo(GAP_TIME.end);
    expect(gapTime(GAP_SHRINK * 4, 0.5)).toBeCloseTo(GAP_TIME.end);
    expect(gapTime(60, 0.5)).toBeLessThan(gapTime(30, 0.5));
    expect(gapTime(60, 0.99)).toBeGreaterThan(gapTime(60, 0));
  });

  it("brings the harder patterns level by level", () => {
    expect(patternsAt(1)).toEqual(["cone", "bin", "bench"]);
    expect(patternsAt(2)).toContain("highPigeon");
    expect(patternsAt(2)).not.toContain("rejump");
    expect(patternsAt(3)).toContain("rejump");
    expect(patternsAt(4)).toContain("benchPigeon");
    expect(patternsAt(4)).not.toContain("pigeonBin");
    expect(patternsAt(5)).toEqual(PATTERN_IDS);
  });
});

describe("a fair street", () => {
  it("knows a wall when it sees one", () => {
    const state = emptyStreet(MAX_SPEED);
    for (let lift = 0; lift < 260; lift += 20) put(state, "pigeon", 600, lift);
    expect(clearable(state)).toBe(false);
  });

  it("lets every pattern be cleared, slow or fast", () => {
    for (const speed of [START_SPEED, 600, MAX_SPEED]) {
      for (const id of PATTERN_IDS) {
        expect(clearable(street(speed, [id], 0)), `${id} at ${speed}`).toBe(
          true,
        );
      }
    }
  });

  it("lets any pattern follow any other at the shortest gap and top speed", () => {
    const gap = gapTime(Infinity, 0);
    for (const a of PATTERN_IDS) {
      for (const b of PATTERN_IDS) {
        expect(clearable(street(MAX_SPEED, [a, b], gap)), `${a}, ${b}`).toBe(
          true,
        );
      }
    }
  });

  it("asks for a second jump straight after landing on the two close cones", () => {
    for (const speed of [START_SPEED, 600, MAX_SPEED]) {
      expect(clearable(street(speed, ["rejump"], 0), 1)).toBe(false);
      expect(clearable(street(speed, ["rejump"], 0), 2)).toBe(true);
    }
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

  it("speeds up, to its top speed within a minute", () => {
    const state = emptyStreet();
    const early = state.speed;
    play(state, 10);
    expect(state.speed).toBeGreaterThan(early);
    play(state, 50);
    expect(state.speed).toBe(MAX_SPEED);
  });

  it("goes up a level every 30 seconds, with its cue", () => {
    expect(tierAt(0)).toBe(1);
    expect(tierAt(TIER_TIME - 0.01)).toBe(1);
    expect(tierAt(TIER_TIME)).toBe(2);
    expect(tierAt(TIER_TIME * 3.5)).toBe(4);

    const state = emptyStreet();
    const events = play(state, TIER_TIME * 2);
    expect(events.filter((event) => event === "tier")).toHaveLength(2);
    expect(state.tier).toBe(3);
  });

  it("scores the distance, plus every trick and sparkle", () => {
    const state = emptyStreet();
    expect(score(state)).toBe(Math.floor(state.distance / UNITS_PER_POINT));
    state.bonus = 120;
    expect(score(state)).toBe(
      Math.floor(state.distance / UNITS_PER_POINT) + 120,
    );
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

  it("remembers a press just before landing, and jumps again on landing", () => {
    const state = emptyStreet();
    press(state);
    release(state);
    // Falling, a few units above the street
    while (state.player.velocity > 0 || state.player.lift > 12) {
      advance(state, STEP);
    }
    press(state);
    expect(state.events).not.toContain("kickflip");

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

describe("the kickflip", () => {
  it("turns on a second press in the air, and scores once landed", () => {
    const state = emptyStreet();
    jumpAndFlip(state);
    expect(state.events).toContain("kickflip");
    expect(state.player.flip).toBe(FLIP_TIME);

    const awards = awardsUntil(state, () => state.player.grounded);
    expect(state.phase).toBe("running");
    expect(awards).toEqual([
      expect.objectContaining({
        kind: "kickflip",
        points: POINTS.kickflip,
        combo: 1,
      }),
    ]);
    expect(state.bonus).toBe(POINTS.kickflip);
  });

  it("ends the run when he lands mid-trick", () => {
    const state = emptyStreet();
    press(state);
    release(state);
    // At the top of a hop: too late to finish the flip, too early to jump
    // again on landing
    while (state.player.velocity > 0) advance(state, STEP);
    press(state);
    expect(state.events).toContain("kickflip");
    land(state);
    expect(state.phase).toBe("over");
  });

  it("flips twice in a held jump", () => {
    const state = emptyStreet();
    jumpAndFlip(state);
    while (state.player.flip > 0) advance(state, STEP);
    press(state);
    release(state);
    const awards = awardsUntil(state, () => state.player.grounded);
    expect(state.phase).toBe("running");
    expect(awards[0]).toMatchObject({ points: POINTS.kickflip * 2 });
  });
});

describe("the combo", () => {
  /** Jumps a cone, with or without a kickflip, and returns the awards. */
  const clearCone = (state: OllieState, flip: boolean) => {
    land(state);
    put(state, "cone", PLAYER.x + 140);
    if (flip) jumpAndFlip(state);
    else press(state);
    const awards = awardsUntil(state, () => state.player.grounded);
    expect(state.phase).toBe("running");
    return awards;
  };

  it("climbs with every clear in style, up to x5, and drops on a plain one", () => {
    const state = emptyStreet();
    for (let combo = 1; combo <= MAX_COMBO + 1; combo++) {
      const [award] = clearCone(state, true);
      expect(award).toMatchObject({
        kind: "trick",
        points: POINTS.clear + POINTS.kickflip,
        combo: Math.min(combo, MAX_COMBO),
      });
    }
    expect(state.combo).toBe(MAX_COMBO);

    const [plain] = clearCone(state, false);
    expect(plain).toMatchObject({ kind: "clear", combo: 1 });
    expect(state.combo).toBe(1);
  });

  it("multiplies a sparkle, worth more the faster he goes", () => {
    expect(sparkleValue(MAX_SPEED)).toBeGreaterThan(
      sparkleValue(START_SPEED) * 2,
    );
    expect(sparkleValue(START_SPEED)).toBeGreaterThanOrEqual(60);

    const state = emptyStreet(MAX_SPEED);
    state.combo = 3;
    state.sparkles.push({ x: PLAYER.x + 10, lift: 30, taken: false });
    const before = state.bonus;
    const events = play(state, STEP * 2);
    expect(events).toContain("sparkle");
    expect(state.bonus - before).toBe(sparkleValue(MAX_SPEED) * 3);
    expect(state.sparkles).toHaveLength(0);
  });

  it("counts a high pigeon skated under as style", () => {
    const state = emptyStreet();
    put(state, "pigeon", PLAYER.x + 140, PIGEON_ALTITUDE.high);
    const awards = awardsUntil(state, () => state.obstacles[0].passed);
    expect(awards).toEqual([
      expect.objectContaining({ kind: "under", combo: 1 }),
    ]);
    expect(state.combo).toBe(2);
  });
});

describe("the grind", () => {
  /** Jumps onto a bench coming his way. */
  const ontoBench = () => {
    const state = emptyStreet();
    const bench = put(state, "bench", PLAYER.x + 110);
    // A hop comes down on it
    press(state);
    release(state);
    for (let i = 0; i < 240 && !state.player.rail; i++) advance(state, STEP);
    return { state, bench };
  };

  it("rides a bench he lands on, and scores the ride once off it", () => {
    const { state, bench } = ontoBench();
    expect(state.phase).toBe("running");
    expect(state.player.rail).toBe(bench);
    expect(state.player.grounded).toBe(true);
    expect(state.player.lift).toBe(OBSTACLE_SIZE.bench.height);

    const awards = awardsUntil(state, () => state.player.rail === null);
    expect(awards).toEqual([
      expect.objectContaining({ kind: "grind", combo: 1 }),
    ]);
    expect(awards[0].points).toBeGreaterThan(POINTS.clear + 10);
    expect(state.combo).toBe(2);

    // Off the end, he drops back to the street
    land(state);
    expect(state.phase).toBe("running");
    expect(state.player.lift).toBe(0);
  });

  it("jumps off the bench, even just past its end", () => {
    const { state } = ontoBench();
    awardsUntil(state, () => state.player.rail === null);
    advance(state, STEP * 3);
    press(state);
    expect(state.events).toContain("jump");
    expect(state.player.velocity).toBe(JUMP_VELOCITY);
  });

  it("still crashes into a bench's side", () => {
    const state = emptyStreet();
    put(state, "bench", PLAYER.x + 120);
    expect(play(state, 1)).toContain("crash");
  });
});

describe("the crash", () => {
  it("ends the run on a cone left unjumped", () => {
    const state = emptyStreet();
    put(state, "cone", PLAYER.x + 120);
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
    put(state, "cone", PLAYER.x + 140);
    press(state);
    const events = play(state, 1.5);
    expect(events).not.toContain("crash");
  });

  it("skates under a high pigeon, but a jump flies into it", () => {
    const under = emptyStreet();
    put(under, "pigeon", PLAYER.x + 140, PIGEON_ALTITUDE.high);
    expect(play(under, 1.5)).not.toContain("crash");

    // Jumping just as it comes: he rises into it
    const into = emptyStreet();
    put(into, "pigeon", PLAYER.x + PLAYER.width + 20, PIGEON_ALTITUDE.high);
    press(into);
    expect(play(into, 1.5)).toContain("crash");
  });

  it("must jump a low pigeon", () => {
    const state = emptyStreet();
    put(state, "pigeon", PLAYER.x + 140, PIGEON_ALTITUDE.low);
    expect(play(state, 1.5)).toContain("crash");
  });
});

/**
 * Plays a run as the cabinet does, at an uneven frame rate, jumping whenever
 * a cone or bin is close and kickflipping now and then, and records every
 * press and release.
 */
const playRecorded = (seed: number, frames = 6000) => {
  const state = createOllie(seed);
  const inputs: OllieInput[] = [];
  const input = (pressed: boolean) => {
    inputs.push({ step: state.steps, press: pressed });
    if (pressed) press(state);
    else release(state);
  };
  input(true);
  input(false);
  for (let i = 0; i < frames && state.phase !== "over"; i++) {
    advance(state, i % 3 === 0 ? 1 / 30 : 1 / 90);
    const near = state.obstacles.find(
      (o) => o.x > PLAYER.x && o.x - PLAYER.x < 70 && o.kind !== "pigeon",
    );
    if (near && state.player.grounded) input(true);
    else if (
      !state.player.grounded &&
      !state.player.holding &&
      state.player.velocity > 300 &&
      i % 2 === 0
    ) {
      input(true);
      input(false);
    }
    if (
      !state.player.grounded &&
      state.player.velocity < 0 &&
      state.player.holding
    ) {
      input(false);
    }
  }
  return { state, inputs };
};

describe("a replayed run", () => {
  it("scores exactly as the run that was played", () => {
    for (const seed of [1, 42, 2026]) {
      const { state, inputs } = playRecorded(seed);
      expect(state.phase).toBe("over");
      // Tricks and combos made it
      expect(state.bonus).toBeGreaterThan(0);
      const replay = replayOllie(seed, inputs);
      expect(replay?.phase).toBe("over");
      expect(replay && score(replay)).toBe(score(state));
      expect(replay?.combo).toBe(state.combo);
      expect(replay?.steps).toBe(state.steps);
    }
  });

  it("scores differently on another seed", () => {
    const { state, inputs } = playRecorded(7);
    const other = replayOllie(8, inputs);
    expect(other === null || score(other) !== score(state)).toBe(true);
  });

  it("refuses inputs out of order, or a run that never starts", () => {
    expect(replayOllie(1, [])).toBeNull();
    expect(replayOllie(1, [{ step: 5, press: true }])).toBeNull();
    expect(
      replayOllie(1, [
        { step: 0, press: true },
        { step: 40, press: false },
        { step: 20, press: true },
      ]),
    ).toBeNull();
  });

  it("ignores what comes after the crash", () => {
    const { state, inputs } = playRecorded(3);
    const late = [...inputs, { step: state.steps + 500, press: true }];
    expect(replayOllie(3, late)?.steps).toBe(state.steps);
  });
});
