/**
 * Loading tips (DESIGN.md, Loading tip): one line a game shows while it
 * loads, here only during a real wait, never behind an added delay. Each tip
 * points at a feature of the site, or is a small fact about Lucas; its text
 * is `LoadingTips.tips.<id>` in the message dictionaries. Plain code, no
 * browser API: the component reads storage and passes what it found.
 */

import { PALETTE_STORAGE_KEY } from "@/lib/palette";
import { SOUND_STORAGE_KEY } from "@/lib/sound/preference";

/** What a visitor may have tried already, read from their browser. */
export type TipFeature =
  | "quick-menu"
  | "palette"
  | "mode"
  | "sound"
  | "arcade"
  | "patch-notes";

/** The waits that show a tip: a cabinet's game, the MDF 2025 scene. */
export type TipWait = "arcade" | "mdf-2025";

type Tip = {
  readonly id: string;
  /** The feature the tip makes visitors discover. */
  readonly feature?: TipFeature;
  /** Waits it would only repeat (the trophy, on the trophy's own page). */
  readonly hiddenDuring?: ReadonlyArray<TipWait>;
};

export const LOADING_TIPS = [
  { id: "quickMenu", feature: "quick-menu" },
  { id: "quickMenuWeird", feature: "quick-menu" },
  { id: "cheatCodes", feature: "quick-menu" },
  { id: "sudo", feature: "quick-menu" },
  { id: "palettes", feature: "palette" },
  { id: "lightMode", feature: "mode" },
  { id: "mute", feature: "sound" },
  { id: "melody", feature: "sound" },
  { id: "leaderboard", feature: "arcade" },
  { id: "cabinets", feature: "arcade" },
  { id: "patchNotes", feature: "patch-notes" },
  { id: "addFriend" },
  { id: "level" },
  { id: "presence" },
  { id: "liveChibi" },
  { id: "language" },
  { id: "trophy", hiddenDuring: ["mdf-2025"] },
  { id: "coffee" },
  { id: "boards" },
  { id: "mains" },
  { id: "tattoo" },
  { id: "humble" },
] as const satisfies ReadonlyArray<Tip>;

export type TipId = (typeof LOADING_TIPS)[number]["id"];

/** A wait shorter than this shows no tip, so a fast load never flashes one. */
export const TIP_DELAY_MS = 400;

/**
 * How likely a tip is: a feature the visitor has not tried yet weighs
 * twice a plain tip, one they already used half of one.
 */
export const tipWeight = (tip: Tip, tried: ReadonlySet<TipFeature>): number => {
  if (!tip.feature) return 1;
  return tried.has(tip.feature) ? 0.5 : 2;
};

/**
 * The tip for this wait: drawn at random by weight, never the last one
 * shown, never one hidden during this wait. `random` returns [0, 1).
 */
export const pickTip = ({
  wait,
  last,
  tried,
  random,
  tips = LOADING_TIPS,
}: {
  wait: TipWait;
  last: string | null;
  tried: ReadonlySet<TipFeature>;
  random: () => number;
  tips?: ReadonlyArray<Tip>;
}): string => {
  const shown = tips.filter((tip) => !tip.hiddenDuring?.includes(wait));
  const fresh = shown.filter((tip) => tip.id !== last);
  const pool = fresh.length > 0 ? fresh : shown;
  const weights = pool.map((tip) => tipWeight(tip, tried));
  let roll = random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (const [index, tip] of pool.entries()) {
    roll -= weights[index];
    if (roll < 0) return tip.id;
  }
  return pool[pool.length - 1].id;
};

/**
 * The browser's own record of what the visitor tried: each key below is
 * written by the feature itself (palette, mode, sound switch, arcade
 * player, patch notes read). The quick menu keeps none, so its tips stay
 * "not tried".
 */
export const TRIED_KEYS: { readonly [F in TipFeature]: ReadonlyArray<string> } =
  {
    "quick-menu": [],
    palette: [PALETTE_STORAGE_KEY],
    // next-themes' own key, written when the visitor picks a mode
    mode: ["theme"],
    sound: [SOUND_STORAGE_KEY],
    arcade: [
      "imjustlucas:arcade:player",
      "imjustlucas:arcade:ollie:best",
      "imjustlucas:arcade:surf:best",
      "imjustlucas:arcade:cafe:best",
      "imjustlucas:arcade:merge:best",
    ],
    "patch-notes": ["imjustlucas.patch-seen"],
  };

/** The features with at least one key set, from a storage reader. */
export const triedFeatures = (
  getItem: (key: string) => string | null,
): ReadonlySet<TipFeature> =>
  new Set(
    (Object.keys(TRIED_KEYS) as TipFeature[]).filter((feature) =>
      TRIED_KEYS[feature].some((key) => getItem(key) !== null),
    ),
  );
