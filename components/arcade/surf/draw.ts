import {
  blend,
  drawOverlay,
  OUTLINE,
  RIM,
  STYLE_INK,
} from "@/components/arcade/canvas-text";
import {
  ceilingOf,
  floorOf,
  type Gate,
  HAZARD,
  type Hazard,
  OBSTACLE_WIDTH,
  type Pickup,
  PLAYER,
  POP_VELOCITY,
  type SurfAward,
  type SurfState,
  swellAt,
  TUBE,
  WORLD,
} from "@/lib/arcade/surf";

import { sparklePath } from "../ollie/draw";

/**
 * Draws Surf's sea on a 2D canvas (DESIGN.md, Arcade). The game has its own
 * palette, the sea and sand of the site's "surf" palette carried into a
 * coast from dawn to day to sunset to night, level by level (always night
 * by Lucas's night in Paris), never the site's palette. Everything is drawn
 * in world units; the caller sets the transform from the world to the
 * canvas.
 */

export type SurfArt = {
  /** On the board: the riding pose, on the swell and in the air. */
  readonly ride: HTMLImageElement | null;
  /** The crash, and floating after it. */
  readonly wipeout: HTMLImageElement | null;
  /** A new best: the surf pose, board under the arm, waist-deep. */
  readonly shaka: HTMLImageElement | null;
};

/** The pose Lucas takes once a run is over. */
export type SurfEnding = "wipeout" | "shaka";

/** Seconds after the crash when the fall gives way to the end pose. */
export const END_POSE_AT = 0.7;

export type SurfScene = {
  readonly night: boolean;
  readonly reducedMotion: boolean;
  readonly art: SurfArt;
  /** Seconds since the crash, or null while he rides. */
  readonly crashAge: number | null;
  /** The end pose of a finished run, once the fall has played. */
  readonly ending: SurfEnding | null;
  /** Seconds on a free-running clock, for idle motion (swell, wings). */
  readonly now: number;
  /** Seconds since the level last went up, for the sky's fade. */
  readonly tierAge: number;
  /** Points won lately, with their age in seconds, for the popups. */
  readonly popups: ReadonlyArray<{
    readonly award: SurfAward;
    readonly age: number;
  }>;
  /** The level just reached, and its age in seconds, for its banner. */
  readonly banner: { readonly tier: number; readonly age: number } | null;
  /** A level's name in the visitor's Locale. */
  readonly levelLabel: (tier: number) => string;
  /** The family of the site's Data font, for the text over the sea. */
  readonly font: string;
};

type Palette = {
  readonly skyTop: string;
  readonly skyLow: string;
  readonly sun: string;
  readonly cloud: string;
  readonly headland: string;
  readonly headlandShade: string;
  readonly beach: string;
  readonly lighthouse: string;
  readonly lighthouseBand: string;
  readonly beam: string;
  readonly seaFar: string;
  readonly seaNear: string;
  readonly glitter: string;
  readonly swell: string;
  readonly swellFoam: string;
  readonly front: string;
  readonly frontDeep: string;
  readonly foam: string;
  readonly haze: string;
  readonly shadow: string;
};

const COAST: Readonly<Record<"dawn" | "day" | "sunset" | "night", Palette>> = {
  // The first light, pink over a pale sea
  dawn: {
    skyTop: "#7fa6d6",
    skyLow: "#ffd6c2",
    sun: "#ffe2b8",
    cloud: "rgba(255, 226, 214, 0.8)",
    headland: "#a7b8cf",
    headlandShade: "#95a8c2",
    beach: "#e8cfb4",
    lighthouse: "#fffaf0",
    lighthouseBand: "#e2574c",
    beam: "rgba(255, 227, 161, 0.1)",
    seaFar: "#7cc6c6",
    seaNear: "#2a98a6",
    glitter: "rgba(255, 236, 220, 0.75)",
    swell: "#5ab6b8",
    swellFoam: "rgba(245, 240, 240, 0.7)",
    front: "#1a7a8a",
    frontDeep: "#0d5462",
    foam: "#f6f3f2",
    haze: "rgba(255, 214, 194, 0.3)",
    shadow: "rgba(20, 40, 60, 0.22)",
  },
  day: {
    skyTop: "#8fd8e6",
    skyLow: "#fdf0d5",
    sun: "#fff4cf",
    cloud: "rgba(255, 255, 255, 0.85)",
    headland: "#9cc7c9",
    headlandShade: "#86b6b8",
    beach: "#e9d8b4",
    lighthouse: "#fffaf0",
    lighthouseBand: "#e2574c",
    beam: "rgba(255, 227, 161, 0)",
    seaFar: "#5fd0bd",
    seaNear: "#1fa3a3",
    glitter: "rgba(255, 250, 240, 0.7)",
    swell: "#4cc3b3",
    swellFoam: "rgba(241, 247, 246, 0.75)",
    front: "#127c84",
    frontDeep: "#0b5560",
    foam: "#f1f7f6",
    haze: "rgba(253, 240, 213, 0.32)",
    shadow: "rgba(11, 43, 53, 0.22)",
  },
  // The sun going down behind the sea
  sunset: {
    skyTop: "#3b3f7a",
    skyLow: "#ff8a5c",
    sun: "#ffb36b",
    cloud: "rgba(255, 170, 140, 0.6)",
    headland: "#5b5a80",
    headlandShade: "#4d4c72",
    beach: "#c99a7c",
    lighthouse: "#f3e6da",
    lighthouseBand: "#c94c43",
    beam: "rgba(255, 227, 161, 0.14)",
    seaFar: "#c7766a",
    seaNear: "#2c5f73",
    glitter: "rgba(255, 200, 150, 0.8)",
    swell: "#3f6f80",
    swellFoam: "rgba(255, 220, 200, 0.55)",
    front: "#1d4f60",
    frontDeep: "#0e3040",
    foam: "#f6e6dc",
    haze: "rgba(255, 150, 110, 0.22)",
    shadow: "rgba(20, 10, 30, 0.3)",
  },
  night: {
    skyTop: "#04161a",
    skyLow: "#0f3a42",
    sun: "#fff1c9",
    cloud: "rgba(255, 255, 255, 0.05)",
    headland: "#0a2a30",
    headlandShade: "#082429",
    beach: "#5a5444",
    lighthouse: "#cfe3e1",
    lighthouseBand: "#a8443c",
    beam: "rgba(255, 227, 161, 0.22)",
    seaFar: "#0f3a42",
    seaNear: "#082a30",
    glitter: "rgba(233, 216, 180, 0.55)",
    swell: "#1e5a63",
    swellFoam: "rgba(169, 207, 208, 0.45)",
    front: "#0a3038",
    frontDeep: "#04161a",
    foam: "#cfe3e1",
    haze: "rgba(4, 22, 26, 0.3)",
    shadow: "rgba(0, 0, 0, 0.35)",
  },
};

/**
 * How far the day has gone: 0 at dawn, 1 by day, 2 at sunset, 3 at night,
 * a step a level, each fading in over `SKY_FADE` seconds; by Lucas's night
 * in Paris it is night from the start.
 */
const SKY_FADE = 3;

export const skyAt = (tier: number, tierAge: number, night: boolean) => {
  if (night) return 3;
  const to = Math.min(tier, 4) - 1;
  if (to === 0) return 0;
  const from = Math.min(tier - 1, 4) - 1;
  return from + (to - from) * Math.min(Math.max(tierAge / SKY_FADE, 0), 1);
};

/** Whether the sky is dark enough for the light ink (from sunset on). */
export const darkSky = (tier: number, tierAge: number, night: boolean) =>
  skyAt(tier, tierAge, night) >= 2;

/** The coast's colours at a time of day, with how dark it is (0 to 1). */
type Coast = Palette & { readonly time: number; readonly dark: number };

let lastCoast: Coast | null = null;

const coastAt = (time: number): Coast => {
  const key = Math.round(time * 100) / 100;
  if (lastCoast?.time === key) return lastCoast;
  lastCoast = {
    ...blend([COAST.dawn, COAST.day, COAST.sunset, COAST.night], key),
    time: key,
    dark: Math.min(Math.max(key - 2, 0), 1),
  };
  return lastCoast;
};
const ROCK = "#76707c";
const ROCK_LIGHT = "#948e9a";
const ROCK_DARK = "#5a5560";
const WEED = "#3f8f5a";
const BEACON_RED = "#e2574c";
const BEACON_WHITE = "#fffaf0";
const BEACON_LAMP = "#ffd84d";
const WOOD = "#a8734a";
const WOOD_DARK = "#7f5236";
const WOOD_WET = "#5e3d2a";
const BARNACLE = "#e9d8b4";
const GULL = "#fbfbf7";
const GULL_WING = "#8d99a3";
const GULL_TIP = "#2b2f3a";
const GULL_BEAK = "#f2b33d";
const SPARKLE_FILL = "#fffaf0";
const SPARKLE_LINE = "#1fa3a3";

/** Where the horizon sits: the sky above, the open sea below. */
const HORIZON = 214;

/** A stable pseudo-random number in [0, 1) for a slot of the coast. */
const hash = (n: number, salt = 0) => {
  let x = (Math.imul(n, 374761393) + Math.imul(salt + 1, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

/** The slots of a repeating layer that are on screen, with their left x. */
const slots = (offset: number, width: number) => {
  const first = Math.floor(offset / width) - 1;
  const count = Math.ceil(WORLD.width / width) + 3;
  return Array.from({ length: count }, (_, k) => {
    const index = first + k;
    return { index, x: index * width - offset };
  });
};

const sky = (ctx: CanvasRenderingContext2D, coast: Coast, scene: SurfScene) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, HORIZON);
  gradient.addColorStop(0, coast.skyTop);
  gradient.addColorStop(1, coast.skyLow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, HORIZON);

  // The sun climbs from the sea at dawn and sinks into it at sunset
  if (coast.dark < 1) {
    const t = coast.time;
    const y = t <= 1 ? 190 - 40 * t : 150 + 50 * (t - 1);
    ctx.globalAlpha = 1 - coast.dark;
    const glow = ctx.createRadialGradient(470, y, 10, 470, y, 110);
    glow.addColorStop(0, "rgba(255, 244, 207, 0.9)");
    glow.addColorStop(1, "rgba(255, 244, 207, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(360, 40, 220, HORIZON - 40);
    ctx.fillStyle = coast.sun;
    ctx.beginPath();
    ctx.arc(470, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (coast.dark > 0) {
    for (let i = 0; i < 52; i++) {
      const twinkle = scene.reducedMotion
        ? 0.7
        : 0.45 + 0.55 * Math.abs(Math.sin(scene.now * 1.2 + i * 1.7));
      ctx.globalAlpha = coast.dark * twinkle * (0.4 + hash(i, 3) * 0.6);
      ctx.fillStyle = "#fff6e0";
      const size = hash(i, 4) < 0.15 ? 2 : 1.2;
      ctx.fillRect(hash(i, 1) * WORLD.width, hash(i, 2) * 170, size, size);
    }
    ctx.globalAlpha = 1;
  }
  if (coast.dark >= 0.5) {
    // The moon, a crescent, over the sea
    ctx.fillStyle = coast.sun;
    ctx.beginPath();
    ctx.arc(468, 64, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = coast.skyTop;
    ctx.beginPath();
    ctx.arc(478, 56, 19, 0, Math.PI * 2);
    ctx.fill();
  }
};

const clouds = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  offset: number,
) => {
  ctx.globalAlpha = 1 - coast.dark;
  ctx.fillStyle = coast.cloud;
  for (const { index, x } of slots(offset, 280)) {
    if (hash(index, 9) < 0.5) continue;
    const y = 36 + hash(index, 10) * 70;
    const cx = x + hash(index, 11) * 130;
    ctx.beginPath();
    ctx.arc(cx, y, 14, 0, Math.PI * 2);
    ctx.arc(cx + 18, y - 7, 18, 0, Math.PI * 2);
    ctx.arc(cx + 38, y, 13, 0, Math.PI * 2);
    ctx.rect(cx, y, 38, 13);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const lighthouse = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  x: number,
  base: number,
  scene: SurfScene,
) => {
  // The beam sweeps at night, still under reduced motion
  if (coast.dark > 0 || coast.time < 0.5) {
    const sweep = scene.reducedMotion ? 0.4 : Math.sin(scene.now * 0.9);
    ctx.save();
    ctx.translate(x, base - 50);
    ctx.rotate(sweep * 0.5 + Math.PI);
    ctx.fillStyle = coast.beam;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-220, -26);
    ctx.lineTo(-220, 26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = coast.lighthouse;
  ctx.beginPath();
  ctx.moveTo(x - 7, base);
  ctx.lineTo(x - 5, base - 44);
  ctx.lineTo(x + 5, base - 44);
  ctx.lineTo(x + 7, base);
  ctx.fill();
  ctx.fillStyle = coast.lighthouseBand;
  ctx.fillRect(x - 6.4, base - 18, 12.8, 7);
  ctx.fillRect(x - 5.6, base - 36, 11.2, 7);
  ctx.fillRect(x - 6, base - 52, 12, 8);
  ctx.fillStyle = coast.dark > 0.5 ? "#ffe3a1" : coast.lighthouse;
  ctx.fillRect(x - 4, base - 50, 8, 5);
};

/** The far coast: headlands, a strip of beach, now and then a lighthouse. */
const headlands = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  offset: number,
  scene: SurfScene,
) => {
  const base = HORIZON;
  for (const { index, x } of slots(offset, 220)) {
    if (hash(index, 20) < 0.35) continue;
    const height = 18 + hash(index, 21) * 34;
    const width = 120 + hash(index, 22) * 90;
    ctx.fillStyle =
      hash(index, 23) < 0.5 ? coast.headland : coast.headlandShade;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.bezierCurveTo(
      x + width * 0.2,
      base - height,
      x + width * 0.55,
      base - height * 1.1,
      x + width * 0.75,
      base - height * 0.7,
    );
    ctx.quadraticCurveTo(x + width * 0.9, base - height * 0.4, x + width, base);
    ctx.fill();
    ctx.fillStyle = coast.beach;
    ctx.fillRect(x + width * 0.1, base - 3, width * 0.8, 3);
    if (index % 5 === 2) {
      lighthouse(
        ctx,
        coast,
        x + width * 0.375,
        base - height * 0.875 + 3,
        scene,
      );
    }
  }
};

/** The open sea from the horizon to the swell, with light on the water. */
const openSea = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  scene: SurfScene,
) => {
  const gradient = ctx.createLinearGradient(0, HORIZON, 0, WORLD.sea);
  gradient.addColorStop(0, coast.seaFar);
  gradient.addColorStop(1, coast.seaNear);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, HORIZON, WORLD.width, WORLD.sea - HORIZON + 20);
  // The sun's (or the moon's) path on the water, glinting
  ctx.fillStyle = coast.glitter;
  for (let i = 0; i < 18; i++) {
    const y = HORIZON + 4 + i * 6;
    const spread = 10 + i * 4;
    const shimmer = scene.reducedMotion
      ? 0
      : Math.sin(scene.now * 2 + i * 1.3) * 4;
    const cx = 470 + shimmer;
    ctx.globalAlpha = 1 - i / 20;
    ctx.fillRect(cx - spread / 2 + hash(i, 5) * 6, y, spread * 0.6, 1.5);
  }
  ctx.globalAlpha = 1;
};

/** Long rolling lines of swell between the horizon and Lucas. */
const swells = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  offset: number,
  scene: SurfScene,
) => {
  const rows = [
    { y: 238, amp: 2, length: 90, speed: 0.4 },
    { y: 262, amp: 3, length: 120, speed: 0.6 },
    { y: 292, amp: 4, length: 150, speed: 0.8 },
  ];
  const t = scene.reducedMotion ? 0 : scene.now;
  for (const row of rows) {
    const shift = offset * row.speed;
    ctx.fillStyle = coast.swell;
    ctx.beginPath();
    ctx.moveTo(0, row.y + 12);
    for (let x = 0; x <= WORLD.width; x += 8) {
      const y =
        row.y +
        Math.sin(((x + shift) / row.length) * Math.PI * 2 + t) * row.amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(WORLD.width, row.y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = coast.swellFoam;
    for (const { index, x } of slots(shift, row.length)) {
      if (hash(index, row.y) < 0.5) continue;
      ctx.fillRect(x + row.length * 0.3, row.y - row.amp - 1, 18, 1.5);
    }
  }
};

/** The water Lucas rides on, drawn over his board and the gates' feet. */
const frontSea = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  state: SurfState,
  scene: SurfScene,
) => {
  const offset = state.distance;
  const t = scene.reducedMotion ? 0 : scene.now * 2.4;
  // The swell and the sets he rides, with a ripple on top
  const surface = (x: number) =>
    WORLD.sea +
    5 -
    swellAt(state, x) +
    Math.sin((x + offset) * 0.035 + t) * 2.5;
  const gradient = ctx.createLinearGradient(0, WORLD.sea, 0, WORLD.height);
  gradient.addColorStop(0, coast.front);
  gradient.addColorStop(1, coast.frontDeep);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.height);
  for (let x = 0; x <= WORLD.width; x += 6) ctx.lineTo(x, surface(x));
  ctx.lineTo(WORLD.width, WORLD.height);
  ctx.closePath();
  ctx.fill();
  // The foam lip, and a few streaks of foam under it
  ctx.strokeStyle = coast.foam;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let x = 0; x <= WORLD.width; x += 6) {
    if (x === 0) ctx.moveTo(x, surface(x));
    else ctx.lineTo(x, surface(x));
  }
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.5;
  for (const { index, x } of slots(offset * 1.1, 70)) {
    const y = WORLD.sea + 18 + hash(index, 70) * 40;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 14 + hash(index, 71) * 18, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/**
 * Fills and outlines the current path in the maroon line. Each obstacle is
 * drawn twice: first its light rim alone (`rimPass`), then its shapes, so
 * it reads like a sticker against the sea and the sky, as in Ollie.
 */
let rimPass = false;

const outlined = (ctx: CanvasRenderingContext2D, fill: string) => {
  ctx.lineJoin = "round";
  if (rimPass) {
    ctx.lineWidth = 8;
    ctx.strokeStyle = RIM;
    ctx.stroke();
    return;
  }
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
};

/** A seed for a gate's own shape, the same for as long as it is on screen. */
const gateSeed = (gate: Gate) => Math.round(gate.floor * 31 + gate.ceiling * 7);

/** A sea stack rising from the water to the gap's floor. */
const rock = (ctx: CanvasRenderingContext2D, gate: Gate, floor: number) => {
  const width = OBSTACLE_WIDTH.rock;
  const left = gate.x - width / 2;
  const top = WORLD.sea - floor;
  const bottom = WORLD.height + 10;
  const seed = gateSeed(gate);
  const bump = (salt: number) => (hash(seed, salt) - 0.5) * 8;
  ctx.beginPath();
  ctx.moveTo(left + 2, bottom);
  ctx.lineTo(left + 4 + bump(1), top + 22);
  ctx.quadraticCurveTo(left + 2, top + 4, left + 18 + bump(2), top + 1);
  ctx.quadraticCurveTo(
    left + width * 0.5,
    top - 3,
    left + width - 16 + bump(3),
    top + 2,
  );
  ctx.quadraticCurveTo(left + width - 1, top + 6, left + width - 4, top + 26);
  ctx.lineTo(left + width - 2 + bump(4), bottom);
  ctx.closePath();
  outlined(ctx, ROCK);
  if (rimPass) return;
  // A lit face on the left, a shaded one on the right, a crack
  ctx.save();
  ctx.clip();
  ctx.fillStyle = ROCK_LIGHT;
  ctx.fillRect(left, top, 16, bottom - top);
  ctx.fillStyle = ROCK_DARK;
  ctx.fillRect(left + width - 18, top + 8, 18, bottom - top);
  ctx.strokeStyle = ROCK_DARK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left + width * 0.45, top + 6);
  ctx.lineTo(left + width * 0.55, top + 22);
  ctx.lineTo(left + width * 0.42, top + 34);
  ctx.stroke();
  // Weed along the waterline
  ctx.fillStyle = WEED;
  for (let w = 0; w < 6; w++) {
    const wx = left + 4 + w * 11;
    ctx.beginPath();
    ctx.moveTo(wx, WORLD.sea + 4);
    ctx.lineTo(wx + 5, WORLD.sea - 8 - hash(seed, 10 + w) * 6);
    ctx.lineTo(wx + 10, WORLD.sea + 4);
    ctx.fill();
  }
  ctx.restore();
  // Redraw the line over the shading
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
};

/**
 * A channel beacon on its float: red and white bands up to a lamp at the
 * gap's floor, bobbing with the swell.
 */
const beacon = (
  ctx: CanvasRenderingContext2D,
  gate: Gate,
  scene: SurfScene,
  floor: number,
  night: boolean,
) => {
  const width = OBSTACLE_WIDTH.buoy;
  const left = gate.x - width / 2;
  const top = WORLD.sea - floor;
  const bottom = WORLD.height + 10;
  // The tower, a little narrower at the top
  ctx.beginPath();
  ctx.moveTo(left + 2, bottom);
  ctx.lineTo(left + 6, top + 14);
  ctx.lineTo(left + width - 6, top + 14);
  ctx.lineTo(left + width - 2, bottom);
  ctx.closePath();
  outlined(ctx, BEACON_WHITE);
  if (!rimPass) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = BEACON_RED;
    for (let y = top + 14; y < bottom; y += 36)
      ctx.fillRect(left, y, width, 18);
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }
  // The lamp housing on top, lit and blinking at night
  ctx.beginPath();
  ctx.roundRect(left + 4, top + 2, width - 8, 14, 4);
  outlined(ctx, BEACON_RED);
  const blink =
    !night || scene.reducedMotion || Math.floor(scene.now * 1.5) % 2 === 0;
  ctx.beginPath();
  ctx.arc(gate.x, top + 2, 6, Math.PI, 0);
  ctx.closePath();
  outlined(ctx, blink ? BEACON_LAMP : "#9a8a5a");
  if (!rimPass && night && blink) {
    const glow = ctx.createRadialGradient(gate.x, top, 2, gate.x, top, 34);
    glow.addColorStop(0, "rgba(255, 216, 77, 0.45)");
    glow.addColorStop(1, "rgba(255, 216, 77, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(gate.x - 34, top - 34, 68, 68);
  }
};

/** A jetty piling hanging from the deck down to the gap's ceiling. */
const piling = (ctx: CanvasRenderingContext2D, gate: Gate, ceiling: number) => {
  const width = OBSTACLE_WIDTH.piling;
  const left = gate.x - width / 2;
  const bottom = WORLD.sea - ceiling;
  // The deck it holds up, across the top of the screen
  ctx.beginPath();
  ctx.rect(left - 22, -10, width + 44, 26);
  outlined(ctx, WOOD);
  if (!rimPass) {
    ctx.fillStyle = WOOD_DARK;
    for (let p = left - 14; p < left + width + 22; p += 18) {
      ctx.fillRect(p, -10, 2, 26);
    }
  }
  // The post, wet and barnacled at its foot
  ctx.beginPath();
  ctx.roundRect(left + 4, 10, width - 8, bottom - 10, [0, 0, 8, 8]);
  outlined(ctx, WOOD);
  if (rimPass) return;
  ctx.save();
  ctx.clip();
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(left + 12, 10, 3, bottom);
  ctx.fillRect(left + width - 17, 10, 2, bottom);
  ctx.fillStyle = WOOD_WET;
  ctx.fillRect(left, bottom - 22, width, 22);
  ctx.fillStyle = BARNACLE;
  const seed = gateSeed(gate);
  for (let b = 0; b < 7; b++) {
    ctx.beginPath();
    ctx.arc(
      left + 8 + hash(seed, 30 + b) * (width - 16),
      bottom - 4 - hash(seed, 40 + b) * 26,
      2.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
};

/** One gull, facing Lucas, its wings up or down. */
const gull = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  wingUp: boolean,
) => {
  // Wings behind the body
  ctx.beginPath();
  if (wingUp) {
    ctx.moveTo(cx - 4, cy - 2);
    ctx.quadraticCurveTo(cx + 2, cy - 22, cx + 22, cy - 18);
    ctx.lineTo(cx + 10, cy - 2);
  } else {
    ctx.moveTo(cx - 4, cy + 1);
    ctx.quadraticCurveTo(cx + 4, cy + 18, cx + 22, cy + 14);
    ctx.lineTo(cx + 10, cy + 1);
  }
  ctx.closePath();
  outlined(ctx, GULL_WING);
  if (!rimPass) {
    ctx.fillStyle = GULL_TIP;
    ctx.beginPath();
    ctx.arc(cx + 20, wingUp ? cy - 18 : cy + 14, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body and tail
  ctx.beginPath();
  ctx.ellipse(cx + 4, cy, 15, 8, 0, 0, Math.PI * 2);
  outlined(ctx, GULL);
  ctx.beginPath();
  ctx.moveTo(cx + 17, cy - 3);
  ctx.lineTo(cx + 26, cy - 5);
  ctx.lineTo(cx + 24, cy + 3);
  ctx.closePath();
  outlined(ctx, GULL);
  // Head, eye and beak
  ctx.beginPath();
  ctx.arc(cx - 11, cy - 4, 7, 0, Math.PI * 2);
  outlined(ctx, GULL);
  if (rimPass) return;
  ctx.fillStyle = GULL_TIP;
  ctx.fillRect(cx - 14, cy - 7, 2, 2);
  ctx.fillStyle = GULL_BEAK;
  ctx.beginPath();
  ctx.moveTo(cx - 17, cy - 4);
  ctx.lineTo(cx - 25, cy - 2);
  ctx.lineTo(cx - 17, cy);
  ctx.fill();
};

/**
 * The flock over the gap, from its ceiling up past the top of the screen;
 * a diving flock comes down as it nears him.
 */
const gulls = (
  ctx: CanvasRenderingContext2D,
  gate: Gate,
  scene: SurfScene,
  ceiling: number,
) => {
  const bottom = WORLD.sea - ceiling;
  const rate = scene.reducedMotion ? 3 : 8;
  for (let k = 0, y = bottom - 14; y > -20; k++, y -= 38) {
    const wingUp = Math.floor(scene.now * rate + k * 0.5) % 2 === 0;
    gull(ctx, gate.x + (k % 2 === 0 ? -2 : 6), y, wingUp);
  }
};

/**
 * One gate: what rises from the sea (nothing under a gate to ride
 * through), then what comes down from the sky.
 */
const obstacle = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  gate: Gate,
  scene: SurfScene,
  coast: Coast,
) => {
  const floor = floorOf(state, gate);
  if (gate.low === "rock") rock(ctx, gate, floor);
  else if (gate.low === "buoy") {
    beacon(ctx, gate, scene, floor, coast.dark > 0.5);
  }
  const ceiling = ceilingOf(gate);
  if (gate.high === "piling") piling(ctx, gate, ceiling);
  else gulls(ctx, gate, scene, ceiling);
};

const FIN = "#5d6b78";
const FIN_DARK = "#46525e";
const SHELL = "#f7c6a3";
const SHELL_RIB = "#d9906b";
const DOLPHIN = "#6aa7c9";
const DOLPHIN_BELLY = "#d9ecf3";

/** A lone gull, or a shark fin cutting the swell towards him. */
const hazard = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  item: Hazard,
  scene: SurfScene,
  coast: Coast,
) => {
  if (item.kind === "gull") {
    const wingUp =
      Math.floor(scene.now * (scene.reducedMotion ? 3 : 8)) % 2 === 0;
    gull(ctx, item.x, WORLD.sea - item.lift - HAZARD.gull.height / 2, wingUp);
    return;
  }
  const base = WORLD.sea - swellAt(state, item.x) + 4;
  const { width, height } = HAZARD.shark;
  ctx.beginPath();
  ctx.moveTo(item.x - width / 2, base);
  ctx.quadraticCurveTo(
    item.x - 6,
    base - height * 0.6,
    item.x + 4,
    base - height,
  );
  ctx.quadraticCurveTo(
    item.x + 6,
    base - height * 0.4,
    item.x + width / 2,
    base,
  );
  ctx.closePath();
  outlined(ctx, FIN);
  if (rimPass) return;
  ctx.fillStyle = FIN_DARK;
  ctx.beginPath();
  ctx.moveTo(item.x + 2, base - height + 6);
  ctx.quadraticCurveTo(
    item.x + 5,
    base - height * 0.4,
    item.x + width / 2 - 3,
    base,
  );
  ctx.lineTo(item.x + 2, base);
  ctx.fill();
  // Its wake, foam trailing behind
  ctx.strokeStyle = coast.foam;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(item.x + width / 2 + 2, base);
  ctx.lineTo(item.x + width / 2 + 26, base - 1);
  ctx.stroke();
};

/** A dolphin leaping, nose down to the left. */
const dolphin = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tilt: number,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  for (const pass of [true, false]) {
    rimPass = pass;
    // Tail flukes, then the body, then the fin
    ctx.beginPath();
    ctx.moveTo(14, -1);
    ctx.lineTo(24, -8);
    ctx.lineTo(21, 0);
    ctx.lineTo(24, 7);
    ctx.closePath();
    outlined(ctx, DOLPHIN);
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 7, 0, 0, Math.PI * 2);
    outlined(ctx, DOLPHIN);
    ctx.beginPath();
    ctx.moveTo(-2, -6);
    ctx.lineTo(4, -13);
    ctx.lineTo(6, -6);
    ctx.closePath();
    outlined(ctx, DOLPHIN);
  }
  rimPass = false;
  ctx.fillStyle = DOLPHIN_BELLY;
  ctx.beginPath();
  ctx.ellipse(-3, 3, 11, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // The snout and the eye
  ctx.fillStyle = DOLPHIN;
  ctx.fillRect(-22, -1, 6, 3);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(-11, -3, 2, 2);
  ctx.restore();
};

/** A shell to pick up, or a dolphin. */
const pickup = (
  ctx: CanvasRenderingContext2D,
  item: Pickup,
  scene: SurfScene,
) => {
  const bob = scene.reducedMotion
    ? 0
    : Math.sin(scene.now * 4 + item.x * 0.05) * 3;
  const y = WORLD.sea - item.lift + bob;
  if (item.kind === "dolphin") {
    dolphin(
      ctx,
      item.x,
      y,
      scene.reducedMotion ? 0 : Math.sin(scene.now * 3) * 0.3,
    );
    return;
  }
  // A scallop: a fan of ribs on a little hinge
  for (const pass of [true, false]) {
    rimPass = pass;
    ctx.beginPath();
    ctx.moveTo(item.x, y + 9);
    ctx.lineTo(item.x - 11, y - 1);
    ctx.quadraticCurveTo(item.x, y - 16, item.x + 11, y - 1);
    ctx.closePath();
    outlined(ctx, SHELL);
  }
  rimPass = false;
  ctx.strokeStyle = SHELL_RIB;
  ctx.lineWidth = 1.5;
  for (const dx of [-6, 0, 6]) {
    ctx.beginPath();
    ctx.moveTo(item.x, y + 7);
    ctx.lineTo(item.x + dx, y - 6);
    ctx.stroke();
  }
};

/** The tube: the wave's back wall behind him… */
const tubeWall = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  coast: Coast,
) => {
  for (const tube of state.tubes) {
    const left = tube.from - state.distance;
    const right = tube.to - state.distance;
    if (right < 0 || left > WORLD.width) continue;
    const lip = WORLD.sea - TUBE.lip;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = coast.front;
    ctx.beginPath();
    ctx.moveTo(left - 30, WORLD.sea + 6);
    ctx.quadraticCurveTo(left - 10, lip, left + 30, lip - 30);
    ctx.lineTo(right, lip - 30);
    ctx.lineTo(right + 40, WORLD.sea + 6);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

/** …and its lip curling over him, foam dripping off its edge. */
const tubeLip = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  coast: Coast,
  scene: SurfScene,
) => {
  for (const tube of state.tubes) {
    const left = tube.from - state.distance;
    const right = tube.to - state.distance;
    if (right < 0 || left > WORLD.width) continue;
    const lip = WORLD.sea - TUBE.lip + 2;
    const gradient = ctx.createLinearGradient(0, lip - 48, 0, lip);
    gradient.addColorStop(0, coast.frontDeep);
    gradient.addColorStop(1, coast.front);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(right + 40, lip - 48);
    ctx.lineTo(left + 20, lip - 48);
    // The curl at the mouth, falling towards the sea
    ctx.bezierCurveTo(
      left - 30,
      lip - 40,
      left - 34,
      lip + 30,
      left - 6,
      lip + 34,
    );
    ctx.quadraticCurveTo(left - 10, lip + 6, left + 14, lip);
    ctx.lineTo(right + 40, lip);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = coast.foam;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(left - 6, lip + 34);
    ctx.quadraticCurveTo(left - 10, lip + 6, left + 14, lip);
    ctx.lineTo(right + 40, lip);
    ctx.stroke();
    // Drips off the lip
    const t = scene.reducedMotion ? 0 : scene.now * 60;
    ctx.lineWidth = 2;
    for (let x = left + 24; x < right; x += 34) {
      const drop = 4 + ((x + t + state.distance) % 14);
      ctx.beginPath();
      ctx.moveTo(x, lip + 2);
      ctx.lineTo(x, lip + 2 + drop);
      ctx.stroke();
    }
  }
};

/** Where the board sits in each pose's art, as fractions of the square. */
const ANCHOR = {
  ride: { x: 0.52, bottom: 0.905 },
  wipeout: { x: 0.55, bottom: 0.88 },
  shaka: { x: 0.5, bottom: 0.97 },
} as const;
/** The chibi's drawn size, in world units. */
const SPRITE = 104;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Rings of foam where he went in. */
const splash = (
  ctx: CanvasRenderingContext2D,
  coast: Coast,
  x: number,
  age: number,
  scene: SurfScene,
) => {
  if (scene.reducedMotion) return;
  ctx.strokeStyle = coast.foam;
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    const t = Math.min(Math.max(age - 0.15 - i * 0.18, 0) / 0.8, 1);
    if (t <= 0 || t >= 1) continue;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    ctx.ellipse(x, WORLD.sea + 6, 14 + t * 44, 3 + t * 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

const lucas = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  scene: SurfScene,
  coast: Coast,
) => {
  const { player } = state;
  const cx = PLAYER.x + PLAYER.width / 2;
  const bottom = WORLD.sea - player.lift;
  const crashed = scene.crashAge !== null;
  const age = scene.crashAge ?? 0;

  // His shadow on the water, smaller as he flies
  if (!crashed) {
    const spread = Math.max(0.3, 1 - player.lift / 200);
    ctx.fillStyle = coast.shadow;
    ctx.beginPath();
    ctx.ellipse(cx, WORLD.sea + 3, 30 * spread, 4 * spread, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // The run is over: he floats in the foam, or stands waist-deep with the
  // board under his arm on a new best
  const ending = scene.ending ? scene.art[scene.ending] : null;
  if (
    crashed &&
    scene.ending &&
    ending &&
    (scene.reducedMotion || age >= END_POSE_AT)
  ) {
    const size = scene.ending === "shaka" ? 112 : SPRITE;
    const sink = scene.ending === "shaka" ? 34 : 30;
    const bob = scene.reducedMotion ? 0 : Math.sin(scene.now * 2) * 1.5;
    ctx.drawImage(
      ending,
      cx + 14 - ANCHOR[scene.ending].x * size,
      WORLD.sea + sink + bob - ANCHOR[scene.ending].bottom * size,
      size,
      size,
    );
    splash(ctx, coast, cx + 14, age, scene);
    return;
  }

  if (crashed) {
    // The wipeout: off the board, tumbling into the sea
    const art = scene.art.wipeout ?? scene.art.ride ?? scene.art.shaka;
    if (!art) return;
    let angle = 0;
    let dx = 0;
    let y = bottom;
    if (!scene.reducedMotion) {
      const t = easeOut(Math.min(age / 0.6, 1));
      angle = t * 0.9;
      dx = t * 14;
      y = bottom + (WORLD.sea + 30 - bottom) * t;
    }
    ctx.save();
    ctx.translate(cx + dx, y);
    ctx.rotate(angle);
    ctx.drawImage(
      art,
      -ANCHOR.wipeout.x * SPRITE,
      -ANCHOR.wipeout.bottom * SPRITE,
      SPRITE,
      SPRITE,
    );
    ctx.restore();
    splash(ctx, coast, cx + dx, age, scene);
    return;
  }

  const art = scene.art.ride ?? scene.art.shaka;
  if (!art) return;
  let angle = 0;
  let dy = 0;
  if (player.riding) {
    // Riding the swell: a gentle rise and fall
    if (!scene.reducedMotion) dy = Math.sin(scene.now * 3) * 1.5;
  } else if (!scene.reducedMotion) {
    // The nose up as he climbs, down as he falls
    angle = Math.min(
      0.35,
      Math.max(-0.3, (-player.velocity / POP_VELOCITY) * 0.28),
    );
  }
  ctx.save();
  ctx.translate(cx, bottom + dy);
  ctx.rotate(angle);
  ctx.drawImage(
    art,
    -ANCHOR.ride.x * SPRITE,
    -ANCHOR.ride.bottom * SPRITE,
    SPRITE,
    SPRITE,
  );
  ctx.restore();
};

/** Little stars round his head while he goes in, as in Ollie. */
const dazed = (ctx: CanvasRenderingContext2D, scene: SurfScene) => {
  if (scene.crashAge === null || scene.crashAge > END_POSE_AT) return;
  const spin = scene.reducedMotion ? 0 : scene.crashAge * 5;
  const cx = PLAYER.x + PLAYER.width / 2 + 24;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const a = spin + (i * Math.PI * 2) / 3;
    sparklePath(
      ctx,
      cx + Math.cos(a) * 20,
      WORLD.sea - 70 + Math.sin(a) * 6,
      6,
    );
    ctx.fillStyle = SPARKLE_FILL;
    ctx.fill();
    ctx.strokeStyle = SPARKLE_LINE;
    ctx.stroke();
  }
};

/** Parallax of each layer, calmer under reduced motion. */
const PARALLAX = {
  full: { clouds: 0.04, headlands: 0.08, swells: 0.35 },
  calm: { clouds: 0, headlands: 0, swells: 0.12 },
} as const;

/** Draws one frame of the sea. */
export const drawSurf = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  scene: SurfScene,
) => {
  const coast = coastAt(skyAt(state.tier, scene.tierAge, scene.night));
  const parallax = scene.reducedMotion ? PARALLAX.calm : PARALLAX.full;
  const d = state.distance;

  ctx.save();
  // A short shake on the crash, never under reduced motion
  if (scene.crashAge !== null && scene.crashAge < 0.3 && !scene.reducedMotion) {
    const k = 1 - scene.crashAge / 0.3;
    ctx.translate(
      Math.sin(scene.crashAge * 90) * 5 * k,
      Math.cos(scene.crashAge * 70) * 3 * k,
    );
  }

  sky(ctx, coast, scene);
  if (coast.dark < 1) clouds(ctx, coast, d * parallax.clouds);
  headlands(ctx, coast, d * parallax.headlands, scene);
  openSea(ctx, coast, scene);
  swells(ctx, coast, d * parallax.swells, scene);
  // A haze over the sea behind him, so the gates stand out; the sky keeps
  // its colour, so the white gulls do too
  ctx.fillStyle = coast.haze;
  ctx.fillRect(0, HORIZON, WORLD.width, WORLD.sea - HORIZON);

  tubeWall(ctx, state, coast);
  for (const pass of [true, false]) {
    rimPass = pass;
    for (const gate of state.obstacles) {
      obstacle(ctx, state, gate, scene, coast);
    }
    for (const item of state.hazards) hazard(ctx, state, item, scene, coast);
  }
  rimPass = false;
  for (const item of state.pickups) {
    if (!item.taken) pickup(ctx, item, scene);
  }
  // The dolphin that swims with him, ready to save him once
  if (state.player.shield && scene.crashAge === null) {
    const x = PLAYER.x - 34;
    const y = WORLD.sea - swellAt(state, x) + 2;
    const leap = scene.reducedMotion ? 0 : Math.sin(scene.now * 4) * 3;
    dolphin(ctx, x, y - leap, 0.15);
  }
  lucas(ctx, state, scene, coast);
  frontSea(ctx, coast, state, scene);
  tubeLip(ctx, state, coast, scene);
  dazed(ctx, scene);
  ctx.restore();
  if (state.phase !== "ready") overlay(ctx, state, scene, coast);
};

/** The sea's own inks, as the score over it wears them. */
const INK = { day: "#0b2b35", night: "#f3ecdf" } as const;
const POPUP_INK: Readonly<Record<SurfAward["kind"], string>> = {
  perfect: STYLE_INK,
  tube: STYLE_INK,
  shell: "#1fa3a3",
};

/** The level, the multiplier, the points won and a new level's banner. */
const overlay = (
  ctx: CanvasRenderingContext2D,
  state: SurfState,
  scene: SurfScene,
  coast: Coast,
) =>
  drawOverlay(ctx, {
    level: scene.levelLabel(state.tier),
    ink: coast.time >= 2 ? INK.night : INK.day,
    combo: state.combo,
    popups: scene.popups.map(({ award, age }) => ({
      ...award,
      y: WORLD.sea - award.lift,
      ink: POPUP_INK[award.kind],
      age,
    })),
    banner: scene.banner && {
      text: scene.levelLabel(scene.banner.tier),
      age: scene.banner.age,
    },
    font: scene.font,
    reducedMotion: scene.reducedMotion,
  });
