import { type CafeState, CELLS, colOf, COLS, rowOf } from "@/lib/arcade/cafe";

import { OUTLINE, RIM, sticker } from "../canvas-text";
import { sparklePath } from "../ollie/draw";

/**
 * Draws Café's terrace on a 2D canvas (DESIGN.md, Arcade): a green marble
 * bistro table seen from above, a grid of porcelain saucers on it, the
 * pavement around and Lucas standing beside it with his coffee. The game
 * has its own palette, by day or by night (Lucas's time in Paris), never
 * the site's. Everything is drawn in world units; the caller sets the
 * transform from the world to the canvas.
 */

/** Where things stand on the screen: wide from 640px, tall on a phone. */
export type Layout = {
  readonly world: { readonly width: number; readonly height: number };
  readonly table: {
    readonly x: number;
    readonly y: number;
    readonly size: number;
  };
  /** The grid's top-left corner and the side of a cell. */
  readonly grid: {
    readonly x: number;
    readonly y: number;
    readonly cell: number;
  };
  /** Lucas: his feet's middle and the side of his square art. */
  readonly chibi: {
    readonly x: number;
    readonly feet: number;
    readonly size: number;
  };
};

/**
 * 4:3 from 640px: Lucas beside the table, in the left quarter the cards
 * leave free, and the table as tall as the screen.
 */
export const WIDE: Layout = {
  world: { width: 720, height: 540 },
  table: { x: 194, y: 10, size: 520 },
  grid: { x: 211, y: 27, cell: 54 },
  chibi: { x: 98, feet: 532, size: 300 },
};

/** 4:5 on a phone: the table fills the width, Lucas peeks over its edge. */
export const TALL: Layout = {
  world: { width: 360, height: 450 },
  table: { x: 2, y: 92, size: 356 },
  grid: { x: 9, y: 99, cell: 38 },
  chibi: { x: 58, feet: 150, size: 150 },
};

/** The layout for a screen of this shape. */
export const layoutFor = (width: number, height: number) =>
  width / Math.max(height, 1) > 1.1 ? WIDE : TALL;

/** The cell under a point in world units, or null off the grid. */
export const cellAt = (layout: Layout, x: number, y: number) => {
  const col = Math.floor((x - layout.grid.x) / layout.grid.cell);
  const row = Math.floor((y - layout.grid.y) / layout.grid.cell);
  if (col < 0 || col >= COLS || row < 0 || row >= CELLS / COLS) return null;
  return row * COLS + col;
};

export type CafeArt = {
  /** Lucas with his coffee, beside the table. */
  readonly coffee: HTMLImageElement | null;
  /** A new best: the trophy pose. */
  readonly trophy: HTMLImageElement | null;
};

/** What Lucas does, from `at` on the scene's clock. */
export type Reaction = {
  readonly kind: "hop" | "spill" | "sip" | "cheer";
  readonly at: number;
};

export type CafeScene = {
  readonly layout: Layout;
  readonly night: boolean;
  readonly reducedMotion: boolean;
  readonly art: CafeArt;
  /** Seconds on a free-running clock. */
  readonly now: number;
  /** When each saucer shows turned on the clock (the steam's wave). */
  readonly openedAt: Float64Array;
  /** When each sugar went down, for its little drop. */
  readonly sugarAt: Float64Array;
  /** The cup knocked over and when, for the spreading coffee. */
  readonly spill: { readonly cell: number; readonly at: number } | null;
  /** When the table was cleared, for the cups served. */
  readonly clearedAt: number | null;
  /** Paused: the saucers are all shown upturned. */
  readonly hidden: boolean;
  /** The keyboard's saucer, ringed while the keys lead. */
  readonly cursor: number | null;
  /** The saucer under a fine pointer. */
  readonly hover: number | null;
  /** A long press under way on a saucer, from 0 to 1. */
  readonly pressing: {
    readonly cell: number;
    readonly progress: number;
  } | null;
  readonly reaction: Reaction | null;
  /** A new best: Lucas holds up the trophy. */
  readonly best: boolean;
  /** The site's display font family, for the latte art. */
  readonly font: string;
};

const TERRACE = {
  day: {
    paving: "#d9d1c3",
    pavingAlt: "#d2c9ba",
    joint: "#c3b9a8",
    shadow: "rgba(43, 47, 58, 0.22)",
    marble: "#3f6e5f",
    marbleDeep: "#335d50",
    vein: "rgba(214, 233, 222, 0.22)",
    rim: "#c9a35a",
    rimShade: "#97773c",
    porcelain: "#fbf7ef",
    porcelainShade: "#e6ddcc",
    foot: "#d4c8b3",
    ring: "#b7a98f",
    glow: null,
    leaf: ["#d9a23b", "#c46a2f", "#a8733f"],
  },
  night: {
    paving: "#3a3f5e",
    pavingAlt: "#363a58",
    joint: "#2c3150",
    shadow: "rgba(0, 0, 0, 0.35)",
    marble: "#2a4d44",
    marbleDeep: "#213f37",
    vein: "rgba(214, 233, 222, 0.14)",
    rim: "#a8874a",
    rimShade: "#6f5730",
    porcelain: "#f1ebdf",
    porcelainShade: "#d6ccba",
    foot: "#c5b9a3",
    ring: "#a3957c",
    glow: "rgba(255, 207, 107, 0.16)",
    leaf: ["#9c7a3a", "#8a5530", "#6f5236"],
  },
} as const;

type Terrace = (typeof TERRACE)["day"] | (typeof TERRACE)["night"];

/** The coffee: crema from its heart to its edge, and spilled. */
const CREMA = "#b07a4a";
const CREMA_EDGE = "#6e4023";
const SPILL = "rgba(84, 46, 24, 0.9)";
const SPILL_EDGE = "rgba(58, 30, 15, 0.95)";
const FOAM = "#fff6e6";
const SUGAR = "#ffffff";
const SUGAR_LEFT = "#ece6dc";
const SUGAR_RIGHT = "#d9d1c4";
const WRONG = "#c0233d";
const STEAM = "rgba(255, 255, 255, 0.55)";
const STAR_LINE = "#b07a4a";

/**
 * Each number's cup, in the site's colours so a count reads at a glance
 * (fixed: never the palette): Electric, Online Deep, Busy Deep, Epic Deep,
 * Tangerine Deep, Rare Deep, Ink Charcoal, Slate.
 */
export const NUMBER_CUPS = [
  "#2f6bff",
  "#1d7a45",
  "#c0233d",
  "#7a3fd1",
  "#b8470c",
  "#0b6fa8",
  "#10131f",
  "#545a6e",
] as const;

/** How long the steam rises off a saucer turned, and a wave's delay. */
export const STEAM_LIFE = 0.9;
export const WAVE_DELAY = 0.04;
/** How long the spilled coffee takes to spread. */
export const SPILL_LIFE = 1.1;

/** A stable pseudo-random number in [0, 1) for a cell or a slot. */
const hash = (n: number, salt = 0) => {
  let x = (Math.imul(n, 374761393) + Math.imul(salt + 1, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

const circle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(r, 0), 0, Math.PI * 2);
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** The pavement of the terrace and a few fallen leaves. */
const ground = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  scene: CafeScene,
) => {
  const { width, height } = scene.layout.world;
  ctx.fillStyle = t.paving;
  ctx.fillRect(0, 0, width, height);
  // Square stone slabs, laid on the diagonal like a terrace's
  const slab = 72;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(Math.PI / 4);
  const reach = Math.ceil(Math.hypot(width, height) / 2 / slab) + 1;
  ctx.strokeStyle = t.joint;
  ctx.lineWidth = 1.5;
  for (let row = -reach; row < reach; row += 1) {
    for (let col = -reach; col < reach; col += 1) {
      if (hash(row * 97 + col, 3) < 0.4) {
        ctx.fillStyle = t.pavingAlt;
        ctx.fillRect(col * slab, row * slab, slab, slab);
      }
      ctx.strokeRect(col * slab, row * slab, slab, slab);
    }
  }
  ctx.restore();
  // Autumn leaves on the stones
  for (let i = 0; i < 7; i += 1) {
    const x = hash(i, 11) * width;
    const y = hash(i, 12) * height;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(hash(i, 13) * Math.PI * 2);
    ctx.fillStyle = t.leaf[i % t.leaf.length];
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

/** The marble top with its brass rim, its veins, and the lamp at night. */
const table = (ctx: CanvasRenderingContext2D, t: Terrace, scene: CafeScene) => {
  const { x, y, size } = scene.layout.table;
  ctx.fillStyle = t.shadow;
  roundRect(ctx, x + 4, y + 7, size, size, 22);
  ctx.fill();
  ctx.fillStyle = t.rimShade;
  roundRect(ctx, x, y + 3, size, size, 22);
  ctx.fill();
  ctx.fillStyle = t.rim;
  roundRect(ctx, x, y, size, size, 22);
  ctx.fill();
  const inset = 7;
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, t.marble);
  gradient.addColorStop(1, t.marbleDeep);
  ctx.fillStyle = gradient;
  roundRect(ctx, x + inset, y + inset, size - inset * 2, size - inset * 2, 16);
  ctx.fill();
  // Veins, the same on every table
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = t.vein;
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i += 1) {
    ctx.lineWidth = 1 + hash(i, 21) * 2;
    ctx.beginPath();
    let vx = x + hash(i, 22) * size;
    let vy = y;
    ctx.moveTo(vx, vy);
    for (let k = 0; k < 8; k += 1) {
      vx += (hash(i * 9 + k, 23) - 0.35) * size * 0.18;
      vy += size / 7;
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }
  ctx.restore();
  if (t.glow) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.75);
    glow.addColorStop(0, t.glow);
    glow.addColorStop(1, "rgba(255, 207, 107, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - size * 0.2, y - size * 0.2, size * 1.4, size * 1.4);
  }
};

const centre = (layout: Layout, cell: number) => ({
  x: layout.grid.x + (colOf(cell) + 0.5) * layout.grid.cell,
  y: layout.grid.y + (rowOf(cell) + 0.5) * layout.grid.cell,
});

/** An upturned saucer: domed, its foot ring on top, a shine. */
const upturned = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  x: number,
  y: number,
  r: number,
  lift: number,
) => {
  ctx.fillStyle = t.shadow;
  circle(ctx, x + 1, y + 2.5 + lift, r);
  ctx.fill();
  const top = y - lift;
  const dome = ctx.createRadialGradient(
    x - r * 0.3,
    top - r * 0.35,
    r * 0.1,
    x,
    top,
    r,
  );
  dome.addColorStop(0, t.porcelain);
  dome.addColorStop(1, t.porcelainShade);
  ctx.fillStyle = dome;
  circle(ctx, x, top, r);
  ctx.fill();
  ctx.strokeStyle = t.ring;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // The foot ring
  ctx.strokeStyle = t.foot;
  ctx.lineWidth = 1.6;
  circle(ctx, x, top, r * 0.48);
  ctx.stroke();
  // A shine
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, top, r * 0.74, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
};

/** A saucer the right way up, flat on the table. */
const saucer = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  x: number,
  y: number,
  r: number,
) => {
  ctx.fillStyle = t.porcelain;
  circle(ctx, x, y, r);
  ctx.fill();
  ctx.strokeStyle = t.ring;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = t.porcelainShade;
  circle(ctx, x, y, r * 0.62);
  ctx.fill();
};

/** A cup seen from above on its saucer, the count in latte art. */
const numberCup = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  x: number,
  y: number,
  cell: number,
  count: number,
  font: string,
) => {
  saucer(ctx, t, x, y, cell * 0.44);
  const glaze = NUMBER_CUPS[count - 1];
  const r = cell * 0.33;
  // The handle, to the right
  ctx.fillStyle = glaze;
  roundRect(ctx, x + r * 0.7, y - r * 0.24, r * 0.62, r * 0.48, r * 0.2);
  ctx.fill();
  circle(ctx, x, y, r);
  ctx.fill();
  const crema = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 0.8);
  crema.addColorStop(0, CREMA);
  crema.addColorStop(1, CREMA_EDGE);
  ctx.fillStyle = crema;
  circle(ctx, x, y, r * 0.8);
  ctx.fill();
  // The foam's ring, then the count poured in foam
  ctx.strokeStyle = "rgba(255, 246, 230, 0.4)";
  ctx.lineWidth = 1;
  circle(ctx, x, y, r * 0.66);
  ctx.stroke();
  ctx.fillStyle = FOAM;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(cell * 0.4)}px ${font}`;
  ctx.fillText(String(count), x, y + cell * 0.025);
};

/** A cup knocked over on its saucer, its coffee run out. */
const knockedCup = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  x: number,
  y: number,
  cell: number,
  seed: number,
) => {
  const angle = -0.6 + hash(seed, 41) * 1.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // The coffee run out of it
  ctx.fillStyle = SPILL;
  ctx.beginPath();
  ctx.ellipse(
    cell * 0.22,
    cell * 0.04,
    cell * 0.2,
    cell * 0.14,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // The cup on its side: a body, its open mouth to the right
  ctx.lineJoin = "round";
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 4;
  roundRect(
    ctx,
    -cell * 0.3,
    -cell * 0.16,
    cell * 0.44,
    cell * 0.32,
    cell * 0.08,
  );
  ctx.stroke();
  ctx.fillStyle = t.porcelain;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = CREMA_EDGE;
  ctx.beginPath();
  ctx.ellipse(cell * 0.14, 0, cell * 0.06, cell * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Its handle, on top
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-cell * 0.08, -cell * 0.18, cell * 0.08, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
};

/** A cup served the right way up, steaming: the table cleared. */
const servedCup = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  x: number,
  y: number,
  cell: number,
) => {
  saucer(ctx, t, x, y, cell * 0.44);
  const r = cell * 0.31;
  ctx.fillStyle = RIM;
  roundRect(ctx, x + r * 0.7, y - r * 0.24, r * 0.62, r * 0.48, r * 0.2);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  circle(ctx, x, y, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CREMA_EDGE;
  circle(ctx, x, y, r * 0.76);
  ctx.fill();
  // A heart in the foam
  ctx.fillStyle = FOAM;
  const h = r * 0.42;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.8);
  ctx.bezierCurveTo(
    x - h * 1.3,
    y - h * 0.1,
    x - h * 0.5,
    y - h * 1.1,
    x,
    y - h * 0.35,
  );
  ctx.bezierCurveTo(
    x + h * 0.5,
    y - h * 1.1,
    x + h * 1.3,
    y - h * 0.1,
    x,
    y + h * 0.8,
  );
  ctx.fill();
};

/** A sugar cube on a saucer, dropping in when just put down. */
const sugarCube = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  age: number,
  wrong: boolean,
) => {
  const drop = age < 0.18 ? (1 - age / 0.18) * 8 : 0;
  const s = cell * 0.27;
  const top = y - drop - s * 0.2;
  ctx.save();
  ctx.lineJoin = "round";
  // Its top, then its two sides, in an isometric view
  const faces: [string, [number, number][]][] = [
    [
      SUGAR,
      [
        [x, top - s],
        [x + s, top - s * 0.5],
        [x, top],
        [x - s, top - s * 0.5],
      ],
    ],
    [
      SUGAR_LEFT,
      [
        [x - s, top - s * 0.5],
        [x, top],
        [x, top + s],
        [x - s, top + s * 0.5],
      ],
    ],
    [
      SUGAR_RIGHT,
      [
        [x + s, top - s * 0.5],
        [x, top],
        [x, top + s],
        [x + s, top + s * 0.5],
      ],
    ],
  ];
  // The sticker rim round it all, then the faces
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(x, top - s);
  ctx.lineTo(x + s, top - s * 0.5);
  ctx.lineTo(x + s, top + s * 0.5);
  ctx.lineTo(x, top + s);
  ctx.lineTo(x - s, top + s * 0.5);
  ctx.lineTo(x - s, top - s * 0.5);
  ctx.closePath();
  ctx.stroke();
  for (const [fill, points] of faces) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach(([px, py], i) =>
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py),
    );
    ctx.closePath();
    ctx.fill();
  }
  // Grains of sugar
  ctx.fillStyle = "rgba(160, 150, 135, 0.6)";
  for (let i = 0; i < 4; i += 1) {
    circle(
      ctx,
      x - s * 0.5 + i * s * 0.32,
      top + s * 0.1 + (i % 2) * s * 0.3,
      0.7,
    );
    ctx.fill();
  }
  if (wrong) {
    ctx.strokeStyle = WRONG;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - s * 1.1, top - s * 1.1);
    ctx.lineTo(x + s * 1.1, top + s * 1.1);
    ctx.moveTo(x + s * 1.1, top - s * 1.1);
    ctx.lineTo(x - s * 1.1, top + s * 1.1);
    ctx.stroke();
  }
  ctx.restore();
};

/** Wisps of steam rising off a saucer just turned. */
const steam = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  age: number,
  seed: number,
) => {
  const t = age / STEAM_LIFE;
  ctx.save();
  ctx.strokeStyle = STEAM;
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.globalAlpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
  for (let i = 0; i < 2; i += 1) {
    const sx = x + (i - 0.5) * cell * 0.3 + (hash(seed, i) - 0.5) * 4;
    const rise = t * cell * 0.7;
    ctx.beginPath();
    for (let k = 0; k <= 8; k += 1) {
      const py = y - rise - k * cell * 0.06;
      const px = sx + Math.sin(k * 0.9 + t * 6 + i * 2) * cell * 0.07;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
};

/** The coffee spreading across the table from the cup knocked over. */
const spillPool = (ctx: CanvasRenderingContext2D, scene: CafeScene) => {
  const { spill, layout } = scene;
  if (!spill) return;
  const age = scene.reducedMotion ? SPILL_LIFE : scene.now - spill.at;
  const t = Math.min(Math.max(age / SPILL_LIFE, 0), 1);
  const grow = 1 - (1 - t) ** 3;
  const { x, y } = centre(layout, spill.cell);
  const cell = layout.grid.cell;
  const { table } = layout;
  ctx.save();
  roundRect(
    ctx,
    table.x + 7,
    table.y + 7,
    table.size - 14,
    table.size - 14,
    16,
  );
  ctx.clip();
  // Lobes running out from the cup, each its own length
  ctx.fillStyle = SPILL;
  circle(ctx, x, y, cell * 0.9 * grow);
  ctx.fill();
  for (let i = 0; i < 9; i += 1) {
    const angle = (i / 9) * Math.PI * 2 + hash(spill.cell, i) * 0.6;
    const reach = cell * (0.8 + hash(spill.cell, i + 20) * 1.6) * grow;
    const lx = x + Math.cos(angle) * reach;
    const ly = y + Math.sin(angle) * reach;
    circle(ctx, lx, ly, cell * (0.35 + hash(spill.cell, i + 40) * 0.3) * grow);
    ctx.fill();
    circle(ctx, (x + lx) / 2, (y + ly) / 2, cell * 0.42 * grow);
    ctx.fill();
  }
  // Its darker edge and a shine
  ctx.strokeStyle = SPILL_EDGE;
  ctx.lineWidth = 1.5;
  circle(ctx, x, y, cell * 0.9 * grow);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.ellipse(
    x - cell * 0.3,
    y - cell * 0.35,
    cell * 0.25 * grow,
    cell * 0.08 * grow,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
};

/** The saucers, the cups and the sugar, cell by cell. */
const saucers = (
  ctx: CanvasRenderingContext2D,
  t: Terrace,
  state: CafeState,
  scene: CafeScene,
) => {
  const { layout, now } = scene;
  const cell = layout.grid.cell;
  const over = state.phase === "won" || state.phase === "lost";
  for (let i = 0; i < CELLS; i += 1) {
    const { x, y } = centre(layout, i);
    const shown = !scene.hidden && state.open[i] && now >= scene.openedAt[i];
    if (state.phase === "won" && state.cups[i]) {
      servedCup(ctx, t, x, y, cell);
      continue;
    }
    if (state.phase === "lost" && state.cups[i] && !state.sugar[i]) {
      // The cup knocked over; the others show once the coffee has run
      const late =
        i !== state.spilled &&
        !scene.reducedMotion &&
        scene.spill !== null &&
        now - scene.spill.at < 0.35 + hash(i, 7) * 0.4;
      if (!late) {
        knockedCup(ctx, t, x, y, cell, i);
        continue;
      }
    }
    if (shown) {
      const count = state.around[i];
      if (count > 0) numberCup(ctx, t, x, y, cell, count, scene.font);
      else {
        // An empty saucer leaves only its ring on the marble
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        circle(ctx, x, y, cell * 0.43);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      continue;
    }
    const hovered = !over && !scene.hidden && scene.hover === i;
    const pressed = scene.pressing?.cell === i;
    upturned(ctx, t, x, y, cell * 0.44, hovered ? 1.5 : pressed ? -0.5 : 0);
    if (pressed && scene.pressing) {
      // The long press filling up round the saucer
      ctx.strokeStyle = RIM;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(
        x,
        y,
        cell * 0.49,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * scene.pressing.progress,
      );
      ctx.stroke();
    }
    if (state.sugar[i] && !scene.hidden) {
      const wrong = state.phase === "lost" && !state.cups[i];
      sugarCube(
        ctx,
        x,
        y - (hovered ? 1.5 : 0),
        cell,
        now - scene.sugarAt[i],
        wrong,
      );
    }
  }
  spillPool(ctx, scene);
  // The cup knocked over lies in its coffee
  if (state.spilled !== null) {
    const { x, y } = centre(layout, state.spilled);
    knockedCup(ctx, t, x, y, cell, state.spilled);
  }
  // The steam over the saucers just turned
  if (!scene.reducedMotion && !scene.hidden) {
    for (let i = 0; i < CELLS; i += 1) {
      const age = now - scene.openedAt[i];
      if (
        state.open[i] &&
        age >= 0 &&
        age < STEAM_LIFE &&
        state.cups[i] === false
      ) {
        const { x, y } = centre(layout, i);
        steam(ctx, x, y, cell, age, i);
      }
    }
  }
};

/** The keyboard's saucer, ringed in the sticker style. */
const cursorRing = (ctx: CanvasRenderingContext2D, scene: CafeScene) => {
  if (scene.cursor === null || scene.hidden) return;
  const { layout } = scene;
  const cell = layout.grid.cell;
  const x = layout.grid.x + colOf(scene.cursor) * cell;
  const y = layout.grid.y + rowOf(scene.cursor) * cell;
  ctx.lineJoin = "round";
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 5;
  roundRect(ctx, x + 1.5, y + 1.5, cell - 3, cell - 3, 9);
  ctx.stroke();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
};

/** Lucas beside the table, reacting to the run. */
const lucas = (
  ctx: CanvasRenderingContext2D,
  state: CafeState,
  scene: CafeScene,
) => {
  const art =
    scene.best && scene.art.trophy ? scene.art.trophy : scene.art.coffee;
  if (!art) return;
  const { x, feet, size } = scene.layout.chibi;
  const { reaction, now, reducedMotion } = scene;
  const age = reaction ? now - reaction.at : Infinity;
  let dx = 0;
  let dy = 0;
  let angle = reducedMotion ? 0 : Math.sin(now * 1.3) * 0.012;
  if (!reducedMotion && reaction) {
    if (reaction.kind === "hop" && age < 0.32) {
      dy = -Math.sin((age / 0.32) * Math.PI) * size * 0.03;
    } else if (reaction.kind === "cheer" && age < 0.9) {
      dy = -Math.abs(Math.sin((age / 0.45) * Math.PI)) * size * 0.05;
    } else if (reaction.kind === "spill" && age < 0.6) {
      dx = Math.sin(age * 48) * size * 0.015 * (1 - age / 0.6);
    } else if (reaction.kind === "sip" && age < 0.8) {
      angle -= Math.sin((age / 0.8) * Math.PI) * 0.06;
    }
  }
  ctx.save();
  ctx.translate(x + dx, feet + dy);
  ctx.rotate(angle);
  ctx.drawImage(art, -size / 2, -size * 0.975, size, size);
  ctx.restore();

  const head = { x: x + size * 0.02, y: feet - size * 0.86 };
  // Startled by the spill: a "!" over his head
  if (state.phase === "lost" && reaction?.kind === "spill") {
    const pop = reducedMotion ? 1 : Math.min(age / 0.15, 1);
    ctx.save();
    ctx.translate(head.x + size * 0.2, head.y - size * 0.04);
    ctx.scale(pop, pop);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // The games' sticker text, as Ollie and Surf write over their screens
    sticker(ctx, "!", 0, 0, Math.round(size * 0.13), WRONG, scene.font);
    ctx.restore();
  }
  // A cleared table: tattoo stars round his head
  if (state.phase === "won") {
    for (let i = 0; i < 3; i += 1) {
      const turn = (reducedMotion ? 0 : now * 1.6) + (i / 3) * Math.PI * 2;
      const sx = head.x + Math.cos(turn) * size * 0.2;
      const sy = head.y + Math.sin(turn) * size * 0.06 - size * 0.04;
      sparklePath(ctx, sx, sy, size * 0.035);
      ctx.fillStyle = RIM;
      ctx.fill();
      ctx.strokeStyle = STAR_LINE;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
};

/** A frame of the terrace. */
export const drawCafe = (
  ctx: CanvasRenderingContext2D,
  state: CafeState,
  scene: CafeScene,
) => {
  const t = scene.night ? TERRACE.night : TERRACE.day;
  ground(ctx, t, scene);
  // On a phone Lucas stands behind the table's far edge; on a wide screen
  // beside it
  if (scene.layout === TALL) lucas(ctx, state, scene);
  table(ctx, t, scene);
  saucers(ctx, t, state, scene);
  cursorRing(ctx, scene);
  if (scene.layout === WIDE) lucas(ctx, state, scene);
};
