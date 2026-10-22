/**
 * How often visitors may wave at Lucas (DESIGN.md, Wave), so a Poke can never
 * be used to flood his Discord. Plain numbers, applied by `poke.ts`.
 */
export const POKE_LIMITS = {
  /** Each visitor waves once a day, counted from their wave. */
  visitor: { seconds: 24 * 60 * 60 },
  /** At most 20 Pokes an hour reach Lucas, from every visitor together. */
  everyone: { count: 20, windowSeconds: 60 * 60 },
} as const;

/** How long a Poke is kept, for the Admin and for its answer (7 days). */
export const POKE_TTL_SECONDS = 7 * 24 * 60 * 60;

/** How many Pokes the Admin lists, newest first. */
export const RECENT_POKES = 50;

/** The hour a Poke sent at `now` (milliseconds) counts against. */
export const pokeHour = (now: number) =>
  Math.floor(now / 1000 / POKE_LIMITS.everyone.windowSeconds);
