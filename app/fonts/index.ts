import { Unbounded } from "next/font/google";
import localFont from "next/font/local";

/** Site fonts, shared by every root layout (the Locale segment and the Admin). */
export const geistSans = localFont({
  src: "./GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const geistMono = localFont({
  src: "./GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/** The display face: greetings, page titles, section and item names. */
export const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

/** The font variables every root layout sets on its <body>. */
export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${unbounded.variable}`;
