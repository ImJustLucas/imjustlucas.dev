---
name: ImJustLucas
description: Lucas's personal site, a quiet zinc desk where the work and the live presence bring the colour.
colors:
  ink: "hsl(240 10% 3.9%)"
  graphite: "hsl(240 5.9% 10%)"
  smoke: "hsl(240 3.7% 15.9%)"
  pewter: "hsl(240 5% 64.9%)"
  silver: "hsl(240 4.9% 83.9%)"
  steel: "hsl(240 3.8% 46.1%)"
  haze: "hsl(240 5.9% 90%)"
  mist: "hsl(240 4.8% 95.9%)"
  chalk: "hsl(0 0% 98%)"
  paper: "hsl(0 0% 100%)"
  ember: "hsl(0 84.2% 60.2%)"
  ember-deep: "hsl(0 62.8% 30.6%)"
  wip-yellow: "#facc15"
  saved-green: "#16a34a"
typography:
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  subtitle:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.75rem"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  badge:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  shell: "12px"
  panel: "16px"
  card: "24px"
  section: "32px"
  sidebar: "320px"
components:
  button-primary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.smoke}"
    textColor: "{colors.chalk}"
  button-icon:
    rounded: "{rounded.md}"
    size: "36px"
  card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xl}"
    padding: "24px"
  content-panel:
    backgroundColor: "{colors.graphite}"
    rounded: "{rounded.lg}"
    padding: "16px 16px 32px"
  menu-item:
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  badge-wip:
    backgroundColor: "{colors.wip-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.md}"
    padding: "2px 10px"
  tech-badge:
    rounded: "{rounded.md}"
    padding: "4px 8px"
---

# Design System: ImJustLucas

## Overview

**Creative North Star: "The Dev's Desk"**

The site is a tidy personal workspace. The sidebar is the shelf: the `> ImJustLucas` wordmark, the menu, the live presence card, the social links and the theme and Locale switches. The inset content panel is the desk, set a few pixels in from the window edge, and the things Lucas has made are laid out on it as cards. The furniture is deliberately plain zinc (shadcn's "new-york" style on the zinc base colour) so that what sits on the desk gets the attention.

Colour belongs to the content, never to the chrome: Tech badges in each Tech's own colour, Project screenshots, Video thumbnails, Spotify artwork, the yellow WIP tag. The interface itself is near-monochrome in both themes, dark by default. Personality comes through in the copy (casual, lowercase menu labels, emojis) and through small tactile touches: soft corners, gentle hover lifts, a click sound and a press-scale on the menu, a chibi avatar resting in the bottom-right corner.

Density is relaxed and single-column on reading pages (the home page holds two-thirds of the panel's width), and becomes a wrapping grid of fixed-size cards on the Projects and Videos pages.

**Key Characteristics:**
- Two-zone shell: a 320px sidebar beside a rounded, inset content panel.
- Near-monochrome zinc chrome in both themes; colour comes only from content.
- Terminal-flavoured identity: the `> ` prompt before the wordmark.
- Soft and tactile: rounded cards, gentle shadows, hover lifts, menu click sound.
- Dark theme by default, light and system available.

## Colors

A cool, barely blue-tinted zinc scale that inverts between themes, plus three functional accents that never decorate.

### Primary
- **Chalk / Graphite, the inverted ink**: the "primary" role is not a hue, it is the strongest contrast available. In the dark theme it is Chalk (`chalk`) on Graphite text; in the light theme it is Graphite (`graphite`) with Chalk text. Used for the default button (Download my resume, Watch now!), the active menu dot, the Experience timeline dots, Video "New" badges and the song title in the presence card.

### Neutral
- **Ink** (`ink`): the dark theme's page background (the window frame around the panel) and card surface; the light theme's text colour.
- **Graphite** (`graphite`): the dark theme's content panel, one step lighter than Ink, so the desk reads as raised from the frame.
- **Smoke** (`smoke`): dark theme borders, dividers, ghost-button hover and muted fills.
- **Pewter** (`pewter`): dark theme secondary text (card descriptions, Periods, the presence artist line).
- **Silver** (`silver`): dark theme focus ring.
- **Paper** (`paper`): the light theme's page background and card surface.
- **Chalk** (`chalk`): the dark theme's text and the light theme's content panel.
- **Mist** (`mist`): light theme muted fills and ghost-button hover.
- **Haze** (`haze`): light theme borders and input strokes.
- **Steel** (`steel`): light theme secondary text.

### Functional accents
- **WIP Yellow** (`wip-yellow`): only the WIP badge on a Project card, always with Ink text.
- **Ember** (`ember`, light) / **Ember Deep** (`ember-deep`, dark): destructive buttons and field errors, in the Admin only.
- **Saved Green** (`saved-green`): the Admin's "Publié" notice, as text and a 40% border.

### Named Rules
**The Content Brings the Colour Rule.** Chrome stays zinc. A new hue enters a page only as content: a Tech's own `#rrggbb`, an image, a thumbnail, artwork. If you're reaching for a brand colour for a button or a heading, stop.

**The Inverted Ink Rule.** "Primary" means maximum contrast against the current theme, not a brand hue. Never hard-code a primary colour per theme; use the token so the inversion keeps working.

**The Readable Badge Rule.** A Tech badge's text colour is computed from its background's WCAG luminance (black above 0.5, white below), never chosen by hand.

## Typography

**Body Font:** Geist (with ui-sans-serif, system-ui, sans-serif)
**Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular)

**Character:** One neutral grotesque carries everything, weighted rather than sized into hierarchy, with tight tracking on headings. Geist Mono is loaded for code-flavoured details and pairs with the terminal prompt in the wordmark.

**Wiring.** Both faces are self-hosted variable fonts (`app/fonts`, weights 100 to 900) exposed as `--font-geist-sans` and `--font-geist-mono` on every root layout's `<body>`, mapped to Tailwind's `font-sans` and `font-mono`, and applied to `body` in `styles/globals.css`. Set the font on `body` or below, never on `html`, where the variables don't exist.

### Hierarchy
- **Headline** (600, 1.875rem / 30px, line-height 2.25rem, tracking -0.025em): the page title at the top of every page (`PageHeader`, e.g. "Who am i?", "What i've done ?").
- **Title** (600, 1.5rem / 24px, tracking -0.025em): the sidebar wordmark, section titles such as "Diplomas", Project card titles (bold, one line).
- **Subtitle** (600, 1.25rem / 20px, tracking -0.025em): sub-sections on reading pages ("Creative Mindset", "FAQ") and each Experience's company and role.
- **Body** (400, 1rem / 16px, line-height 1.75rem): paragraphs; consecutive paragraphs are spaced 24px apart. Reading pages cap the column at two-thirds of the panel, the FAQ at 42rem.
- **Label** (500, 0.875rem / 14px): buttons, menu items, small text, muted descriptions, Tech badges.
- **Badge** (600, 0.75rem / 12px): WIP and "New" badges.

### Named Rules
**The Typography Primitives Rule.** Text goes through the primitives in `components/typography` (`TypographyH2/H3/H4`, `TypographyP`, `TypographySmall`, `TypographyMuted`, `Bold`), restyled through `className` only. A raw `<h2>` with its own sizes is a drift.

## Layout

The shell fills the viewport (`100dvh`, no page scroll) with 12px padding and a 12px gap between its two zones. Only the content panel scrolls.

- **Sidebar** (320px wide from 768px up): wordmark, then the menu 32px below, then the footer pushed to the bottom (presence card, a bordered row of icon buttons, the "Made with 💖" line).
- **Content panel**: fills the rest, 8px corners, 16px padding with 32px at the bottom, a one-step-lighter surface than the frame.
- **Reading pages** (home, contact): a single column at two-thirds of the panel width on desktop, full width on mobile. Blocks are separated by 32px.
- **Card pages** (Projects, Videos): cards of at most 384px wrap in a row with 16px gaps. Project cards are a fixed 500px tall with a 192px image band, so rows stay aligned.
- **Mobile** (below 768px): the sidebar is hidden behind a ghost menu button fixed top-right. Opened, it covers the screen as an 80% background overlay with a small backdrop blur, and the content panel behind it blurs too. The same sidebar is restyled, not remounted.
- A 32px chibi avatar sits fixed 20px from the bottom-right corner on every page.

## Elevation & Depth

Depth comes mostly from tonal layering: Ink frame, Graphite panel, Ink cards on the panel in the dark theme (Paper, Chalk, Paper in light). Shadows are small and ambient on top of that, and grow only as a response to hover.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): every card and the default button.
- **Subtle** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): outline and secondary buttons.
- **Lifted** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): a Project card on hover, over 300ms.

### Named Rules
**The Lift on Touch Rule.** Surfaces rest nearly flat; they lift only when the visitor points at them. No large shadow is ever static.

**The Blur Means Elsewhere Rule.** Backdrop blur is reserved for "you're looking at something on top": the mobile menu overlay, the content panel behind it, and the footer bar over a Project card's scrolling text.

## Shapes

Soft, consistent corners built from one radius variable (`--radius`, 8px): 8px for the content panel, 6px for buttons, badges, menu items and artwork, 12px for cards, and full circles for the active-menu dot, timeline dots and the Spotify mark. Borders are 1px hairlines in the theme's border tone; there are no thick strokes or outlined decorations. Images are cropped into their shapes (`object-cover`, Project screenshots anchored to the top).

## Components

### Buttons
Familiar shadcn buttons, softened by the shared radius.
- **Shape:** gently rounded (6px), 36px tall, 14px medium label, icons at 16px with an 8px gap.
- **Primary:** inverted ink with the resting shadow; hover drops to 90% opacity.
- **Outline:** hairline border on the page background with the subtle shadow, 32px small size for card footers (the GitHub button with its star count).
- **Ghost:** no fill at rest; hover fills with Smoke (dark) or Mist (light). Used for the social, Locale and theme icon buttons (36px square) and the mobile menu toggle.
- **Focus:** a 1px ring in the theme's ring colour on keyboard focus.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** the theme's card surface (Ink or Paper), so cards sit darker or whiter than the panel.
- **Shadow Strategy:** Resting, lifting to Lifted on hover for Project cards (see Elevation).
- **Border:** 1px hairline.
- **Internal Padding:** 24px (header, content and footer), 16px in compact cards (presence, Video footer).

### Badges
- **Tech badge:** the Tech's own colour as background, computed black or white text, 14px semibold, 4px by 8px padding. The one rendering of a Tech anywhere.
- **WIP badge:** WIP Yellow with Ink text, 12px semibold, beside a Project's Period.
- **New badge:** inverted ink, pinned 8px from the top-right corner of a Video thumbnail.

### Navigation
The sidebar menu is the signature control.
- **Style:** full-width ghost buttons, 8px apart, left-aligned lowercase labels from the message dictionaries.
- **Hover / focus:** the label takes the primary colour on a 10% primary fill (20% on focus), over 200ms.
- **Active:** the same 10% fill, medium weight, and an 8px primary dot on the right.
- **Press:** scales to 95% and plays `/sounds/click.mp3`.
- **Mobile:** the same menu inside the full-screen overlay; choosing a Route closes it.

### Presence card (signature)
A compact card in the sidebar footer, shown only while Lucas is playing or listening. Artwork at 48px with 6px corners, a 20px circular badge (the Spotify mark) overlapping its bottom-right corner with a 2px background-coloured ring, then the title in the primary colour and a muted second line. When nothing is live, it is not rendered at all.

### Project card (signature)
A fixed 384 by 500px card: a 192px image band (or a muted panel with a folder icon when there is no image), the title on one line, the Period with an optional WIP badge, a three-line description, the Tech badges, and a blurred footer bar holding the GitHub button (with its live star count) and an external-link icon button.

### Experience timeline
Inside one card: a 12px primary dot per Experience joined by a 2px border-coloured line, beside the Period, "company - role", the contract type and a muted description.

### FAQ accordion
Hairline-divided rows; the trigger is the question, the answer reveals in muted text with a 200ms ease-out height animation.

### Admin forms
The Admin reuses the same primitives on a plain full-page background (24px padding, no sidebar): labelled fields, destructive buttons and Ember error text, and a sticky Saved Green notice capped at 56rem.

## Do's and Don'ts

### Do:
- **Do** keep the chrome in the zinc tokens and let content (Tech colours, images, artwork) supply every hue.
- **Do** render text through the typography primitives and Techs only through `TechBadge`.
- **Do** build on the shared radius: 6px for controls, 12px for cards, 8px for the panel.
- **Do** keep shadows small at rest and let hover lift them, over 200 to 300ms.
- **Do** design every new surface for both themes, dark first.

### Don't:
- **Don't** introduce a brand accent colour for buttons, links or headings; primary is the inverted ink.
- **Don't** hand-pick a Tech badge's text colour; it is computed from luminance.
- **Don't** add static large shadows or decorative borders.
- **Don't** add a second scroll container to the shell; the content panel is the only one.
- **Don't** treat the MasterDevFrance 2025 page's blue-to-purple gradient frame as part of the system; it is that celebration page's one-off.
