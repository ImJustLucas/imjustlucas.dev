const channel = (hex: string) => {
  const c = parseInt(hex, 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance (WCAG) of a `#rrggbb` colour, from 0 to 1. */
const luminance = (color: string) =>
  0.2126 * channel(color.slice(1, 3)) +
  0.7152 * channel(color.slice(3, 5)) +
  0.0722 * channel(color.slice(5, 7));

/** Text colour for a label on a `#rrggbb` background: black on light ones. */
export const textColorOn = (background: string): "#000000" | "#ffffff" =>
  luminance(background) > 0.5 ? "#000000" : "#ffffff";
