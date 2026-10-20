/**
 * The visitor's palette: "electric" (the default) or "plum", stored per
 * visitor in `localStorage` and set as `data-palette` on <html> (absent for
 * the default). Independent of the light/dark mode, which next-themes keeps.
 */

export const PALETTES = ["electric", "plum"] as const;
export type Palette = (typeof PALETTES)[number];

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
