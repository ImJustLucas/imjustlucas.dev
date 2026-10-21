/**
 * A player's first name on an Arcade leaderboard: what a visitor may type,
 * shown publicly. Plain, so the cabinet checks it as they type and the
 * server checks it again before anything is stored.
 */

export const NAME_MAX_LENGTH = 16;

/** Letters (any script), digits, spaces, apostrophes, dots and hyphens. */
const SHAPE = /^[\p{L}\p{N}][\p{L}\p{M}\p{N} '’.-]*$/u;

/**
 * Words that never stand on the board, compared without case, accents or
 * spacing. Short on purpose: it stops the obvious, the Owner removes the rest
 * from the Admin.
 */
const BLOCKED = [
  "connard",
  "connasse",
  "encule",
  "enculer",
  "fdp",
  "salope",
  "pute",
  "batard",
  "negro",
  "nazi",
  "hitler",
  "pd",
  "tapette",
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nigger",
  "nigga",
  "fag",
  "whore",
  "slut",
  "dick",
  "cock",
  "pussy",
  "retard",
];

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

export type NameProblem = "empty" | "too-long" | "characters" | "blocked";

export type ParsedName =
  | { readonly ok: true; readonly name: string }
  | { readonly ok: false; readonly problem: NameProblem };

/** A typed name, tidied (trimmed, single spaces), or why it cannot be used. */
export const parseName = (typed: string): ParsedName => {
  const name = typed.normalize("NFC").trim().replace(/\s+/g, " ");
  if (name.length === 0) return { ok: false, problem: "empty" };
  if ([...name].length > NAME_MAX_LENGTH) {
    return { ok: false, problem: "too-long" };
  }
  if (!SHAPE.test(name)) return { ok: false, problem: "characters" };
  const folded = fold(name);
  const words = name.split(/[\s'’.-]+/).map(fold);
  const blocked = BLOCKED.some(
    (word) =>
      words.includes(word) || (word.length >= 5 && folded.includes(word)),
  );
  return blocked ? { ok: false, problem: "blocked" } : { ok: true, name };
};

/** A player's stable identifier, made in their browser. */
export const isPlayerId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
