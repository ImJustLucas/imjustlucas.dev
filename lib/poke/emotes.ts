/**
 * The emotes a visitor waves with (DESIGN.md, Wave): a fixed set, so a Poke
 * never carries a word a visitor typed and there is nothing to moderate.
 * Plain, read by the buttons and checked again by the server.
 */

export const EMOTES = ["wave", "gg", "fire", "coffee", "surf"] as const;
export type Emote = (typeof EMOTES)[number];

/** What each emote shows, on the site and in Lucas's Discord. */
export const EMOTE_GLYPH: { readonly [E in Emote]: string } = {
  wave: "👋",
  gg: "🎮",
  fire: "🔥",
  coffee: "☕",
  surf: "🏄",
};

export const isEmote = (emote: unknown): emote is Emote =>
  (EMOTES as ReadonlyArray<unknown>).includes(emote);
