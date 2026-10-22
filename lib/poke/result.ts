import type { Locale } from "@/i18n/routing";

import type { Emote } from "./emotes";

/**
 * The Pokes as plain data: what the server returns, the buttons show and the
 * Admin lists. No Effect (ADR-0002), so client components can import it; the
 * rules are in `poke.ts`.
 */

export type SentPoke =
  /** On its way to Lucas's Discord; `pokeId` asks later if he waved back. */
  | { readonly kind: "sent"; readonly pokeId: string; readonly at: number }
  /** This visitor already waved in the last day. */
  | { readonly kind: "limited" }
  /** The site's Pokes for the hour are all used. */
  | { readonly kind: "busy" }
  /** Not a Poke the site sends (an unknown emote or page). */
  | { readonly kind: "refused" }
  /** Upstash or Discord did not answer; nothing was sent. */
  | { readonly kind: "unavailable" };

export type PokeReply =
  | { readonly kind: "waved" }
  | { readonly kind: "waiting" }
  /** Too old, or never sent: there will be no answer. */
  | { readonly kind: "gone" }
  | { readonly kind: "unavailable" };

/** A Poke as the Admin lists it: never where the visitor was. */
export type RecentPoke = {
  readonly id: string;
  readonly emote: Emote;
  /** The page, with its Locale prefix, e.g. `/fr/arcade`. */
  readonly page: string;
  readonly locale: Locale;
  /** When it was sent, in milliseconds. */
  readonly at: number;
  readonly wavedBack: boolean;
};
