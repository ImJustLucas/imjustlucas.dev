import { CELLS, colOf, GOAL, rowOf, SIZE } from "@/lib/arcade/merge";

import { OUTLINE, RIM, sticker } from "../canvas-text";
import { sparklePath } from "../ollie/draw";

/**
 * Draws Merge on a 2D canvas (DESIGN.md, Arcade): Lucas coding beside an
 * editor window, the 4 by 4 board in it, the tiles as the site's items in
 * their rarity's colours (common, rare, epic, then v2.0 legendary). The
 * screen keeps a palette of its own, the electric palette's hexes fixed:
 * Paper by day and Navy by night (Lucas's time in Paris), never the
 * visitor's palette. Everything is drawn in world units; the caller sets
 * the transform from the world to the canvas.
 */

/** Where things stand on the screen: wide from 640px, tall on a phone. */
export type Layout = {
  readonly world: { readonly width: number; readonly height: number };
  /** The editor window, its title bar, status bar and line numbers' gutter. */
  readonly window: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly radius: number;
    readonly bar: number;
    readonly status: number;
    readonly gutter: number;
    /** Where the file's tab starts, from the window's left. */
    readonly tab: number;
  };
  /** The board's top-left corner, the side of a cell and the gap between. */
  readonly grid: {
    readonly x: number;
    readonly y: number;
    readonly cell: number;
    readonly gap: number;
  };
  /** Lucas: his feet's middle and the side of his square art. */
  readonly chibi: {
    readonly x: number;
    readonly feet: number;
    readonly size: number;
  };
  /** The size of the editor's own text. */
  readonly text: number;
};

/**
 * 4:3 from 640px: Lucas on the floor in the left quarter the cards leave
 * free, the editor beside him, as tall as the screen under the score.
 */
export const WIDE: Layout = {
  world: { width: 720, height: 540 },
  window: {
    x: 206,
    y: 44,
    width: 502,
    height: 486,
    radius: 16,
    bar: 34,
    status: 26,
    gutter: 34,
    tab: 66,
  },
  grid: { x: 265, y: 82, cell: 92, gap: 10 },
  chibi: { x: 104, feet: 520, size: 250 },
  text: 12,
};

/** 4:5 on a phone: the editor fills the width, Lucas sits on its top. */
export const TALL: Layout = {
  world: { width: 360, height: 450 },
  window: {
    x: 6,
    y: 104,
    width: 348,
    height: 340,
    radius: 12,
    bar: 26,
    status: 20,
    gutter: 22,
    // Clear of Lucas, who sits on the window's left
    tab: 150,
  },
  grid: { x: 47, y: 133, cell: 62, gap: 8 },
  chibi: { x: 76, feet: 118, size: 122 },
  text: 10,
};

/** The layout for a screen of this shape. */
export const layoutFor = (width: number, height: number) =>
  width / Math.max(height, 1) > 1.1 ? WIDE : TALL;

/** A cell's top-left corner on the board. */
const cellX = (layout: Layout, cell: number) =>
  layout.grid.x +
  layout.grid.gap +
  colOf(cell) * (layout.grid.cell + layout.grid.gap);
const cellY = (layout: Layout, cell: number) =>
  layout.grid.y +
  layout.grid.gap +
  rowOf(cell) * (layout.grid.cell + layout.grid.gap);

/** The board's side, its gaps around and between the cells included. */
const boardSize = (layout: Layout) =>
  SIZE * layout.grid.cell + (SIZE + 1) * layout.grid.gap;

/** How long a tile slides, a merged one pops and a new one grows, in seconds. */
export const SLIDE = 0.1;
const POP = 0.18;
const GROW = 0.14;
/** How long "merged" rises over a merge, and the release's banner stays. */
const MERGED_LIFE = 0.8;
export const SHIPPED_LIFE = 2.6;
/** A legendary tile's foil crosses it once, over 900ms. */
const FOIL = 0.9;

type Theme = {
  readonly wall: readonly [string, string];
  readonly star: string;
  readonly disc: string;
  readonly window: string;
  readonly bar: string;
  readonly seam: string;
  readonly ledge: string;
  readonly well: string;
  readonly slot: string;
  readonly slotLip: string;
  readonly ink: string;
  readonly muted: string;
  readonly accent: string;
};

/** The editor by day (Paper) and by night (Navy), the site's hexes fixed. */
const THEME: { readonly day: Theme; readonly night: Theme } = {
  day: {
    wall: ["#f6f3ea", "#e8e4d9"],
    star: "rgba(16, 19, 31, 0.08)",
    disc: "#dcd6c6",
    window: "#fffdf8",
    bar: "#f6f3ea",
    seam: "#dcd6c6",
    ledge: "#dcd6c6",
    well: "#f3efe4",
    slot: "#e9e4d7",
    slotLip: "#dcd6c6",
    ink: "#10131f",
    muted: "#545a6e",
    accent: "#1a4fe8",
  },
  night: {
    wall: ["#05081c", "#0a0f2e"],
    star: "rgba(246, 243, 234, 0.12)",
    disc: "#141c48",
    window: "#141c48",
    bar: "#0a0f2e",
    seam: "#2a3a7a",
    ledge: "#05081c",
    well: "#0a0f2e",
    slot: "#10173c",
    slotLip: "#05081c",
    ink: "#f6f3ea",
    muted: "#aab6e6",
    accent: "#6f97ff",
  },
};

export type Rarity = "common" | "rare" | "epic" | "legendary";

/** The site's rarity ramp: its bright colour and its deep one. */
const RARITY: { readonly [R in Rarity]: readonly [string, string] } = {
  common: ["#b9a9cc", "#6b5a80"],
  rare: ["#46c2ff", "#0b6fa8"],
  epic: ["#b47cff", "#7a3fd1"],
  legendary: ["#ffd84d", "#8a6200"],
};

/** The tiles of each rarity, from the smallest. */
const LADDER: { readonly [R in Rarity]: ReadonlyArray<number> } = {
  common: [2, 4, 8],
  rare: [16, 32, 64, 128],
  epic: [256, 512, 1024],
  legendary: [GOAL],
};

/** A tile's rarity: 2 to 8 common, to 128 rare, to 1024 epic, then legendary. */
export const rarityOf = (value: number): Rarity =>
  value <= 8
    ? "common"
    : value <= 128
      ? "rare"
      : value <= 1024
        ? "epic"
        : "legendary";

type Rgb = readonly [number, number, number];
const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const css = ([r, g, b]: Rgb, alpha = 1) =>
  `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
const mixRgb = (from: Rgb, to: Rgb, t: number): Rgb => [
  from[0] + (to[0] - from[0]) * t,
  from[1] + (to[1] - from[1]) * t,
  from[2] + (to[2] - from[2]) * t,
];
/** Relative luminance, to pick the ink that reads on a fill. */
const luminance = (color: Rgb) => {
  const [r, g, b] = color.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const NAVY = rgb("#0a0f2e");
const OFF_WHITE = rgb("#f6f3ea");

/**
 * A tile's colours: its fill, the rarity colour blended into the window's
 * more strongly as it climbs its rarity (a legendary tile is solid gold),
 * its frame and band, and the ink that reads best on it.
 */
const tileColours = (value: number, t: Theme, night: boolean) => {
  const rarity = rarityOf(value);
  const [bright, deep] = RARITY[rarity];
  const steps = LADDER[rarity];
  const at = Math.max(steps.indexOf(value), 0);
  const strength =
    rarity === "legendary"
      ? 1
      : {
          common: 0.1 + at * 0.18,
          rare: 0.22 + at * 0.14,
          epic: 0.4 + at * 0.18,
        }[rarity];
  const fill = mixRgb(rgb(t.window), rgb(bright), strength);
  const ink =
    contrast(fill, NAVY) >= contrast(fill, OFF_WHITE) ? NAVY : OFF_WHITE;
  // The quiet tier's frame at 70%, its deep colour by day
  const frame =
    rarity === "common"
      ? css(rgb(night ? bright : deep), 0.7)
      : rarity === "legendary"
        ? deep
        : bright;
  return { rarity, fill: css(fill), band: bright, frame, deep, ink: css(ink) };
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
};

/** A tile on the board, as the cabinet follows it from move to move. */
export type DrawnTile = {
  readonly id: number;
  readonly value: number;
  /** Where its last slide started and ended, and when (scene clock). */
  readonly from: number;
  readonly to: number;
  readonly movedAt: number;
  /** When it appears, and how: there at the start, a new tile, a merge. */
  readonly bornAt: number;
  readonly born: "start" | "spawn" | "merge";
  /** Merged into another: drawn under it until its slide ends. */
  readonly merging: boolean;
};

/** "merged" rising over a merge of a feature or more. */
export type MergedPopup = {
  readonly cell: number;
  readonly value: number;
  readonly at: number;
};

/** What Lucas does, from `at` on the scene's clock. */
export type Reaction = {
  readonly kind: "hop" | "cheer" | "slump";
  readonly at: number;
};

export type MergeArt = {
  /** Lucas at his laptop. */
  readonly coding: HTMLImageElement | null;
  /** A new best: the trophy pose. */
  readonly trophy: HTMLImageElement | null;
};

export type MergeScene = {
  readonly layout: Layout;
  readonly night: boolean;
  readonly reducedMotion: boolean;
  /** The scene's clock, in seconds. */
  readonly now: number;
  readonly tiles: Iterable<DrawnTile>;
  readonly popups: ReadonlyArray<MergedPopup>;
  readonly art: MergeArt;
  readonly reaction: Reaction | null;
  /** The run is over and set a new best: the trophy pose. */
  readonly best: boolean;
  /** When the release shipped (2048), for its banner; null before. */
  readonly shippedAt: number | null;
  /** When the run ended, for the veil over the board; null while on. */
  readonly endedAt: number | null;
  /** Whether the run is going: Lucas types. */
  readonly typing: boolean;
  /** The biggest tile, for the status bar. */
  readonly top: number;
  /** A tile's name ("hotfix", "v2.0"), the editor's words, "v2.0 shipped!". */
  readonly name: (value: number) => string;
  readonly words: {
    readonly file: string;
    readonly branch: string;
    readonly shipped: string;
    readonly merged: string;
  };
  /** The site's display font (the numbers) and Data font (the labels). */
  readonly font: { readonly display: string; readonly data: string };
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

/** The room behind: the wall, the tattoo stars on it, Lucas's floor disc. */
const room = (ctx: CanvasRenderingContext2D, t: Theme, scene: MergeScene) => {
  const { world, chibi } = scene.layout;
  const wall = ctx.createLinearGradient(0, 0, 0, world.height);
  wall.addColorStop(0, t.wall[0]);
  wall.addColorStop(1, t.wall[1]);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, world.width, world.height);

  // The tattoo stars, outlined, as along the site's gutters
  ctx.strokeStyle = t.star;
  ctx.lineWidth = 1.5;
  const stars =
    scene.layout === WIDE
      ? [
          [36, 70, 8],
          [150, 40, 6],
          [70, 190, 6],
          [176, 150, 8],
          [24, 300, 6],
        ]
      : [
          [176, 30, 7],
          [214, 74, 5],
          [24, 30, 5],
        ];
  for (const [x, y, r] of stars) {
    sparklePath(ctx, x, y, r);
    ctx.stroke();
  }

  if (scene.layout === WIDE) {
    // The floor disc he sits on, as the chibi's stage discs
    ctx.fillStyle = t.disc;
    ctx.beginPath();
    ctx.ellipse(
      chibi.x,
      chibi.feet - chibi.size * 0.04,
      chibi.size * 0.4,
      chibi.size * 0.075,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
};

/** A small branch glyph: two commits and the line joining them. */
const branchGlyph = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - size / 2 + 2);
  ctx.lineTo(x, y + size / 2 - 2);
  ctx.moveTo(x + size * 0.55, y - size / 2 + 3);
  ctx.quadraticCurveTo(x + size * 0.55, y, x, y + size * 0.2);
  ctx.stroke();
  for (const [cx, cy] of [
    [x, y - size / 2 + 1],
    [x, y + size / 2 - 1],
    [x + size * 0.55, y - size / 2 + 2],
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
};

/** The editor: its ledge, title bar with a tab, gutter, status bar. */
const editor = (ctx: CanvasRenderingContext2D, t: Theme, scene: MergeScene) => {
  const { window: w, text } = scene.layout;
  const { data } = scene.font;
  // The ledge it stands on
  roundRect(ctx, w.x, w.y + 4, w.width, w.height, w.radius);
  ctx.fillStyle = t.ledge;
  ctx.fill();
  roundRect(ctx, w.x, w.y, w.width, w.height, w.radius);
  ctx.fillStyle = t.window;
  ctx.fill();

  ctx.save();
  roundRect(ctx, w.x, w.y, w.width, w.height, w.radius);
  ctx.clip();
  // Title bar, three quiet dots and the file's tab
  ctx.fillStyle = t.bar;
  ctx.fillRect(w.x, w.y, w.width, w.bar);
  const dot = w.bar * 0.13;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(w.x + 16 + i * dot * 3.2, w.y + w.bar / 2, dot, 0, Math.PI * 2);
    ctx.fillStyle = t.seam;
    ctx.fill();
  }
  ctx.font = `500 ${text}px ${data}`;
  const label = scene.words.file;
  const tabX = w.x + w.tab;
  const tabWidth = ctx.measureText(label).width + text * 2.4;
  ctx.beginPath();
  ctx.roundRect(tabX, w.y + 5, tabWidth, w.bar - 5, [8, 8, 0, 0]);
  ctx.fillStyle = t.window;
  ctx.fill();
  ctx.fillStyle = t.accent;
  ctx.fillRect(tabX + 6, w.y + 5, tabWidth - 12, 2);
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, tabX + text * 1.2, w.y + 5 + (w.bar - 5) / 2 + 1);

  // Status bar: the branch, and the biggest tile with its rarity
  const statusY = w.y + w.height - w.status;
  ctx.fillStyle = t.bar;
  ctx.fillRect(w.x, statusY, w.width, w.status);
  ctx.fillStyle = t.seam;
  ctx.fillRect(w.x, statusY, w.width, 2);
  const middle = statusY + w.status / 2 + 1;
  branchGlyph(ctx, w.x + 16, middle, text + 2, t.muted);
  ctx.fillStyle = t.muted;
  ctx.fillText(scene.words.branch, w.x + 16 + text + 2, middle);
  if (scene.top > 0) {
    ctx.textAlign = "right";
    const topLabel = `${scene.name(scene.top)} · ${scene.top}`;
    ctx.fillText(topLabel, w.x + w.width - 14, middle);
    const labelWidth = ctx.measureText(topLabel).width;
    ctx.beginPath();
    ctx.arc(
      w.x + w.width - 14 - labelWidth - 9,
      middle - 1,
      text * 0.33,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = RARITY[rarityOf(scene.top)][0];
    ctx.fill();
  }

  // The line numbers, one a row
  ctx.textAlign = "center";
  ctx.fillStyle = t.muted;
  ctx.globalAlpha = 0.7;
  const { grid } = scene.layout;
  for (let row = 0; row < SIZE; row += 1) {
    const y = cellY(scene.layout, row * SIZE) + grid.cell / 2;
    ctx.fillText(String(row + 1), w.x + w.gutter / 2 + 2, y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // The window's 2px seam border
  roundRect(ctx, w.x + 1, w.y + 1, w.width - 2, w.height - 2, w.radius - 1);
  ctx.strokeStyle = t.seam;
  ctx.lineWidth = 2;
  ctx.stroke();
};

/** The board's well and its empty slots, pressed in. */
const board = (ctx: CanvasRenderingContext2D, t: Theme, scene: MergeScene) => {
  const { layout } = scene;
  const { grid } = layout;
  const side = boardSize(layout);
  roundRect(ctx, grid.x, grid.y, side, side, 10);
  ctx.fillStyle = t.well;
  ctx.fill();
  const radius = grid.cell * 0.12;
  for (let cell = 0; cell < CELLS; cell += 1) {
    const x = cellX(layout, cell);
    const y = cellY(layout, cell);
    roundRect(ctx, x, y, grid.cell, grid.cell, radius);
    ctx.fillStyle = t.slotLip;
    ctx.fill();
    roundRect(ctx, x, y + 2, grid.cell, grid.cell - 2, radius);
    ctx.fillStyle = t.slot;
    ctx.fill();
  }
};

/** One tile at (x, y), scaled about its middle: an item in its rarity. */
const tile = (
  ctx: CanvasRenderingContext2D,
  t: Theme,
  scene: MergeScene,
  item: DrawnTile,
  x: number,
  y: number,
  scale: number,
) => {
  const size = scene.layout.grid.cell;
  const colours = tileColours(item.value, t, scene.night);
  const radius = size * 0.12;
  const legendary = colours.rarity === "legendary";
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.scale(scale, scale);
  ctx.translate(-size / 2, -size / 2);

  // The legendary tile stands on its ledge
  if (legendary) {
    roundRect(ctx, 0, 4, size, size, radius);
    ctx.fillStyle = colours.deep;
    ctx.fill();
  }
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = colours.fill;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // The 4px top band
  ctx.fillStyle = colours.band;
  ctx.fillRect(0, 0, size, Math.max(3, size * 0.045));
  // The foil, once, as the tile is made
  const age = scene.now - item.bornAt;
  if (legendary && !scene.reducedMotion && age >= 0 && age < FOIL) {
    const sweep = easeOut(age / FOIL) * size * 2 - size * 0.5;
    const foil = ctx.createLinearGradient(sweep - size * 0.3, 0, sweep, size);
    foil.addColorStop(0, "rgba(255, 250, 240, 0)");
    foil.addColorStop(0.5, "rgba(255, 250, 240, 0.75)");
    foil.addColorStop(1, "rgba(255, 250, 240, 0)");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.restore();
  // The 2px frame
  roundRect(ctx, 1, 1, size - 2, size - 2, radius - 1);
  ctx.strokeStyle = colours.frame;
  ctx.lineWidth = 2;
  ctx.stroke();
  // The filled sparkle of a legendary item, top right
  if (legendary) {
    sparklePath(ctx, size * 0.82, size * 0.2, size * 0.09);
    ctx.fillStyle = RIM;
    ctx.fill();
    ctx.strokeStyle = colours.deep;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // The number, and its name under it
  const digits = String(item.value).length;
  const numberSize =
    size *
    (digits <= 2 ? 0.38 : digits === 3 ? 0.32 : digits === 4 ? 0.26 : 0.21);
  ctx.fillStyle = colours.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${numberSize}px ${scene.font.display}`;
  ctx.fillText(String(item.value), size / 2, size * 0.44);
  const name = scene.name(item.value);
  let labelSize = size * 0.135;
  ctx.font = `600 ${labelSize}px ${scene.font.data}`;
  // A long name shrinks to fit inside the frame
  const room = size * 0.86;
  const width = ctx.measureText(name).width;
  if (width > room) {
    labelSize *= room / width;
    ctx.font = `600 ${labelSize}px ${scene.font.data}`;
  }
  ctx.globalAlpha = 0.78;
  ctx.fillText(name, size / 2, size * 0.76);
  ctx.globalAlpha = 1;
  ctx.restore();
};

/** Every tile where its slide has taken it, popping or growing as it comes. */
const tiles = (ctx: CanvasRenderingContext2D, t: Theme, scene: MergeScene) => {
  const { layout, now, reducedMotion } = scene;
  const all = [...scene.tiles];
  // Merging tiles go under, the rest over them
  all.sort((a, b) => Number(b.merging) - Number(a.merging));
  for (const item of all) {
    const slid = reducedMotion ? 1 : clamp01((now - item.movedAt) / SLIDE);
    if (item.merging && slid >= 1) continue;
    if (now < item.bornAt && !reducedMotion) continue;
    const p = easeOut(slid);
    const x =
      cellX(layout, item.from) +
      (cellX(layout, item.to) - cellX(layout, item.from)) * p;
    const y =
      cellY(layout, item.from) +
      (cellY(layout, item.to) - cellY(layout, item.from)) * p;
    let scale = 1;
    const age = now - item.bornAt;
    if (!reducedMotion && item.born === "spawn" && age < GROW) {
      scale = 0.3 + 0.7 * easeOut(age / GROW);
    } else if (!reducedMotion && item.born === "merge" && age < POP) {
      scale = 1 + 0.12 * Math.sin((age / POP) * Math.PI);
    }
    tile(ctx, t, scene, item, x, y, scale);
  }
};

/** "merged" rising over the merges worth it, in the tile's deep colour. */
const popups = (ctx: CanvasRenderingContext2D, scene: MergeScene) => {
  const { layout, now, reducedMotion } = scene;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (const popup of scene.popups) {
    const age = now - popup.at;
    if (age < 0 || age >= MERGED_LIFE) continue;
    const t = age / MERGED_LIFE;
    ctx.globalAlpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    const rise = reducedMotion ? 0 : t * 18;
    const x = cellX(layout, popup.cell) + layout.grid.cell / 2;
    const y = cellY(layout, popup.cell) - 4 - rise;
    const ink = RARITY[rarityOf(popup.value)][1];
    sticker(
      ctx,
      scene.words.merged,
      x,
      y,
      layout.text + 2,
      ink,
      scene.font.data,
    );
  }
  ctx.globalAlpha = 1;
};

/** Lucas at his laptop, typing while a run is on, reacting to it. */
const lucas = (ctx: CanvasRenderingContext2D, scene: MergeScene) => {
  const art =
    scene.best && scene.art.trophy ? scene.art.trophy : scene.art.coding;
  if (!art) return;
  const { x, feet, size } = scene.layout.chibi;
  const { reaction, now, reducedMotion } = scene;
  const age = reaction ? now - reaction.at : Infinity;
  let dx = 0;
  let dy = 0;
  let angle = 0;
  if (!reducedMotion) {
    angle = Math.sin(now * 1.3) * 0.01;
    // Typing: a small bob as the keys go
    if (scene.typing) dy = -Math.abs(Math.sin(now * 9)) * size * 0.004;
    if (reaction?.kind === "hop" && age < 0.32) {
      dy = -Math.sin((age / 0.32) * Math.PI) * size * 0.04;
    } else if (reaction?.kind === "cheer" && age < 0.9) {
      dy = -Math.abs(Math.sin((age / 0.45) * Math.PI)) * size * 0.06;
    } else if (reaction?.kind === "slump" && age < 0.6) {
      dx = Math.sin(age * 40) * size * 0.012 * (1 - age / 0.6);
      angle += 0.04 * Math.min(age / 0.2, 1);
    } else if (reaction?.kind === "slump") {
      angle += 0.04;
    }
  }
  ctx.save();
  ctx.translate(x + dx, feet + dy);
  ctx.rotate(angle);
  ctx.drawImage(art, -size / 2, -size * 0.975, size, size);
  ctx.restore();

  // A release shipped or a new best: tattoo stars round his head
  const shipped =
    scene.shippedAt !== null && now - scene.shippedAt < SHIPPED_LIFE;
  if (shipped || scene.best) {
    const head = { x: x - size * 0.02, y: feet - size * 0.86 };
    for (let i = 0; i < 3; i += 1) {
      const turn = (reducedMotion ? 0 : now * 1.6) + (i / 3) * Math.PI * 2;
      const sx = head.x + Math.cos(turn) * size * 0.2;
      const sy = head.y + Math.sin(turn) * size * 0.06 - size * 0.04;
      sparklePath(ctx, sx, sy, size * 0.04);
      ctx.fillStyle = RIM;
      ctx.fill();
      ctx.strokeStyle = RARITY.legendary[1];
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
};

/** The release shipped: its banner over the board, in the games' sticker. */
const shippedBanner = (ctx: CanvasRenderingContext2D, scene: MergeScene) => {
  if (scene.shippedAt === null) return;
  const age = scene.now - scene.shippedAt;
  if (age < 0 || age >= SHIPPED_LIFE) return;
  const { layout } = scene;
  const side = boardSize(layout);
  ctx.globalAlpha = Math.min(age / 0.15, 1, (SHIPPED_LIFE - age) / 0.4);
  const pop = scene.reducedMotion ? 1 : 1 + 0.25 * Math.max(0, 1 - age / 0.2);
  ctx.save();
  ctx.translate(layout.grid.x + side / 2, layout.grid.y + side / 2);
  ctx.scale(pop, pop);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  sticker(
    ctx,
    scene.words.shipped,
    0,
    0,
    layout === WIDE ? 34 : 24,
    OUTLINE,
    scene.font.display,
  );
  ctx.restore();
  ctx.globalAlpha = 1;
};

/** A frame of the editor. */
export const drawMerge = (ctx: CanvasRenderingContext2D, scene: MergeScene) => {
  const t = scene.night ? THEME.night : THEME.day;
  room(ctx, t, scene);
  // On a wide screen Lucas sits beside the editor, on a phone on top of it
  if (scene.layout === WIDE) lucas(ctx, scene);
  editor(ctx, t, scene);
  board(ctx, t, scene);
  tiles(ctx, t, scene);
  // Once over, the board steps back under the card
  if (scene.endedAt !== null) {
    const { grid } = scene.layout;
    const side = boardSize(scene.layout);
    const fade = scene.reducedMotion
      ? 1
      : clamp01((scene.now - scene.endedAt - 0.4) / 0.4);
    roundRect(ctx, grid.x, grid.y, side, side, 10);
    ctx.fillStyle = css(rgb(t.well), 0.45 * fade);
    ctx.fill();
  }
  popups(ctx, scene);
  if (scene.layout === TALL) lucas(ctx, scene);
  shippedBanner(ctx, scene);
};
