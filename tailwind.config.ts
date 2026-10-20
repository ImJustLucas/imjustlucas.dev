import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";

/** A colour token of `styles/globals.css`, with Tailwind's alpha modifier. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Geist and Unbounded, loaded by `app/fonts` as CSS variables on every
      // root layout's <body>.
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
        display: [
          "var(--font-display)",
          "var(--font-geist-sans)",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      // The type roles of DESIGN.md; families are set by the typography
      // primitives (`components/typography`).
      fontSize: {
        display: [
          "clamp(2.25rem, 1.6rem + 2.2vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        headline: [
          "1.75rem",
          { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        title: ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        play: ["1.0625rem", { lineHeight: "1", fontWeight: "700" }],
        label: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "500" }],
        tag: [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "0.02em", fontWeight: "600" },
        ],
        data: ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "500" }],
      },
      colors: {
        // The world's roles, flipping with the theme
        frame: token("frame"),
        ground: token("ground"),
        raised: token("raised"),
        seam: token("seam"),
        ledge: token("ledge"),
        ink: { DEFAULT: token("ink"), muted: token("ink-muted") },
        // The one thing to press: the Play button, the active tab, the sound
        // switch when on, focus and selection (`ink` is its role as text)
        action: {
          DEFAULT: token("action"),
          ledge: token("action-ledge"),
          ink: token("action-ink"),
        },
        "on-action": token("on-action"),
        // Text on bright fills: navy in electric, Night in plum
        "on-bright": token("on-bright"),
        // Fixed palette; `-ink` is the colour's role as text or thin line
        night: token("night"),
        cream: token("cream"),
        tangerine: {
          DEFAULT: token("tangerine"),
          ledge: token("tangerine-ledge"),
        },
        electric: token("electric"),
        "off-white": token("off-white"),
        legendary: { DEFAULT: token("legendary"), ink: token("legendary-ink") },
        epic: { DEFAULT: token("epic"), ink: token("epic-ink") },
        rare: { DEFAULT: token("rare"), ink: token("rare-ink") },
        common: { DEFAULT: token("common"), ink: token("common-ink") },
        online: { DEFAULT: token("online"), ink: token("online-ink") },
        away: token("away"),
        busy: { DEFAULT: token("busy"), ink: token("busy-ink") },
        // shadcn roles, mapped onto the world in `globals.css`
        background: token("background"),
        foreground: token("foreground"),
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      spacing: {
        frame: "12px",
        "slot-gap": "12px",
        card: "20px",
        panel: "28px",
        section: "48px",
        touch: "44px",
        sidebar: "320px",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        pop: "var(--ease-pop)",
        "in-out": "var(--ease-in-out)",
        drawer: "var(--ease-drawer)",
      },
      transitionDuration: {
        press: "80ms",
        release: "160ms",
        hover: "150ms",
        tab: "240ms",
        page: "220ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Page change: a fade and a 6px rise (no rise under reduced motion)
        "page-in": {
          from: { opacity: "0", transform: "translateY(var(--rise))" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        // Live presence: equaliser bars and the breathing dot
        equalizer: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        breathe: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
        // Legendary foil: a light band crossing the slot once
        foil: {
          from: { transform: "translateX(-120%) skewX(-18deg)" },
          to: { transform: "translateX(320%) skewX(-18deg)" },
        },
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        // The career path: the track draws down, each stop pops onto it
        "track-draw": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        "stop-pop": {
          from: { opacity: "0", transform: "scale(0.5)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s var(--ease-out)",
        "accordion-up": "accordion-up 0.2s var(--ease-out)",
        "page-in": "page-in var(--dur-page) var(--ease-out) both",
        "fade-in": "fade-in 150ms var(--ease-out) both",
        equalizer: "equalizer 0.9s var(--ease-in-out) infinite",
        breathe: "breathe 2.4s var(--ease-in-out) infinite",
        foil: "foil var(--dur-unlock) var(--ease-out) both",
        skeleton: "skeleton 1.6s var(--ease-in-out) infinite",
        "track-draw": "track-draw 160ms var(--ease-in-out) both",
        "stop-pop": "stop-pop 320ms var(--ease-pop) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
