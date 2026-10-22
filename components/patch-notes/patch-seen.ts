/**
 * The last patch the visitor read, kept in their browser so the sidebar's
 * version shows a dot until they open the patch notes. A per-visitor
 * convenience: when storage refuses, nothing is remembered and nothing breaks.
 */

const KEY = "imjustlucas.patch-seen";
/** Said on this tab when the patch notes are read (`storage` is for others). */
const SEEN = "imjustlucas:patch-seen";

export const readSeenPatch = (): string | null => {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const markPatchSeen = (version: string) => {
  try {
    window.localStorage.setItem(KEY, version);
  } catch {
    // Storage refused: the dot simply stays.
  }
  window.dispatchEvent(new Event(SEEN));
};

export const subscribeSeenPatch = (onChange: () => void) => {
  window.addEventListener(SEEN, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SEEN, onChange);
    window.removeEventListener("storage", onChange);
  };
};
