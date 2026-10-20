const channel = (hex: string) => {
  const c = parseInt(hex, 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance (WCAG) of a `#rrggbb` colour, from 0 to 1. */
const luminance = (color: string) =>
  0.2126 * channel(color.slice(1, 3)) +
  0.7152 * channel(color.slice(3, 5)) +
  0.0722 * channel(color.slice(5, 7));

/** WCAG contrast ratio between two `#rrggbb` colours, from 1 to 21. */
export const contrastRatio = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/**
 * Text colour for a label on a `#rrggbb` background: whichever of black or
 * white contrasts more with it, which is always at least 4.58:1.
 */
export const textColorOn = (background: string): "#000000" | "#ffffff" =>
  contrastRatio(background, "#000000") >= contrastRatio(background, "#ffffff")
    ? "#000000"
    : "#ffffff";

/** The client's two inks: Night (#1c0f2b) and Cream (#fff1e6). */
export const NIGHT = "#1c0f2b";
export const CREAM = "#fff1e6";

/**
 * The Computed Ink Rule: text on a coloured fill is whichever of Night or
 * Cream contrasts more with it, or none when neither reaches 4.5:1, in which
 * case the colour is drawn as an outline instead of a fill.
 */
export const inkOn = (
  background: string,
): typeof NIGHT | typeof CREAM | null => {
  const night = contrastRatio(background, NIGHT);
  const cream = contrastRatio(background, CREAM);
  const best = Math.max(night, cream);
  if (best < 4.5) return null;
  return night >= cream ? NIGHT : CREAM;
};
