import { MENU_ROUTES } from "@/config/routes";
import { routing } from "@/i18n/routing";
import type { Rarity } from "@/lib/content/types";
import { PALETTES } from "@/lib/palette";
import type { Secret } from "@/lib/quick-menu/commands";

/**
 * The visitor's Trophies (docs/trophies.md): what a visitor unlocks by
 * exploring the site, kept in their own browser. Lucas's Achievements are
 * his; Trophies are the visitor's. Plain data and the unlock rules, run by
 * `components/trophies`.
 */

/**
 * The steps a Tally counts, each once: a Trophy built on a Tally unlocks
 * when enough of its steps were counted, over any number of visits.
 */
export const TALLIES = {
  /** The menu's tabs, by path. */
  tabs: MENU_ROUTES.map((route) => route.path),
  palettes: PALETTES,
  locales: routing.locales,
  /** The resolved modes, so "system" counts as what it shows. */
  modes: ["dark", "light"],
  // Written out rather than read from the quick menu's commands, which are
  // its own chunk (a test keeps the two lists equal)
  secrets: [
    "konami",
    "barrelRoll",
    "coffee",
    "sleep",
    "gg",
    "hire",
  ] satisfies ReadonlyArray<Secret>,
} as const satisfies Record<string, ReadonlyArray<string>>;

export type TallyId = keyof typeof TALLIES;
export type TallyStep<T extends TallyId> = (typeof TALLIES)[T][number];

export type TrophyId =
  | "inspector"
  | "ollie"
  | "surf"
  | "bilingual"
  | "dayNight"
  | "whatsNew"
  | "radio"
  | "tour"
  | "painter"
  | "friendRequest"
  | "waved"
  | "seenOnline"
  | "coinRain"
  | "rainyDay"
  | "top10"
  | "firstSecret"
  | "lost"
  | "secretHunter"
  | "platinum";

export type Trophy = {
  readonly id: TrophyId;
  /** The Achievement rarities, drawn the same way. */
  readonly rarity: Rarity;
  /** Shown as "???" with its hint until unlocked. */
  readonly secret?: true;
  /** Unlocked by something the visitor did not do (presence): no cue. */
  readonly quiet?: true;
  /** Unlocks once `needs` steps of the Tally are counted (all by default). */
  readonly tally?: { readonly of: TallyId; readonly needs?: number };
  /** Unlocks once every other Trophy is. */
  readonly everyOther?: true;
};

/** Every Trophy, in the order of the trophies page: commonest first. */
export const TROPHIES: ReadonlyArray<Trophy> = [
  { id: "inspector", rarity: "common" },
  { id: "ollie", rarity: "common" },
  { id: "surf", rarity: "common" },
  { id: "bilingual", rarity: "common", tally: { of: "locales" } },
  { id: "dayNight", rarity: "common", tally: { of: "modes" } },
  { id: "whatsNew", rarity: "common" },
  { id: "radio", rarity: "common" },
  { id: "tour", rarity: "rare", tally: { of: "tabs" } },
  { id: "painter", rarity: "rare", tally: { of: "palettes" } },
  { id: "friendRequest", rarity: "rare" },
  { id: "waved", rarity: "rare" },
  { id: "seenOnline", rarity: "rare", quiet: true },
  { id: "coinRain", rarity: "rare" },
  { id: "rainyDay", rarity: "rare" },
  { id: "top10", rarity: "epic" },
  {
    id: "firstSecret",
    rarity: "epic",
    secret: true,
    tally: { of: "secrets", needs: 1 },
  },
  { id: "lost", rarity: "epic", secret: true },
  { id: "secretHunter", rarity: "legendary", tally: { of: "secrets" } },
  { id: "platinum", rarity: "legendary", everyOther: true },
];

const BY_ID = new Map(TROPHIES.map((trophy) => [trophy.id, trophy]));

export const trophyById = (id: TrophyId): Trophy => {
  const trophy = BY_ID.get(id);
  if (!trophy) throw new Error(`Unknown trophy: ${id}`);
  return trophy;
};

/** What the visitor has done, as stored in their browser. */
export type TrophyProgress = {
  /** When each unlocked Trophy was unlocked (ISO 8601). */
  readonly unlocked: { readonly [T in TrophyId]?: string };
  /** The unlocked Trophies whose toast was shown. */
  readonly announced: ReadonlyArray<TrophyId>;
  /** The steps counted by each Tally. */
  readonly tallies: { readonly [T in TallyId]?: ReadonlyArray<string> };
};

export const EMPTY_PROGRESS: TrophyProgress = {
  unlocked: {},
  announced: [],
  tallies: {},
};

const isTrophyId = (value: unknown): value is TrophyId =>
  typeof value === "string" && BY_ID.has(value as TrophyId);

const isTallyId = (value: string): value is TallyId => value in TALLIES;

const isStep = (tally: TallyId, step: unknown): step is string =>
  (TALLIES[tally] as ReadonlyArray<unknown>).includes(step);

const goalOf = (trophy: Trophy): number => {
  if (trophy.everyOther) return TROPHIES.length - 1;
  if (!trophy.tally) return 1;
  return trophy.tally.needs ?? TALLIES[trophy.tally.of].length;
};

/** How far the visitor is towards a Trophy, as `done` of `goal`. */
export const trophyCount = (
  progress: TrophyProgress,
  trophy: Trophy,
): { readonly done: number; readonly goal: number } => {
  const goal = goalOf(trophy);
  if (progress.unlocked[trophy.id]) return { done: goal, goal };
  if (trophy.everyOther) {
    return { done: unlockedCount(progress), goal };
  }
  if (trophy.tally) {
    const steps = progress.tallies[trophy.tally.of]?.length ?? 0;
    return { done: Math.min(steps, goal), goal };
  }
  return { done: 0, goal };
};

export const unlockedCount = (progress: TrophyProgress): number =>
  TROPHIES.filter((trophy) => progress.unlocked[trophy.id]).length;

/** Unlocks every Trophy whose rule is now met, the one for all others last. */
const settle = (progress: TrophyProgress, now: Date): TrophyProgress => {
  const at = now.toISOString();
  const unlocked = { ...progress.unlocked };
  for (const trophy of TROPHIES) {
    if (unlocked[trophy.id] || !trophy.tally) continue;
    const { done, goal } = trophyCount(progress, trophy);
    if (done >= goal) unlocked[trophy.id] = at;
  }
  const others = TROPHIES.filter((trophy) => !trophy.everyOther);
  if (others.every((trophy) => unlocked[trophy.id])) {
    for (const trophy of TROPHIES) {
      if (trophy.everyOther) unlocked[trophy.id] ??= at;
    }
  }
  const changed = TROPHIES.some(
    (trophy) => unlocked[trophy.id] !== progress.unlocked[trophy.id],
  );
  return changed ? { ...progress, unlocked } : progress;
};

/**
 * Unlocks a Trophy the visitor just earned. A Trophy built on a Tally or on
 * every other one unlocks by its rule only, so it is left as it is. The same
 * progress comes back when nothing changed.
 */
export const unlockTrophyIn = (
  progress: TrophyProgress,
  id: TrophyId,
  now: Date,
): TrophyProgress => {
  const trophy = BY_ID.get(id);
  if (!trophy || trophy.tally || trophy.everyOther) return progress;
  if (progress.unlocked[id]) return progress;
  return settle(
    {
      ...progress,
      unlocked: { ...progress.unlocked, [id]: now.toISOString() },
    },
    now,
  );
};

/**
 * Counts one step of a Tally (a tab visited, a palette tried), once, and
 * unlocks what it completes. A step the Tally does not know is ignored.
 */
export const countTrophyStepIn = <T extends TallyId>(
  progress: TrophyProgress,
  tally: T,
  step: TallyStep<T>,
  now: Date,
): TrophyProgress => {
  if (!isStep(tally, step)) return progress;
  const steps: ReadonlyArray<string> = progress.tallies[tally] ?? [];
  if (steps.includes(step)) return progress;
  return settle(
    {
      ...progress,
      tallies: { ...progress.tallies, [tally]: [...steps, step] },
    },
    now,
  );
};

/** The unlocked Trophies still to announce, oldest first. */
export const toAnnounce = (progress: TrophyProgress): TrophyId[] =>
  TROPHIES.filter(
    (trophy) =>
      progress.unlocked[trophy.id] && !progress.announced.includes(trophy.id),
  )
    .map((trophy) => trophy.id)
    .sort((a, b) =>
      (progress.unlocked[a] ?? "").localeCompare(progress.unlocked[b] ?? ""),
    );

export const markAnnouncedIn = (
  progress: TrophyProgress,
  id: TrophyId,
): TrophyProgress =>
  progress.announced.includes(id)
    ? progress
    : { ...progress, announced: [...progress.announced, id] };

/** The key of the stored progress; a new shape takes a new version. */
export const TROPHY_STORAGE_KEY = "imjustlucas.trophies.v1";

const isDate = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Reads stored progress, keeping only what is still known: an unknown
 * Trophy, Tally or step, or a malformed value, is dropped, never thrown.
 */
export const parseProgress = (raw: string | null): TrophyProgress => {
  if (!raw) return EMPTY_PROGRESS;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return EMPTY_PROGRESS;
  }
  if (!isRecord(value)) return EMPTY_PROGRESS;

  const unlocked: { [T in TrophyId]?: string } = {};
  if (isRecord(value.unlocked)) {
    for (const [id, at] of Object.entries(value.unlocked)) {
      if (isTrophyId(id) && isDate(at)) unlocked[id] = at;
    }
  }
  const announced = Array.isArray(value.announced)
    ? [...new Set(value.announced.filter(isTrophyId))].filter(
        (id) => unlocked[id],
      )
    : [];
  const tallies: { [T in TallyId]?: ReadonlyArray<string> } = {};
  if (isRecord(value.tallies)) {
    for (const [tally, steps] of Object.entries(value.tallies)) {
      if (!isTallyId(tally) || !Array.isArray(steps)) continue;
      tallies[tally] = [
        ...new Set(steps.filter((step) => isStep(tally, step))),
      ];
    }
  }
  return { unlocked, announced, tallies };
};

/** The minimal `Storage` the progress needs. */
type ProgressStorage = Pick<Storage, "getItem" | "setItem">;

/** The stored progress, or none when storage is unavailable. */
export const readStoredProgress = (
  storage: () => ProgressStorage,
): TrophyProgress => {
  try {
    return parseProgress(storage().getItem(TROPHY_STORAGE_KEY));
  } catch {
    return EMPTY_PROGRESS;
  }
};

/** Stores the progress; the visit keeps it when storage refuses. */
export const writeStoredProgress = (
  storage: () => ProgressStorage,
  progress: TrophyProgress,
): void => {
  try {
    storage().setItem(TROPHY_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The Trophies still hold for this visit.
  }
};
