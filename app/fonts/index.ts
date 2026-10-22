import { Unbounded } from "next/font/google";
import localFont from "next/font/local";

/*
 * Geist and Geist Mono are split like Google Fonts subsets: the Latin file
 * (preloaded, everything the site writes in English and French) and the rest
 * of the font, one more @font-face of the same family whose unicode-range
 * makes the browser fetch it only for a character outside Latin. Together
 * they are the original variable fonts, glyph for glyph. Made with fontTools:
 * `pyftsubset GeistVF.woff --unicodes=<range> --layout-features='*'
 * --flavor=woff2`, the Latin range below, the extended one is the rest. The
 * extended range lists only the blocks the fonts cover, so an emoji or its
 * variation selector never fetches it.
 */

/** Site fonts, shared by every root layout (the Locale segment and the Admin). */
export const geistSans = localFont({
  src: "./GeistVF-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  declarations: [
    { prop: "font-family", value: "geistSans" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2190-2199, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

/** The rest of Geist, fetched only for a character outside Latin. */
export const geistSansExtended = localFont({
  src: "./GeistVF-ext.woff2",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "geistSans" },
    {
      prop: "unicode-range",
      value:
        "U+0100-0130, U+0132-0151, U+0154-02BA, U+02BD-02C5, U+02C7-02D9, U+02DB, U+02DD-0303, U+0305-0307, U+0309-0328, U+032A-04FF, U+0E3F, U+1E00-1EFF, U+2070-20AB, U+20AD-2121, U+2123-218F, U+219A-2211, U+2213-2214, U+2216-25FF, U+2639-263A, U+2776-277E, U+3000-303F, U+A78B-A78C, U+F8FF, U+FB01-FB02",
    },
  ],
});

export const geistMono = localFont({
  src: "./GeistMonoVF-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  declarations: [
    { prop: "font-family", value: "geistMono" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2190-2199, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

/** The rest of Geist Mono, fetched only for a character outside Latin. */
export const geistMonoExtended = localFont({
  src: "./GeistMonoVF-ext.woff2",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "geistMono" },
    {
      prop: "unicode-range",
      value:
        "U+0100-0130, U+0132-0151, U+0154-02BA, U+02BD-02C5, U+02C7-02D9, U+02DB, U+02DD-0303, U+0305-0307, U+0309-0328, U+032A-04FF, U+0E3F, U+1E00-1EFF, U+2070-20AB, U+20AD-2121, U+2123-218F, U+219A-2211, U+2213-2214, U+2216-25FF, U+2639-263A, U+2776-277E, U+3000-303F, U+A78B-A78C, U+F8FF, U+FB01-FB02",
    },
  ],
});

/**
 * The display face: greetings, page titles, section and item names. Only
 * Latin is preloaded; the other subsets load if a character needs them.
 */
export const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** The font variables every root layout sets on its <body>. */
export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${unbounded.variable}`;
