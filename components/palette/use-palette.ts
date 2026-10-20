"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_PALETTE,
  type Palette,
  PALETTE_STORAGE_KEY,
  paletteAttribute,
  parsePalette,
} from "@/lib/palette";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** The palette on <html>, set before the first paint by `PALETTE_SCRIPT`. */
const current = (): Palette =>
  parsePalette(document.documentElement.getAttribute("data-palette"));

/** The visitor's palette and the way to change it (stored per visitor). */
export const usePalette = () => {
  const palette = useSyncExternalStore(
    subscribe,
    current,
    () => DEFAULT_PALETTE,
  );

  const setPalette = (next: Palette) => {
    const attribute = paletteAttribute(next);
    if (attribute) {
      document.documentElement.setAttribute("data-palette", attribute);
    } else {
      document.documentElement.removeAttribute("data-palette");
    }
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      // The choice still holds for this visit.
    }
    listeners.forEach((listener) => listener());
  };

  return { palette, setPalette };
};
