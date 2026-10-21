import {
  JUMP_VELOCITY,
  type Obstacle,
  OBSTACLE_SIZE,
  type OllieState,
  PLAYER,
  type Sparkle,
  SPARKLE_RADIUS,
  WORLD,
} from "@/lib/arcade/ollie";

/**
 * Draws Ollie's street on a 2D canvas (DESIGN.md, Arcade). The game has its
 * own palette, a Paris street by day or by night (Lucas's time in Paris),
 * never the site's palette. Everything is drawn in world units; the caller
 * sets the transform from the world to the canvas.
 */

export type OllieArt = {
  /** Rolling: the skate pose. */
  readonly roll: HTMLImageElement | null;
  /** In the air: the ollie pose. */
  readonly air: HTMLImageElement | null;
  /** After a run: asleep on the sidewalk, or the trophy on a new best. */
  readonly sleeping: HTMLImageElement | null;
  readonly trophy: HTMLImageElement | null;
};

/** The pose Lucas takes once a run is over. */
export type OllieEnding = "sleeping" | "trophy";

/** Seconds after the crash when the fall gives way to the end pose. */
export const END_POSE_AT = 0.6;

export type OllieScene = {
  readonly night: boolean;
  readonly reducedMotion: boolean;
  readonly art: OllieArt;
  /** Seconds since the crash, or null while he rides. */
  readonly crashAge: number | null;
  /** The end pose of a finished run, once the fall has played. */
  readonly ending: OllieEnding | null;
  /** Seconds on a free-running clock, for idle motion (stars, wings). */
  readonly now: number;
};

const STREET = {
  day: {
    skyTop: "#9fd3f2",
    skyLow: "#ffe8c8",
    sun: "#fff4cf",
    cloud: "rgba(255, 255, 255, 0.85)",
    far: "#a9bdd2",
    farShade: "#97adc5",
    stone: ["#f1e2c4", "#ecd9b6", "#f4e8d0"],
    stoneLine: "#d9c39d",
    window: "#7f9fbe",
    windowLit: "#7f9fbe",
    zinc: "#8095ad",
    zincDark: "#687c94",
    iron: "#2b2f3a",
    shop: "#3a3340",
    shopGlass: "#a9c6dc",
    walk: "#ddd5c6",
    walkLine: "#c8bfad",
    curb: "#b3a995",
    lampGlow: null,
    shadow: "rgba(43, 47, 58, 0.22)",
    haze: "rgba(250, 244, 232, 0.5)",
  },
  night: {
    skyTop: "#070d26",
    skyLow: "#28305c",
    sun: "#fff1c9",
    cloud: "rgba(255, 255, 255, 0.05)",
    far: "#18213f",
    farShade: "#141b35",
    stone: ["#2c3354", "#283050", "#30385a"],
    stoneLine: "#222944",
    window: "#1a2038",
    windowLit: "#ffcf6b",
    zinc: "#1e2643",
    zincDark: "#161c34",
    iron: "#0d1022",
    shop: "#1a1a2c",
    shopGlass: "#ffd98a",
    walk: "#3a3f5e",
    walkLine: "#30354f",
    curb: "#292e48",
    lampGlow: "rgba(255, 207, 107, 0.28)",
    shadow: "rgba(0, 0, 0, 0.35)",
    haze: "rgba(7, 13, 38, 0.38)",
  },
} as const;

/** Café awnings: tomato, bottle green, navy, mustard. */
const AWNINGS = ["#d4513f", "#2f6b4f", "#2b3a6e", "#d9a23b"] as const;
/** The line around the street furniture, the chibi art's maroon. */
const OUTLINE = "#4a1f24";
/** The sticker rim around the street furniture. */
const RIM = "#fffaf0";
const CONE = "#ff8a3d";
const BIN = "#3fae5c";
const BENCH = "#c9803f";
const PIGEON = "#9aa1b6";
const SPARKLE_FILL = "#fffaf0";
const SPARKLE_LINE = "#2f6bff";

/** A stable pseudo-random number in [0, 1) for a slot of the street. */
const hash = (n: number, salt = 0) => {
  let x = (Math.imul(n, 374761393) + Math.imul(salt + 1, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

type Street = (typeof STREET)["day"] | (typeof STREET)["night"];

/** The slots of a repeating layer that are on screen, with their left x. */
const slots = (offset: number, width: number) => {
  const first = Math.floor(offset / width) - 1;
  const count = Math.ceil(WORLD.width / width) + 3;
  return Array.from({ length: count }, (_, k) => {
    const index = first + k;
    return { index, x: index * width - offset };
  });
};

const sky = (
  ctx: CanvasRenderingContext2D,
  street: Street,
  scene: OllieScene,
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.ground);
  gradient.addColorStop(0, street.skyTop);
  gradient.addColorStop(1, street.skyLow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  if (scene.night) {
    for (let i = 0; i < 46; i++) {
      const twinkle = scene.reducedMotion
        ? 0.7
        : 0.45 + 0.55 * Math.abs(Math.sin(scene.now * 1.3 + i * 2.1));
      ctx.globalAlpha = twinkle * (0.4 + hash(i, 3) * 0.6);
      ctx.fillStyle = "#fff6e0";
      const size = hash(i, 4) < 0.15 ? 2 : 1.2;
      ctx.fillRect(hash(i, 1) * WORLD.width, hash(i, 2) * 190, size, size);
    }
    ctx.globalAlpha = 1;
    // The moon, a crescent
    ctx.fillStyle = street.sun;
    ctx.beginPath();
    ctx.arc(512, 62, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = street.skyTop;
    ctx.beginPath();
    ctx.arc(522, 54, 19, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = street.sun;
    ctx.beginPath();
    ctx.arc(510, 70, 28, 0, Math.PI * 2);
    ctx.fill();
  }
};

const clouds = (
  ctx: CanvasRenderingContext2D,
  street: Street,
  offset: number,
) => {
  ctx.fillStyle = street.cloud;
  for (const { index, x } of slots(offset, 260)) {
    if (hash(index, 9) < 0.45) continue;
    const y = 40 + hash(index, 10) * 70;
    const cx = x + hash(index, 11) * 120;
    ctx.beginPath();
    ctx.arc(cx, y, 16, 0, Math.PI * 2);
    ctx.arc(cx + 20, y - 8, 20, 0, Math.PI * 2);
    ctx.arc(cx + 42, y, 15, 0, Math.PI * 2);
    ctx.rect(cx, y, 42, 15);
    ctx.fill();
  }
};

const eiffel = (ctx: CanvasRenderingContext2D, x: number, base: number) => {
  ctx.beginPath();
  ctx.moveTo(x - 30, base);
  ctx.lineTo(x - 13, base - 70);
  ctx.lineTo(x - 6, base - 132);
  ctx.lineTo(x - 1.5, base - 196);
  ctx.lineTo(x, base - 214);
  ctx.lineTo(x + 1.5, base - 196);
  ctx.lineTo(x + 6, base - 132);
  ctx.lineTo(x + 13, base - 70);
  ctx.lineTo(x + 30, base);
  ctx.lineTo(x + 16, base);
  ctx.quadraticCurveTo(x, base - 34, x - 16, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x - 17, base - 72, 34, 4);
  ctx.fillRect(x - 9, base - 134, 18, 3);
};

/** The far skyline: zinc roofs, chimneys, and now and then the tower. */
const skyline = (
  ctx: CanvasRenderingContext2D,
  street: Street,
  offset: number,
) => {
  const base = 300;
  for (const { index, x } of slots(offset, 96)) {
    ctx.fillStyle = street.far;
    if (index % 17 === 6) {
      eiffel(ctx, x + 48, base);
      continue;
    }
    const height = 40 + hash(index, 20) * 60;
    const top = base - height;
    ctx.fillStyle = hash(index, 21) < 0.5 ? street.far : street.farShade;
    // A mansard: the wall, then the sloped roof
    ctx.fillRect(x, top + 14, 96, height - 14);
    ctx.beginPath();
    ctx.moveTo(x + 4, top + 14);
    ctx.lineTo(x + 14, top);
    ctx.lineTo(x + 82, top);
    ctx.lineTo(x + 92, top + 14);
    ctx.fill();
    // Chimney pots
    const pots = 1 + Math.floor(hash(index, 22) * 3);
    for (let p = 0; p < pots; p++) {
      ctx.fillRect(x + 18 + p * 24 + hash(index, 23 + p) * 8, top - 9, 7, 10);
    }
  }
};

/** The Haussmann façades, with a café on the ground floor. */
const facades = (
  ctx: CanvasRenderingContext2D,
  street: Street,
  offset: number,
  night: boolean,
) => {
  const width = 172;
  const base = WORLD.ground;
  for (const { index, x } of slots(offset, width)) {
    const floors = 4 + Math.floor(hash(index, 30) * 2);
    const floorHeight = 30;
    const shopHeight = 40;
    const top = base - shopHeight - floors * floorHeight;

    // Stone
    ctx.fillStyle = street.stone[((index % 3) + 3) % 3];
    ctx.fillRect(x, top, width, base - top);
    ctx.fillStyle = street.stoneLine;
    ctx.fillRect(x, top, 2, base - top);

    // Mansard roof with dormers
    ctx.fillStyle = street.zinc;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + 12, top - 26);
    ctx.lineTo(x + width - 12, top - 26);
    ctx.lineTo(x + width, top);
    ctx.fill();
    ctx.fillStyle = street.zincDark;
    for (let d = 0; d < 3; d++) {
      const dx = x + 26 + d * 50;
      ctx.fillRect(dx, top - 20, 16, 16);
      ctx.fillStyle =
        night && hash(index, 40 + d) < 0.3 ? street.windowLit : street.window;
      ctx.fillRect(dx + 4, top - 15, 8, 11);
      ctx.fillStyle = street.zincDark;
    }

    // Windows, floor by floor, with wrought-iron rails on two floors
    for (let f = 0; f < floors; f++) {
      const y = top + f * floorHeight + 6;
      for (let w = 0; w < 3; w++) {
        const wx = x + 22 + w * 50;
        const lit = night && hash(index * 7 + f, 50 + w) < 0.38;
        ctx.fillStyle = lit ? street.windowLit : street.window;
        ctx.fillRect(wx, y, 18, 20);
        ctx.fillStyle = street.stoneLine;
        ctx.fillRect(wx - 2, y - 3, 22, 3);
      }
      if (f === 1 || f === floors - 1) {
        ctx.fillStyle = street.iron;
        ctx.fillRect(x + 14, y + 20, width - 28, 2);
        for (let r = x + 16; r < x + width - 14; r += 6) {
          ctx.fillRect(r, y + 14, 1.5, 7);
        }
      }
    }

    // The ground floor: a café, its awning and its window
    const shopTop = base - shopHeight;
    ctx.fillStyle = street.shop;
    ctx.fillRect(x + 6, shopTop, width - 12, shopHeight);
    ctx.fillStyle = street.shopGlass;
    ctx.globalAlpha = night ? 0.85 : 0.7;
    ctx.fillRect(x + 16, shopTop + 14, width - 66, shopHeight - 18);
    ctx.globalAlpha = 1;
    ctx.fillStyle = night ? street.window : street.stoneLine;
    ctx.fillRect(x + width - 40, shopTop + 10, 22, shopHeight - 10);
    const awning = AWNINGS[Math.floor(hash(index, 60) * AWNINGS.length)];
    ctx.fillStyle = awning;
    ctx.beginPath();
    ctx.moveTo(x + 10, shopTop);
    ctx.lineTo(x + width - 10, shopTop);
    ctx.lineTo(x + width - 4, shopTop + 12);
    ctx.lineTo(x + 4, shopTop + 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    for (let s = x + 14; s < x + width - 14; s += 16) {
      ctx.fillRect(s, shopTop, 8, 12);
    }
  }
};

/** The sidewalk, its paving joints and the street lamps along it. */
const sidewalk = (
  ctx: CanvasRenderingContext2D,
  street: Street,
  offset: number,
) => {
  ctx.fillStyle = street.walk;
  ctx.fillRect(0, WORLD.ground, WORLD.width, WORLD.height - WORLD.ground);
  ctx.fillStyle = street.curb;
  ctx.fillRect(0, WORLD.ground, WORLD.width, 3);
  ctx.fillRect(0, WORLD.height - 12, WORLD.width, 3);
  ctx.fillStyle = street.walkLine;
  for (const { x } of slots(offset, 56)) {
    ctx.fillRect(x, WORLD.ground + 3, 2, WORLD.height - WORLD.ground - 15);
  }
};

const lamps = (
  ctx: CanvasRenderingContext2D,
  street: Street,
  offset: number,
) => {
  for (const { x } of slots(offset, 300)) {
    const lx = x + 150;
    if (street.lampGlow) {
      const glow = ctx.createRadialGradient(lx, 228, 4, lx, 228, 70);
      glow.addColorStop(0, street.lampGlow);
      glow.addColorStop(1, "rgba(255, 207, 107, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 70, 158, 140, 140);
    }
    ctx.fillStyle = street.iron;
    ctx.fillRect(lx - 2, 232, 4, WORLD.ground - 232);
    ctx.fillRect(lx - 6, WORLD.ground - 8, 12, 8);
    // The lantern
    ctx.beginPath();
    ctx.moveTo(lx - 9, 220);
    ctx.lineTo(lx + 9, 220);
    ctx.lineTo(lx + 6, 234);
    ctx.lineTo(lx - 6, 234);
    ctx.fill();
    ctx.fillStyle = street.lampGlow ? "#ffe3a1" : "#f5efe2";
    ctx.fillRect(lx - 5, 222, 10, 10);
    ctx.fillStyle = street.iron;
    ctx.fillRect(lx - 10, 216, 20, 4);
  }
};

/**
 * Fills and outlines the current path in the maroon line. Each piece of
 * furniture is drawn twice: first its light rim alone (`rimPass`), then its
 * shapes, so it reads like a sticker against the busy façades.
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

/** A soft shadow under a piece of furniture, so it stands on the sidewalk. */
const footprint = (
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  street: Street,
) => {
  ctx.fillStyle = street.shadow;
  ctx.beginPath();
  ctx.ellipse(
    x + width / 2,
    WORLD.ground + 3,
    width / 2 + 6,
    5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
};

const cone = (ctx: CanvasRenderingContext2D, x: number) => {
  const { width, height } = OBSTACLE_SIZE.cone;
  const bottom = WORLD.ground;
  ctx.beginPath();
  ctx.moveTo(x + width / 2 - 4, bottom - height);
  ctx.lineTo(x + width / 2 + 4, bottom - height);
  ctx.lineTo(x + width - 4, bottom - 5);
  ctx.lineTo(x + 4, bottom - 5);
  ctx.closePath();
  outlined(ctx, CONE);
  ctx.fillStyle = "#fff6ea";
  ctx.fillRect(x + 9, bottom - 28, width - 18, 7);
  ctx.beginPath();
  ctx.roundRect(x, bottom - 7, width, 7, 2);
  outlined(ctx, "#3a3340");
};

const bin = (ctx: CanvasRenderingContext2D, x: number, night: boolean) => {
  const { width, height } = OBSTACLE_SIZE.bin;
  const bottom = WORLD.ground;
  // The pole
  ctx.beginPath();
  ctx.rect(x + width - 8, bottom - height, 5, height);
  outlined(ctx, BIN);
  // The see-through bag under its green hoop
  ctx.beginPath();
  ctx.moveTo(x + 3, bottom - height + 12);
  ctx.lineTo(x + width - 6, bottom - height + 12);
  ctx.quadraticCurveTo(
    x + width - 4,
    bottom - 8,
    x + width / 2 - 2,
    bottom - 6,
  );
  ctx.quadraticCurveTo(x + 2, bottom - 8, x + 3, bottom - height + 12);
  ctx.closePath();
  ctx.globalAlpha = night ? 0.75 : 0.85;
  outlined(ctx, night ? "#7f9a8a" : "#9fbfa8");
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.roundRect(x, bottom - height + 6, width - 2, 8, 4);
  outlined(ctx, BIN);
};

const bench = (ctx: CanvasRenderingContext2D, x: number) => {
  const { width, height } = OBSTACLE_SIZE.bench;
  const bottom = WORLD.ground;
  ctx.beginPath();
  ctx.rect(x + 8, bottom - 18, 5, 18);
  ctx.rect(x + width - 13, bottom - 18, 5, 18);
  outlined(ctx, "#2b2f3a");
  ctx.beginPath();
  ctx.roundRect(x, bottom - 22, width, 7, 3);
  outlined(ctx, BENCH);
  ctx.beginPath();
  ctx.roundRect(x + 4, bottom - height, width - 8, 7, 3);
  outlined(ctx, BENCH);
  ctx.beginPath();
  ctx.rect(x + 12, bottom - height + 6, 3, 12);
  ctx.rect(x + width - 15, bottom - height + 6, 3, 12);
  outlined(ctx, "#2b2f3a");
};

const pigeon = (
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  scene: OllieScene,
) => {
  const { height } = OBSTACLE_SIZE.pigeon;
  const x = obstacle.x;
  const y = WORLD.ground - obstacle.lift - height;
  const wingUp =
    Math.floor(scene.now * (scene.reducedMotion ? 3 : 9)) % 2 === 0;
  // Body, facing left (towards Lucas)
  ctx.beginPath();
  ctx.ellipse(x + 24, y + 15, 16, 9, -0.1, 0, Math.PI * 2);
  outlined(ctx, PIGEON);
  // Tail
  ctx.beginPath();
  ctx.moveTo(x + 38, y + 12);
  ctx.lineTo(x + 46, y + 9);
  ctx.lineTo(x + 45, y + 19);
  ctx.closePath();
  outlined(ctx, "#7c8399");
  // Head and its green-violet neck
  ctx.beginPath();
  ctx.arc(x + 9, y + 9, 7, 0, Math.PI * 2);
  outlined(ctx, "#8a91a8");
  ctx.fillStyle = "#5fb3a1";
  ctx.fillRect(x + 11, y + 12, 6, 4);
  ctx.fillStyle = "#1b1b26";
  ctx.fillRect(x + 6, y + 7, 2, 2);
  ctx.fillStyle = "#e8a55a";
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 9);
  ctx.lineTo(x - 3, y + 11);
  ctx.lineTo(x + 2, y + 12);
  ctx.fill();
  // The wing
  ctx.beginPath();
  if (wingUp) {
    ctx.moveTo(x + 18, y + 12);
    ctx.lineTo(x + 32, y - 6);
    ctx.lineTo(x + 34, y + 12);
  } else {
    ctx.moveTo(x + 18, y + 14);
    ctx.lineTo(x + 32, y + 30);
    ctx.lineTo(x + 34, y + 14);
  }
  ctx.closePath();
  outlined(ctx, "#b4bacb");
};

/** The sparkle: Lucas's tattoo, a four-point star with concave sides. */
export const sparklePath = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) => {
  const pinch = r * 0.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + pinch, cy - pinch, cx + r, cy);
  ctx.quadraticCurveTo(cx + pinch, cy + pinch, cx, cy + r);
  ctx.quadraticCurveTo(cx - pinch, cy + pinch, cx - r, cy);
  ctx.quadraticCurveTo(cx - pinch, cy - pinch, cx, cy - r);
  ctx.closePath();
};

const sparkle = (
  ctx: CanvasRenderingContext2D,
  item: Sparkle,
  scene: OllieScene,
) => {
  const bob = scene.reducedMotion
    ? 0
    : Math.sin(scene.now * 4 + item.x * 0.05) * 3;
  sparklePath(ctx, item.x, WORLD.ground - item.lift + bob, SPARKLE_RADIUS + 2);
  ctx.fillStyle = SPARKLE_FILL;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = SPARKLE_LINE;
  ctx.stroke();
};

/** Where the board sits in each pose's art, as fractions of the square. */
const ANCHOR = {
  roll: { x: 0.525, bottom: 0.962 },
  air: { x: 0.51, bottom: 0.94 },
  sleeping: { x: 0.505, bottom: 0.96 },
  trophy: { x: 0.566, bottom: 0.985 },
} as const;
/** How far the mirrored ollie art tips back, nose up (radians). */
const AIR_TILT = -0.44;
/** The chibi's drawn size, in world units. */
const SPRITE = 108;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const lucas = (
  ctx: CanvasRenderingContext2D,
  state: OllieState,
  scene: OllieScene,
  street: Street,
) => {
  const { player } = state;
  const cx = PLAYER.x + PLAYER.width / 2;
  const bottom = WORLD.ground - player.lift;

  // His shadow on the sidewalk, smaller as he flies
  const spread = Math.max(0.35, 1 - player.lift / 220);
  ctx.fillStyle = street.shadow;
  ctx.beginPath();
  ctx.ellipse(cx, WORLD.ground + 4, 34 * spread, 5 * spread, 0, 0, Math.PI * 2);
  ctx.fill();

  const crashed = scene.crashAge !== null;

  // The run is over: he naps on the sidewalk, or holds up the trophy
  const ending = scene.ending ? scene.art[scene.ending] : null;
  if (
    crashed &&
    scene.ending &&
    ending &&
    (scene.reducedMotion || (scene.crashAge ?? 0) >= END_POSE_AT)
  ) {
    const size = scene.ending === "sleeping" ? 112 : SPRITE;
    ctx.drawImage(
      ending,
      cx + 12 - ANCHOR[scene.ending].x * size,
      WORLD.ground + 4 - ANCHOR[scene.ending].bottom * size,
      size,
      size,
    );
    return;
  }

  const airborne = !player.grounded && !crashed;
  const key = airborne ? "air" : "roll";
  const art = scene.art[key] ?? scene.art.roll;
  if (!art) return;

  let angle = 0;
  let dx = 0;
  let dy = 0;
  if (crashed && !scene.reducedMotion) {
    const t = easeOut(Math.min((scene.crashAge ?? 0) / 0.55, 1));
    angle = t * 1.3;
    dx = t * 22;
  } else if (airborne) {
    // The ollie art is mirrored to face his way, then tipped back so the
    // board's nose points up the road
    angle =
      AIR_TILT -
      (scene.reducedMotion ? 0 : (player.velocity / JUMP_VELOCITY) * 0.12);
  } else if (state.phase === "running" && !scene.reducedMotion) {
    // The wheels on the paving joints
    dy = Math.floor(state.distance / 28) % 2 === 0 ? 0 : -0.8;
  }

  ctx.save();
  ctx.translate(cx + dx, bottom + dy);
  ctx.rotate(angle);
  if (key === "air") ctx.scale(-1, 1);
  ctx.drawImage(
    art,
    -ANCHOR[key].x * SPRITE,
    -ANCHOR[key].bottom * SPRITE,
    SPRITE,
    SPRITE,
  );
  ctx.restore();

  // Little stars around his head after the fall
  if (crashed) {
    const age = scene.crashAge ?? 0;
    const spin = scene.reducedMotion ? 0 : age * 5;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = spin + (i * Math.PI * 2) / 3;
      const sx = cx + dx + 30 + Math.cos(a) * 20;
      const sy = WORLD.ground - 92 + Math.sin(a) * 6;
      sparklePath(ctx, sx, sy, 6);
      ctx.fillStyle = SPARKLE_FILL;
      ctx.fill();
      ctx.strokeStyle = SPARKLE_LINE;
      ctx.stroke();
    }
  }
};

/** One piece of street furniture (or a pigeon). */
const furniture = (
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  scene: OllieScene,
) => {
  switch (obstacle.kind) {
    case "cone":
      cone(ctx, obstacle.x);
      break;
    case "cones":
      cone(ctx, obstacle.x);
      cone(
        ctx,
        obstacle.x + OBSTACLE_SIZE.cones.width - OBSTACLE_SIZE.cone.width,
      );
      break;
    case "bin":
      bin(ctx, obstacle.x, scene.night);
      break;
    case "bench":
      bench(ctx, obstacle.x);
      break;
    case "pigeon":
      pigeon(ctx, obstacle, scene);
      break;
  }
};

/** Parallax of each layer, calmer under reduced motion. */
const PARALLAX = {
  full: { clouds: 0.05, skyline: 0.12, facades: 0.45 },
  calm: { clouds: 0, skyline: 0, facades: 0.15 },
} as const;

/** Draws one frame of the street. */
export const drawOllie = (
  ctx: CanvasRenderingContext2D,
  state: OllieState,
  scene: OllieScene,
) => {
  const street = scene.night ? STREET.night : STREET.day;
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

  sky(ctx, street, scene);
  if (!scene.night) clouds(ctx, street, d * parallax.clouds);
  skyline(ctx, street, d * parallax.skyline);
  facades(ctx, street, d * parallax.facades, scene.night);
  lamps(ctx, street, d * parallax.facades);
  // A haze over the background, so the street furniture stands out
  ctx.fillStyle = street.haze;
  ctx.fillRect(0, 0, WORLD.width, WORLD.ground);
  sidewalk(ctx, street, d);

  for (const item of state.sparkles) {
    if (!item.taken) sparkle(ctx, item, scene);
  }
  for (const obstacle of state.obstacles) {
    if (obstacle.kind !== "pigeon") {
      footprint(ctx, obstacle.x, OBSTACLE_SIZE[obstacle.kind].width, street);
    }
  }
  for (const pass of [true, false]) {
    rimPass = pass;
    for (const obstacle of state.obstacles) furniture(ctx, obstacle, scene);
  }
  rimPass = false;
  lucas(ctx, state, scene, street);
  ctx.restore();
};
