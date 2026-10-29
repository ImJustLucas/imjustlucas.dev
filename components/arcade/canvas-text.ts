/**
 * What the game screens share on their canvas (DESIGN.md, Arcade): the text
 * drawn over the game (the level and the multiplier top left, points rising
 * where they were won, a new level's banner) with the obstacles' sticker
 * rim, and the blending of a game's palettes as its sky changes level by
 * level. Everything is in world units (720 by 405); the caller sets the
 * transform.
 */

/** The sticker rim the games draw round their obstacles. */
export const RIM = "#fffaf0";
/** The line round the obstacles, the chibi art's maroon. */
export const OUTLINE = "#4a1f24";
/** The multiplier's ink, and style's in the popups. */
export const STYLE_INK = "#d4513f";

/** How long a popup and a level's banner stay, in seconds. */
export const POPUP_LIFE = 0.9;
export const BANNER_LIFE = 1.8;

/** Text with the sticker rim, so it reads over any sky or street. */
export const sticker = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  font: string,
) => {
  ctx.font = `700 ${size}px ${font}`;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(4, size * 0.32);
  ctx.strokeStyle = RIM;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
};

export type Popup = {
  readonly points: number;
  readonly combo: number;
  /** Where it was won, in world units (y down). */
  readonly x: number;
  readonly y: number;
  readonly ink: string;
  /** Seconds since it was won. */
  readonly age: number;
};

export type Overlay = {
  /** The level's name, top left. */
  readonly level: string;
  /** The level's ink: the score's, following the sky. */
  readonly ink: string;
  readonly combo: number;
  readonly popups: ReadonlyArray<Popup>;
  /** A new level's name and age, for its banner. */
  readonly banner: { readonly text: string; readonly age: number } | null;
  /** The family of the site's Data font. */
  readonly font: string;
  readonly reducedMotion: boolean;
};

/**
 * The text over a running game: the level over the multiplier (above x1)
 * top left, points rising 26 units and fading as they go, and a new level's
 * banner ahead of the player, on the part of the screen a phone shows too
 * (3:2, 607 units wide).
 */
export const drawOverlay = (ctx: CanvasRenderingContext2D, o: Overlay) => {
  const { font } = o;
  ctx.textBaseline = "alphabetic";

  ctx.textAlign = "left";
  ctx.font = `500 13px ${font}`;
  ctx.fillStyle = o.ink;
  ctx.fillText(o.level, 16, 26);
  if (o.combo > 1) sticker(ctx, `x${o.combo}`, 16, 56, 24, STYLE_INK, font);

  ctx.textAlign = "center";
  for (const popup of o.popups) {
    if (popup.age >= POPUP_LIFE) continue;
    const t = popup.age / POPUP_LIFE;
    ctx.globalAlpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    const rise = o.reducedMotion ? 0 : t * 26;
    const text =
      popup.combo > 1 ? `+${popup.points} x${popup.combo}` : `+${popup.points}`;
    sticker(ctx, text, popup.x, popup.y - rise, 15, popup.ink, font);
  }
  ctx.globalAlpha = 1;

  const { banner } = o;
  if (banner && banner.age < BANNER_LIFE) {
    const { age } = banner;
    ctx.globalAlpha = Math.min(age / 0.15, 1, (BANNER_LIFE - age) / 0.4);
    const pop = o.reducedMotion ? 1 : 1 + 0.25 * Math.max(0, 1 - age / 0.2);
    ctx.save();
    ctx.translate(360, 132);
    ctx.scale(pop, pop);
    sticker(ctx, banner.text, 0, 0, 30, OUTLINE, font);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
};

type Rgba = readonly [number, number, number, number];

const parse = (color: string): Rgba => {
  if (color.startsWith("#")) {
    const channel = (at: number) => parseInt(color.slice(at, at + 2), 16);
    return [channel(1), channel(3), channel(5), 1];
  }
  const [r, g, b, a = 1] = color
    .slice(color.indexOf("(") + 1, -1)
    .split(",")
    .map(Number);
  return [r, g, b, a];
};

/** A colour `t` of the way from one to another (hex or rgba). */
export const mix = (from: string, to: string, t: number) => {
  const a = parse(from);
  const b = parse(to);
  const [r, g, bl] = [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));
  return `rgba(${r}, ${g}, ${bl}, ${a[3] + (b[3] - a[3]) * t})`;
};

type Palette = { readonly [name: string]: string | ReadonlyArray<string> };

/**
 * A palette along a row of keyframes: `at` 0 is the first, 1 the second,
 * 1.5 halfway from the second to the third. Every keyframe has the same
 * names, each a colour or a list of colours.
 */
export const blend = <P extends Palette>(
  keyframes: ReadonlyArray<P>,
  at: number,
): P => {
  const index = Math.min(Math.max(Math.floor(at), 0), keyframes.length - 2);
  const t = Math.min(Math.max(at - index, 0), 1);
  const from = keyframes[index];
  const to = keyframes[index + 1];
  return Object.fromEntries(
    Object.keys(from).map((name) => {
      const a = from[name];
      const b = to[name];
      return [
        name,
        typeof a === "string"
          ? mix(a, b as string, t)
          : a.map((color, i) => mix(color, (b as ReadonlyArray<string>)[i], t)),
      ];
    }),
  ) as P;
};
