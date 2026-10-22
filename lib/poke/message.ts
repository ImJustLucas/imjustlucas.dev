import { projectPath, ROUTES } from "@/config/routes";
import { type Locale, routing } from "@/i18n/routing";

import { type Emote, EMOTE_GLYPH } from "./emotes";

/**
 * What a Poke tells Lucas on Discord, and the rules that keep every part of
 * it out of a visitor's hands: the page must be one the site serves, the
 * place comes from Vercel's geo headers only, and the emote from a fixed set.
 * The message is in French, for Lucas.
 */

/** Where the visitor is, roughly: never stored, only told to Lucas. */
export type PokePlace = { readonly city?: string; readonly country?: string };

/** A city name: letters, spaces, apostrophes, dots and hyphens. */
const CITY = /^[\p{L}\p{M}][\p{L}\p{M} '’.-]{0,47}$/u;

/**
 * The visitor's city and country from Vercel's `x-vercel-ip-city` (URL
 * encoded) and `x-vercel-ip-country` (ISO 3166-1 alpha-2); null when neither
 * is usable.
 */
export const pokePlace = (
  city: string | null,
  country: string | null,
): PokePlace | null => {
  let decoded: string | undefined;
  try {
    decoded = city ? decodeURIComponent(city).trim() : undefined;
  } catch {
    decoded = undefined;
  }
  const place = {
    ...(decoded && CITY.test(decoded) && { city: decoded }),
    ...(country &&
      /^[A-Z]{2}$/.test(country) &&
      country !== "XX" && { country }),
  };
  return place.city || place.country ? place : null;
};

/** Every path the site serves, without its Locale prefix. */
export const knownPaths = (projectSlugs: ReadonlyArray<string>) =>
  new Set<string>([
    ...Object.values(ROUTES).map((route) => route.path),
    ...projectSlugs.map(projectPath),
  ]);

/**
 * The page the visitor waved from, e.g. `/fr/arcade`, and its Locale: null
 * unless it is a page the site serves.
 */
export const pokePage = (
  pathname: unknown,
  known: ReadonlySet<string>,
): { readonly page: string; readonly locale: Locale } | null => {
  if (typeof pathname !== "string" || pathname.length > 200) return null;
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(pathname);
  const locale = routing.locales.find((l) => l === match?.[1]);
  if (!match || !locale) return null;
  const path = (match[2] ?? "/").replace(/(.)\/$/, "$1");
  if (!known.has(path)) return null;
  return { page: path === "/" ? `/${locale}` : `/${locale}${path}`, locale };
};

/** A country's flag, from its two letters. */
export const countryFlag = (country: string) =>
  String.fromCodePoint(
    ...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );

const LANGUAGE: { readonly [L in Locale]: string } = {
  en: "en anglais",
  fr: "en français",
};

/** The action ink of the default palette (DESIGN.md, Colors). */
const ELECTRIC = 0x2f6bff;

export type PokeMessageInput = {
  readonly emote: Emote;
  readonly page: string;
  readonly locale: Locale;
  readonly place: PokePlace | null;
  /** The Admin's row of this Poke, where Lucas waves back. */
  readonly waveBackUrl: string;
  /** When it was sent, in milliseconds. */
  readonly at: number;
};

/** The body of the Discord webhook call: one embed, no mention ever pings. */
export const pokeMessage = ({
  emote,
  page,
  locale,
  place,
  waveBackUrl,
  at,
}: PokeMessageInput) => {
  const where = place && [place.city, place.country].filter(Boolean).join(", ");
  const lines = [
    `Depuis **${page}**, ${LANGUAGE[locale]}.`,
    ...(where
      ? [`📍 ${where}${place.country ? ` ${countryFlag(place.country)}` : ""}`]
      : []),
    "",
    `[Lui faire coucou en retour](${waveBackUrl})`,
  ];
  return {
    username: "imjustlucas.dev",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `${EMOTE_GLYPH[emote]} Quelqu'un te fait coucou !`,
        description: lines.join("\n"),
        color: ELECTRIC,
        timestamp: new Date(at).toISOString(),
      },
    ],
  };
};
