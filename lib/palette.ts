/**
 * The visitor's palette: "electric" (the default), "plum", "khaki",
 * "sakura" or "surf", stored per visitor in `localStorage` and set as
 * `data-palette` on <html> (absent for the default). Independent of the
 * light/dark mode, which next-themes keeps. A palette is its two blocks of role tokens in
 * `styles/globals.css`, its swatch and its name in the message dictionaries.
 */

export const PALETTES = [
  "electric",
  "plum",
  "khaki",
  "sakura",
  "surf",
] as const;
export type Palette = (typeof PALETTES)[number];

/** Each palette's signature colour, for its swatch in the theme menu. */
export const PALETTE_SWATCH: { readonly [P in Palette]: string } = {
  electric: "#2f6bff",
  plum: "#ff8a3d",
  khaki: "#5e6b3a",
  sakura: "#ffb3c7",
  surf: "#5fd0bd",
};

export const DEFAULT_PALETTE: Palette = "electric";
export const PALETTE_STORAGE_KEY = "imjustlucas.palette";

/** Reads a stored value, falling back to the default for anything unknown. */
export const parsePalette = (value: string | null | undefined): Palette =>
  PALETTES.find((palette) => palette === value) ?? DEFAULT_PALETTE;

/** The `data-palette` attribute for a palette; none for the default. */
export const paletteAttribute = (palette: Palette): string | null =>
  palette === DEFAULT_PALETTE ? null : palette;

/**
 * Runs in <head> before the first paint, so a visitor who chose plum never
 * sees the default flash. Storage may be unavailable; the default stays.
 */
export const PALETTE_SCRIPT = `try{var p=localStorage.getItem(${JSON.stringify(
  PALETTE_STORAGE_KEY,
)});if(p&&p!==${JSON.stringify(DEFAULT_PALETTE)}&&${JSON.stringify(
  PALETTES,
)}.indexOf(p)>-1)document.documentElement.setAttribute("data-palette",p)}catch(e){}`;
