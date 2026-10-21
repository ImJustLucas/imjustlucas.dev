/**
 * What every Arcade game shares: the seeded generator that lays its world
 * out, and the visitor's own best, kept in their browser.
 */

/** mulberry32: a small, fast, seeded generator; returns [0, 1) and the next seed. */
export const random = (seed: number): readonly [number, number] => {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
};

/** The better of a stored best and a finished run. */
export const bestOf = (stored: number | null, run: number) =>
  Math.max(stored ?? 0, run);

/** A stored best score, or null when it is missing or not a score. */
export const parseBest = (raw: string | null): number | null => {
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
};
