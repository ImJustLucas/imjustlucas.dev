import { type Emote, isEmote } from "./emotes";
import { POKE_LIMITS, POKE_TTL_SECONDS } from "./limits";

/**
 * The visitor's own Poke, kept in their browser (`localStorage`): what the
 * wave buttons show, and whether to ask the server if Lucas waved back.
 * Plain, so it is tested beside the rules.
 */

export const POKE_STORAGE_KEY = "imjustlucas:poke";

/** The first name the visitor typed for their waves, as typed. */
export const POKE_NAME_KEY = "imjustlucas:poke:name";

export type VisitPoke = {
  /** None when the server said the visitor had already waved elsewhere. */
  readonly pokeId: string | null;
  readonly emote: Emote | null;
  /** When it was sent, in milliseconds. */
  readonly at: number;
  readonly wavedBack: boolean;
};

/** The stored Poke, or null when there is none or it is unreadable. */
export const readVisitPoke = (raw: string | null): VisitPoke | null => {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { pokeId, emote, at, wavedBack } = value as Record<string, unknown>;
    if (typeof at !== "number" || !Number.isFinite(at)) return null;
    return {
      pokeId: typeof pokeId === "string" ? pokeId : null,
      emote: isEmote(emote) ? emote : null,
      at,
      wavedBack: wavedBack === true,
    };
  } catch {
    return null;
  }
};

/** What the wave buttons show at `now`. */
export type WaveView =
  | { readonly kind: "ready" }
  | {
      readonly kind: "sent";
      readonly emote: Emote | null;
      readonly wavedBack: boolean;
    };

/** A Poke holds the buttons for the visitor's day, as the server does. */
export const waveView = (poke: VisitPoke | null, now: number): WaveView =>
  poke && now - poke.at < POKE_LIMITS.visitor.seconds * 1000
    ? { kind: "sent", emote: poke.emote, wavedBack: poke.wavedBack }
    : { kind: "ready" };

/** Whether Lucas may still wave back: a kept Poke he has not answered. */
export const awaitsReply = (poke: VisitPoke | null, now: number) =>
  Boolean(
    poke?.pokeId && !poke.wavedBack && now - poke.at < POKE_TTL_SECONDS * 1000,
  );
