/**
 * The Konami code, typed anywhere on the site outside a field, reveals a
 * secret (DESIGN.md, Quick menu). Its own module so the page's first load
 * carries only this, not the quick menu's commands.
 */

/** The Konami code, as `KeyboardEvent.key` values (letters lowercased). */
export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

/**
 * How far into the Konami code the visitor is after pressing `key`, from
 * `progress` keys in; `KONAMI.length` means the code is complete. A wrong
 * key starts over, counting itself if it opens the code.
 */
export const konamiStep = (progress: number, key: string): number => {
  const pressed = key.length === 1 ? key.toLowerCase() : key;
  const at = progress >= KONAMI.length ? 0 : progress;
  if (KONAMI[at] === pressed) return at + 1;
  // ↑ ↑ ↑: still two ups in
  if (pressed === KONAMI[0]) return at === 2 ? 2 : 1;
  return 0;
};
