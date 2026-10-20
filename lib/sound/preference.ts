/**
 * The visitor's sound preference: on by default, off by default when their
 * system asks for reduced motion, and whatever they chose once they press
 * the sound switch, stored per visitor in `localStorage`.
 */

export const SOUND_STORAGE_KEY = "imjustlucas.sound";

export type StoredSound = "on" | "off";

/** What the sound switch shows. */
export type SoundState =
  | { readonly enabled: true; readonly reason: "default" | "chosen" }
  | {
      readonly enabled: false;
      readonly reason: "chosen" | "reduced-motion";
    };

/** Reads a stored value, ignoring anything that is not a known choice. */
export const parseStoredSound = (value: string | null): StoredSound | null =>
  value === "on" || value === "off" ? value : null;

export const resolveSoundState = (
  stored: StoredSound | null,
  prefersReducedMotion: boolean,
): SoundState => {
  if (stored === "on") return { enabled: true, reason: "chosen" };
  if (stored === "off") return { enabled: false, reason: "chosen" };
  return prefersReducedMotion
    ? { enabled: false, reason: "reduced-motion" }
    : { enabled: true, reason: "default" };
};

/** The minimal `Storage` the preference needs. */
type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * The stored choice, or none when there is none or storage is unavailable
 * (private windows, blocked site data, previews).
 */
export const readStoredSound = (
  storage: () => PreferenceStorage,
): StoredSound | null => {
  try {
    return parseStoredSound(storage().getItem(SOUND_STORAGE_KEY));
  } catch {
    return null;
  }
};

/** Stores the choice; the page keeps working when storage refuses it. */
export const writeStoredSound = (
  storage: () => PreferenceStorage,
  value: StoredSound,
): void => {
  try {
    storage().setItem(SOUND_STORAGE_KEY, value);
  } catch {
    // The choice still holds for this visit.
  }
};
