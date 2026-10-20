---
name: ImJustLucas
description: Lucas's personal site as his player profile, a cosy game client in navy and electric blue (or plum and tangerine) where his work, wins and live presence are the stats.
colors:
  navy-frame: "#05081c"
  navy: "#0a0f2e"
  navy-raised: "#141c48"
  navy-seam: "#2a3a7a"
  off-white: "#f6f3ea"
  navy-haze: "#aab6e6"
  linen-frame: "#e8e4d9"
  paper: "#fffdf8"
  linen-seam: "#dcd6c6"
  ink-charcoal: "#10131f"
  slate: "#545a6e"
  electric: "#2f6bff"
  electric-glow: "#6f97ff"
  electric-deep: "#1a4fe8"
  electric-ledge: "#0d2fa6"
  night: "#1c0f2b"
  plum: "#2a1540"
  velvet: "#3b2159"
  seam: "#5a3a80"
  cream: "#fff1e6"
  haze: "#c9b6e4"
  lilac-frame: "#e9ddfa"
  lilac-wash: "#f6f0ff"
  sheet: "#ffffff"
  seam-light: "#d6c3f0"
  dusk: "#5b4a73"
  tangerine: "#ff8a3d"
  tangerine-ledge: "#c25a12"
  tangerine-deep: "#b8470c"
  legendary-ledge: "#8a6200"
  common: "#b9a9cc"
  common-deep: "#6b5a80"
  rare: "#46c2ff"
  rare-deep: "#0b6fa8"
  epic: "#b47cff"
  epic-deep: "#7a3fd1"
  legendary: "#ffd84d"
  legendary-deep: "#8a6200"
  online: "#5fe08a"
  online-deep: "#1d7a45"
  away: "#ffb02e"
  busy: "#ff5d73"
  busy-deep: "#c0233d"
typography:
  display:
    fontFamily: "Unbounded, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.2vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Unbounded, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title-large:
    fontFamily: "Unbounded, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Unbounded, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  button-play:
    fontFamily: "Unbounded, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  tag:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.02em"
  data:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: "1.25rem"
    fontFeature: "\"tnum\""
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  frame: "12px"
  slot-gap: "12px"
  card: "20px"
  panel: "28px"
  section: "48px"
  touch: "44px"
  sidebar: "320px"
components:
  button-play:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.navy}"
    typography: "{typography.button-play}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-ledge:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-icon:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.md}"
    size: "44px"
  sound-switch-on:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    size: "44px"
  sound-switch-off:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.md}"
    size: "44px"
  tab:
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  tab-active:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  content-panel:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.xl}"
    padding: "{spacing.panel}"
  sidebar:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.xl}"
    padding: "16px"
    width: "{spacing.sidebar}"
  mobile-top-bar:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.xl}"
    height: "56px"
  player-card:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "16px"
  banner:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "28px"
  slot:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  item-card:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  achievement-slot:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  presence-card:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "12px"
    height: "76px"
  accordion-row:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  team-chip:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px 0 10px"
    height: "40px"
  theme-menu:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px"
  theme-menu-item:
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  rarity-tag:
    textColor: "{colors.navy}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  tech-chip:
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  live-tag:
    backgroundColor: "{colors.online}"
    textColor: "{colors.navy}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: ImJustLucas

## Overview

**Creative North Star: "The Player Profile"**

The site is Lucas's player profile in a cosy game client. The sidebar is the client chrome: the player card with the chibi head in its live status ring, the tabs (the lowercase menu), the friends panel where his Discord presence lives, the settings row (sound, Locale, theme) and the socials. The content panel is the profile screen: on the home page a banner with who he is and the team he plays for right now, a showcase of real achievements with MasterDevFrance 2025 as the legendary one, an inventory of featured Projects framed by rarity, an about slot beside his hobbies, the FAQ, and a goodbye. Every stat on screen is a real fact from `content/` or a live source; the game is the frame, never the claim.

It is a cosy client, not a competitive one: a deep navy night (or, in the second palette, deep plum), soft fat corners, chunky buttons that sink onto a ledge when pressed, warm off-white text, candy rarity colours, and a single action colour that means "this is the thing to press": off-white standing on an electric-blue ledge at night, electric blue by day, tangerine in the plum palette. Pressable things answer with one note of a single instrument, so moving around the site plays a little melody, and one visible switch silences it all.

Density is relaxed: big slots with generous gaps, one focal object per row. The voice stays as PRODUCT.md binds it (first person, "Yoooo", emojis, lowercase menu labels). Anti-references: the previous "Dev's Desk" zinc shell (colour only through content, no accent), terminal or IDE costumes, near-black with a glowing neon accent (electric blue is a solid ledge and an underline here, never a glow), hextech gold trim (gold belongs to the legendary rarity alone), and esports HUD aggression (angular chamfers, scanlines, rank emblems).

**Key Characteristics:**
- Two-zone client inside a 12px frame: a 320px sidebar beside a rounded profile panel, both on the palette's ground, the panel the only part that scrolls.
- Four palettes, each with a dark and a light mode, all through the same role tokens: "electric" (the default; navy night in dark, off-white daytime in light), "plum" (the plum and tangerine client), "khaki" (olive and chocolate) and "sakura" (burgundy night and cherry blossom). Dark is the default mode.
- One action colour for the Play button, the active tab, the sound switch when on and selection; its ink colour draws focus.
- Rarity colours (common, rare, epic, legendary) frame content by its rarity field, never decoration.
- Chunky pressable controls on a solid ledge; raised slots and cards with soft 16px corners and a moulded-tray highlight.
- A one-instrument kalimba kit in D major pentatonic, on by default, behind an always-visible switch.
- The chibi is the mascot: stepped-frame poses on the banner, in the hobbies, the presence card and the goodbye.

## Colors

A committed world in four palettes: the shell is the colour, with one action colour and a four-step rarity ramp that labels content. Every colour a component uses is a role token (frame, ground, raised, seam, ledge, ink, ink-muted, action, action-ledge, action-ink, on-action, on-bright, and the `-ink` variant of each rarity and status colour) that changes with the palette and the mode. The shadcn roles (background, card, primary, border, ring, destructive…) are mapped onto them, so every page and the Admin inherit the world without restyling. The palette is the `data-palette` attribute on `<html>` (absent for electric, `plum` for plum); the mode is next-themes' `dark` class.

### Roles across palettes

| Role | Electric dark (default) | Electric light | Plum dark | Plum light |
|---|---|---|---|---|
| frame | Navy Frame | Linen Frame | Night | Lilac Frame |
| ground | Navy | Off-white | Plum | Lilac Wash |
| raised | Navy Raised | Paper | Velvet | Sheet |
| seam | Navy Seam | Linen Seam | Seam | Seam Light |
| ledge | Navy Frame | Linen Seam | Night | Seam Light |
| ink | Off-white | Ink Charcoal | Cream | Plum |
| ink-muted | Navy Haze | Slate | Haze | Dusk |
| action | Off-white | Electric Deep | Tangerine | Tangerine |
| action-ledge | Electric | Electric Ledge | Tangerine Ledge | Tangerine Ledge |
| action-ink | Electric Glow | Electric Deep | Tangerine | Tangerine Deep |
| on-action | Navy | Off-white | Night | Night |
| on-bright | Navy | Navy | Night | Night |
| link-line | Electric | Electric Deep | Haze | Tangerine Deep |

### More palettes (khaki, sakura)
Two more palettes on the same roles, chosen by Lucas on 2026-10-20 and selected the same way (`data-palette="khaki"`, `data-palette="sakura"`). Their values live only in `styles/globals.css`; every text pair below is 4.5:1 or more.

| Role | Khaki dark | Khaki light | Sakura dark | Sakura light |
|---|---|---|---|---|
| frame | #1a140f espresso | #ddd5c0 | #170d11 | #efdde1 |
| ground | #262a1c olive night | #ece6d6 linen | #241519 burgundy night | #f8ecee blossom |
| raised | #333826 | #f7f3e8 | #331d24 | #fffafb |
| seam | #4b5236 | #d3cab2 | #4f2e39 | #ebd2d8 |
| ink / ink-muted | #f1ead8 / #c4bfa3 | #2b2618 / #5f5a45 | #fbeef1 / #d9b3bf | #2d1b22 / #6b4c56 |
| action | #e3d9b8 bone | #5e6b3a olive | #ffb3c7 sakura | #c8325a cherry |
| action-ledge | #6b4429 chocolate | #4a3222 dark chocolate | #c8325a cherry | #8a1f3c |
| action-ink, link-line | #d6b37e caramel | #4f5c2c | #ff8fae | #b0284e |
| on-action / on-bright | #262a1c / #1a140f | #f7f3e8 / #2b2618 | #241519 / #241519 | #ffffff / #2d1b22 |

Adding a palette is two blocks of these roles in `styles/globals.css` (light, then `.dark`), its name in `PALETTES` and its swatch in `PALETTE_SWATCH` (`lib/palette.ts`), and its name under `ThemeSwitch` in both dictionaries.

### Primary (the action)
The action is the one thing to press. It is a role, not a hue: its fill, the ledge under it, its colour as text and focus (`action-ink`), and the text on it (`on-action`).
- **Off-white** (#f6f3ea): the action fill in electric dark, with Navy text, standing on an **Electric** (#2f6bff) ledge. Electric is also the underline of a secondary link in electric dark.
- **Electric Glow** (#6f97ff): the action ink in electric dark: the focus ring, the caret, the menu check and a link's hover colour.
- **Electric Deep** (#1a4fe8): the action fill in electric light, with Off-white text, and its ink (focus, link text, the menu check). **Electric Ledge** (#0d2fa6) is its ledge.
- **Tangerine** (#ff8a3d): the action fill in plum, with Night text, on **Tangerine Ledge** (#c25a12); Tangerine is the action ink in plum dark, **Tangerine Deep** (#b8470c) in plum light.

### Rarity (functional)
Rarity says what kind of thing an item is, set per item in the Admin. It is never a quality score and never invented. Rarity and status colours are the same in both palettes.
- **Legendary** (#ffd84d, deep #8a6200): national-level wins. Today only MasterDevFrance 2025. **Legendary Ledge** (#8a6200) is the ledge under the legendary achievement slot.
- **Epic** (#b47cff, deep #7a3fd1): products Lucas founded or co-founded and runs in production.
- **Rare** (#46c2ff, deep #0b6fa8): shipped products and real client or employer work.
- **Common** (#b9a9cc, deep #6b5a80): side projects, boilerplates, experiments. Its frame is drawn at 70% opacity (Common in dark, Common Deep in light) so it reads as the quiet tier.

### Status (functional)
Discord's presence vocabulary, used for the status ring, the presence dots and the live tag.
- **Online** (#5fe08a, deep #1d7a45): online ring, the breathing dot, the equaliser bars, the live tag fill.
- **Away** (#ffb02e): idle ring and dot. **Busy** (#ff5d73, deep #c0233d): do-not-disturb ring and dot. Offline uses **Common** (its label in Common's ink); connecting uses the seam colour.
- **Busy Deep** in light and **Busy** in dark are also the destructive and error colour.

### Neutral, electric (the default palette)
- **Navy Frame** (#05081c): the window frame around sidebar and panel in dark, carrying the sparkles, and the ledge under raised and ground controls.
- **Navy** (#0a0f2e): the dark ground: sidebar, content panel, mobile top bar, outline buttons, team chips, the chibi's stage disc. It is also `on-bright` in both electric modes, the text on every bright fill (rarity and live tags, the Spotify disc, destructive in dark), and the text on the off-white action.
- **Navy Raised** (#141c48): dark raised surfaces: player card, banner, slots, item cards, accordion rows, presence card, ledge and icon buttons, the theme menu.
- **Navy Seam** (#2a3a7a): dark 2px borders, the tab hover fill (at 70%), menu item focus, skeletons, scrollbar thumb.
- **Off-white** (#f6f3ea): dark primary text and the light ground.
- **Navy Haze** (#aab6e6): dark secondary text: role lines, periods, descriptions, artist lines, section labels.
- **Linen Frame** (#e8e4d9): the light window frame. No text sits directly on it.
- **Paper** (#fffdf8): light raised surfaces.
- **Linen Seam** (#dcd6c6): light borders, dividers, and the ledge under Paper controls.
- **Ink Charcoal** (#10131f): light primary text. **Slate** (#545a6e): light secondary text.

### Neutral, plum (the second palette)
- **Night** (#1c0f2b): the dark frame and the ledge under Velvet and Plum controls; `on-action` and `on-bright` in both plum modes.
- **Plum** (#2a1540): the dark ground, and primary text in plum light.
- **Velvet** (#3b2159): dark raised surfaces. **Seam** (#5a3a80): dark borders and hover fills.
- **Cream** (#fff1e6): dark primary text. **Haze** (#c9b6e4): dark secondary text.
- **Lilac Frame** (#e9ddfa), **Lilac Wash** (#f6f0ff), **Sheet** (#ffffff), **Seam Light** (#d6c3f0) and **Dusk** (#5b4a73): the light frame, ground, raised surface, seam and ledge, and secondary text.

In light mode, in either palette, bright rarity and status colours stay as fills, bands and 2px frames with `on-bright` text; as text or a thin line on a light surface they switch to their deep variant.

### Named Rules
**The Palette Owns the Shell Rule.** The frame, sidebar and panel are the palette's own frame, ground and raised colours (Navy Frame, Navy and Navy Raised in electric dark; Night, Plum and Velvet in plum dark), always through the role tokens. Never fall back to a neutral grey surface with colourful accents; the colour is the room, not the furniture.

**The One Action Rule.** An action fill marks the single most important action or state in its zone: the Play button in the panel, the active tab and the sound switch in the chrome, plus selection; the action ink draws focus. A second action-filled button in the panel means one of them is wrong. A component never names Tangerine, Electric or Off-white directly for this role; it uses `action`, `action-ledge`, `action-ink` and `on-action`, so both palettes follow. Secondary links use the action ink as their text in light; in electric dark they stay ink with an Electric underline and take the action ink on hover.

**The Rarity Is Data Rule.** A rarity colour appears only on an item whose rarity field says so, as its 2px frame, 4px top band and tag (and the filled sparkle on legendary). Never use the rarity hues for headings, backgrounds or decoration.

**The Computed Ink Rule.** Text on a colour that is not part of the palette (a Tech's own colour) is whichever of Night or Cream contrasts more, computed; if neither reaches 4.5:1, the chip is drawn as a 2px outline in that colour with the theme's ink instead of a fill.

## Typography

**Display Font:** Unbounded (with Geist, ui-sans-serif, system-ui)
**Body Font:** Geist (with ui-sans-serif, system-ui)
**Data Font:** Geist Mono (with ui-monospace, SFMono-Regular)

**Character:** Unbounded is the game title: wide, round-shouldered and heavy, friendly at 600 and 700 and never aggressive. Geist does the reading and the controls, so menus and paragraphs stay plain and fast. Geist Mono with tabular figures sets the stats: dates, periods, star counts, elapsed time, the Locale code.

All three fonts are CSS variables (`--font-display`, `--font-geist-sans`, `--font-geist-mono`) set on `<body>` by every root layout (the Locale segment and the Admin); Unbounded loads Latin and Latin Extended for French.

### Hierarchy
- **Display** (Unbounded 700, clamp(2.25rem, 1.6rem + 2.2vw, 3.5rem), 1.05, -0.02em): the banner greeting, the home page's `h1`. Drops to 1.875rem below 640px so "Yoooo, I'm Lucas!" fits beside the 120px chibi. One per page at most.
- **Headline** (Unbounded 700, 1.75rem, 1.15, -0.015em): page titles on the other pages, one visible `h1` each.
- **Title Large** (Unbounded 600, 1.375rem): the player name, achievement names, `h3` in long-form content.
- **Title** (Unbounded 600, 1.125rem, 1.3): section titles (achievements, inventory, about me, FAQ), item names, the mobile top bar name, the goodbye line.
- **Button Play** (Unbounded 700, 1.0625rem): the Play button's label only.
- **Body** (Geist 400, 1rem, 1.65): paragraphs, capped at 65ch (the FAQ column at 72ch). The banner role line is Body at weight 500 in the muted ink, 1.0625rem, rising to 1.25rem from 768px.
- **Label** (Geist 500, 0.875rem): tabs, buttons, chips, presence lines, small section labels ("current team", "friends").
- **Tag** (Geist 600, 0.75rem, +0.02em): rarity tags, live and WIP tags, Tech chips, the theme menu's section labels.
- **Data** (Geist Mono 500, 0.8125rem, tabular figures): periods, dates, star counts, elapsed time (m:ss), the resume date, the Locale code.

### Named Rules
**The Copy Keeps Its Case Rule.** Type is set in the case the copy is written in. Unbounded is never forced to uppercase; the lowercase menu labels and casual voice are binding. The one uppercase string is the two-letter Locale code, in Data.

**The Typography Primitives Rule.** Text goes through `components/typography` (Display, Headline, Title, Data, Tag, P, Muted), with the element chosen by `as` so the look never dictates the outline. A raw heading with its own sizes is drift.

## Layout

The client fills the viewport (`100dvh`, no page scroll) inside a 12px frame in the frame colour, with 12px gutters; only the content panel scrolls.

- **Sidebar** (320px from 768px up, the ground colour, 24px corners, 16px padding, 24px between groups), top to bottom: the player card, the six tabs (44px rows, 4px apart), the friends panel, then the settings row (sound, Locale, theme) and the social row pushed to the bottom.
- **Content panel**: the remaining width, 24px corners, 28px padding (16px below 768px), the ground colour. Page content is centred at a 1180px maximum width, with 48px between sections and 16px between a section title and its row.
- **Rows** are plain CSS grids with 12px gaps, not a 12-column system: featured Projects run 1, 2 (768px) then 3 (1280px) columns; the about row splits 1:1 from 1024px; two or three achievements sit 2fr / 1fr / 1fr with the rarest first, while a single one takes the full row as a wide slot.
- **Banner**: from 768px a two-column grid, the chibi (200 to 260px) on the left spanning greeting, role, current team and actions, with a minimum height of 340px; below 768px the chibi shrinks to 120px beside the greeting and the role, team and actions run full width, the Play button full width below 640px.
- **Reading text** holds 65ch inside its slot, never the full panel width.
- **Mobile** (below 768px): a 56px top bar on the ground colour (40px chibi head, name, sound switch, menu button) replaces the sidebar column. The same sidebar, mounted once, becomes a full-width sheet from 68px down, sliding up with Ease Drawer (260ms in, 180ms out), with the player card hidden and the panel `inert` behind it. Escape or widening to 768px closes it. Achievements with more than one slot become a horizontal snap row.
- **Breakpoints** are Tailwind's: 640, 768 (the client's one structural switch), 1024, 1280.

## Elevation & Depth

Depth is tonal first (frame, then ground, then raised: Navy Frame, Navy, Navy Raised by default; Linen Frame, Off-white, Paper in electric light; Night, Plum, Velvet and Lilac Frame, Lilac Wash, Sheet in plum) and tactile second: pressable controls stand on a solid ledge like console buttons, and slots carry a one-pixel top highlight like a moulded tray. A soft blurred shadow exists only for layers that float above the client.

### Shadow Vocabulary
- **Ledge** (`box-shadow: 0 4px 0 rgb(var(--ledge))`): every pressable control at rest. The ledge is the frame colour under raised and ground controls in dark (Navy Frame, Night), the seam colour under them in light (Linen Seam, Seam Light), the action ledge under action controls (Electric, Electric Ledge, Tangerine Ledge), and Legendary Ledge under the legendary slot.
- **Ledge Raised** (`0 6px 0` with `translateY(-2px)`): hover, on hover-capable pointers only.
- **Ledge Pressed** (`0 0 0` with `translateY(4px)` and `brightness(0.94)`): active; the control sits on its ledge.
- **Tab Ledge** (`0 3px 0 rgb(var(--action-ledge))`): under the sliding active-tab fill, which travels with it.
- **Tray** (`inset 0 1px 0 rgb(246 243 234 / 0.07)` in electric dark, `inset 0 1px 0 rgb(255 241 230 / 0.08)` in plum dark, `inset 0 1px 0 rgb(255 255 255 / 0.9)` in both light modes): the top highlight inside the player card, banner, slots, item cards, accordion rows and presence card.
- **Float** (`0 24px 48px -12px rgb(2 4 16 / 0.6)` in electric dark, `rgb(16 19 31 / 0.22)` in electric light, `rgb(12 4 22 / 0.6)` in plum dark, `rgb(42 21 64 / 0.28)` in plum light): the mobile sheet and menus.

### Named Rules
**The Real Button Rule.** Anything pressable has a ledge and sinks onto it when pressed; anything with a ledge is pressable. Static cards and slots never get one. Ghost and link controls are not raised controls and have none.

**The Float Means On Top Rule.** Blurred shadows belong only to layers above the client (the mobile sheet, menus).

## Shapes

Fat, friendly corners from one scale: 24px for the frame's two zones (sidebar, panel, mobile top bar and sheet), 16px for slots, cards, the banner, accordion rows and menus, 10px for buttons, tabs, artwork and screenshots, full circles for the chibi head, the chibi's stage discs, status dots, palette swatches and all chips and tags. Borders are 2px, never hairlines: the seam colour on the banner, outline buttons, team chips, WIP tags and menus; the rarity colour on items. Plain slots (player card, about, hobbies, presence, accordion) are borderless raised surfaces with the tray highlight. Focus is a 2px ring in the action ink with a 2px offset (inset on accordion rows). No angular chamfers, notched corners or clip-path frames.

Materials:
- **The sparkle**: Lucas's hand tattoo, an outlined four-point star with slightly concave sides, the site's one ornament. On the frame it is drawn whole and small (8px and 6px stars, outlined) running along the 12px gutters only, including the gutter between sidebar and panel, at stroke opacity 0.12 in the dark ink on the dark frame (Off-white on Navy Frame, Cream on Night) and 0.08 in the light ink on the light frame (Ink Charcoal on Linen Frame, Plum on Lilac Frame); it is never clipped and never behind text. Filled in Legendary, it marks legendary achievements in their top-right corner.
- **Legendary foil**: a pale gold light band sweeps across a legendary slot over 900ms with Ease Out, once per session when it first scrolls into view, again on hover and on click; at rest the slot is flat.
- **Chibi art**: the ImJustLucas chibi as transparent square WebP poses (`public/images/chibi/`, registry `lib/chibi.ts`): banner, chilling, sleeping, goodbye, trophy, and the hobbies surf, skate, LoL, coding, coffee, series, music. Every pose keeps the commissioned style, face, hair and eyes, and wears its own outfit (`docs/design/chibi-poses.md`). A pose may have a night outfit, worn by Lucas's time in Paris (`Europe/Paris`, 21:00 to 07:00), never the visitor's clock, mode or palette: the banner (whose night art does not exist yet, so it wears the day one) and the LoL pose in the friends panel; the hobby tiles always show the day LoL pose. Pages render the day art and switch after mount with a 300ms crossfade, with no layout shift. The full-body chibi stands in front of a circular ground-coloured stage disc.

## Components

Every control is drawn in the client's vocabulary; shadcn and Radix stay as the behaviour layer. Values below name the electric dark default; every colour is a role, so the other palette and mode follow (see Roles across palettes).

### Buttons
- **Shape:** 10px corners, Label type, 16px icons, a 2px action-ink focus ring with a 2px offset.
- **Play** (primary): the action fill (Off-white), `on-action` label (Navy) in Unbounded 700, 52px tall with 24px side padding, on the action ledge (Electric); plays the confirm chord. One per screen (on home, "Download my resume", with its date in Data beside it).
- **Ledge** (default): raised fill (Navy Raised), ink label, 44px tall, 16px padding; hover also tints the seam colour at 40%.
- **Outline:** ground fill (Navy), 2px seam border, on a ledge: the secondary button wherever it sits on a raised surface, so it stays distinct from its background (LinkedIn on the banner, GitHub with its live star count and the external link on item cards).
- **Icon:** 44px square ledge buttons (sound, Locale, theme, socials, menu) with screen-reader labels.
- **Ghost / Link:** no ledge; ghost tints the seam colour on hover, link is the action ink and underlined.
- **Destructive:** Busy Deep fill with Cream text in light, Busy with `on-bright` text in dark, on a ledge.
- **States:** hover raises 2px onto a 6px ledge (fine pointers only); press sinks 4px in 80ms and releases in 160ms with Ease Pop; disabled drops the ledge to 50% opacity.

### Tabs (the menu)
- **Style:** full-width 44px rows, Label type, a lowercase label from the dictionaries and an 18px line icon on the left.
- **Hover:** the seam colour at 70% and the tick. **Active:** the action fill slides to the tab on its 3px action ledge (240ms, Ease In Out), `on-action` text, `aria-current="page"`. Each tab plays its own note, so walking down the menu plays a rising scale.
- **Mobile:** the same tabs in the sheet; choosing one plays its note and closes the sheet.

### Player card (signature)
A raised slot at the top of the sidebar: the 64px chibi head in a 3px status ring coloured by Lucas's live Discord status (the seam colour while connecting), "ImJustLucas" in Title Large, and one muted Label line with role and city. No level, rank or XP.

### Friends panel / presence (signature)
A muted Label heading with a live tag (Online fill, `on-bright` text) while Lucas is online, and a presence card of a fixed 76px height so the sidebar never jumps. **Playing:** 48px game art with a small badge, the game name, then a breathing Online dot, the elapsed time in Data (m:ss) and the detail line; on the right, the 56px LoL pose in his day or night outfit by Paris time. **Listening:** 48px album art with the Spotify mark on an `on-bright` disc, the title, then three small Online equaliser bars and the artist; on the right, the 56px music pose stepping through its two drawn frames while he listens. **Online, away, busy:** the 44px chibi head in its ring, a status dot and label, and a playful line. **Offline:** the sleeping pose and "offline" in Common's ink. **Connecting:** a seam-coloured skeleton of the same size; if Lanyard is unreachable after 10 seconds the card shows offline. Long names truncate to one line with the full text as a native tooltip. Presence never plays a sound.

### Banner (signature)
A raised slot with a 2px seam border and the tray: the full-body chibi on its stage disc (a button: booping swaps to another pose with the boop cue; hover plays its drawn frames), the Display greeting, the role line, "current team" with one team chip per ongoing Experience (or the chilling pose and line when there is none), and the actions: Play with the resume date, then the outline LinkedIn button.

### Team chip
40px tall, full radius, ground fill with a 2px seam border, the Experience's emoji then the company in Label; the role is read to assistive tech only.

### Item card (Projects)
Raised card, 16px corners, 2px frame and 4px top band in the item's rarity colour, the tray. A 16:9 screenshot (10px corners, top-anchored crop, a placeholder icon and label when missing), the name in Title with the rarity tag beside it, the period in Data with a WIP tag, three lines of description in the muted ink, the Tech loadout as chips, and a footer of outline buttons. Padding 16px, 20px from 640px. Hovering plays the tick; heights follow content within an aligned grid.

### Achievement slot (signature)
A link slot: rarity frame and top band, the achievement art in a circular stage (128px in the wide slot), the rarity tag and year in Data, the name in Title Large, a description in the muted ink and an arrow that nudges 4px on hover. The legendary slot also stands on the Legendary Ledge, carries the filled sparkle and the foil, and plays the unlock (arpeggio, then the coin) on click, holding navigation for about half a second so it is heard.

### Chips and tags
- **Rarity tag:** rarity fill, `on-bright` text (Navy in electric, Night in plum), Tag type, full radius, 2px by 8px.
- **Tech chip:** the Tech's own colour as fill and 2px border with computed ink, or an outline (see The Computed Ink Rule); Tag type, full radius, 2px by 10px.
- **Live tag:** Online fill, `on-bright` text. **WIP tag:** 2px seam outline, ink text.

### Accordion (FAQ)
Raised rows with 16px corners, the tray and 12px gaps instead of dividers; the trigger is at least 56px tall with 20px side padding and a seam hover tint; the chevron turns over 200ms with Ease In Out; the answer is muted body text at 65ch; opening and closing play the toggle notes.

### Theme menu
The theme switch is a 44px icon button (a sun in light, a moon in dark) that opens a raised menu (16px corners, 2px seam border, Float, 6px inner padding) in two sections, each headed by a lowercase Tag label in the muted ink and parted by a 2px seam rule: **mode** (dark, light, system), set by next-themes, and **palette** (electric blue, plum), each with a 14px solid swatch in its signature colour (Electric; Tangerine), so it reads the same in every mode and never looks like a radio button. Items are 40px rows in Label, lowercase in both Locales, the seam colour on focus, an action-ink check on the current choice; choosing one plays the toggle-on note. The palette is stored per visitor in `localStorage` (`imjustlucas.palette`) and applied before the first paint by a script in the `<head>` of both root layouts, so a plum visitor never sees electric flash; the Admin follows the palette.

### Chibi sprites
A pose's drawn frames alternate in steps (200ms each), never tweened, only while it plays (hover, a live state), on screen and without reduced motion; otherwise the first frame shows. The chibi itself never hops, slides or scales.

### Sound kit and switch
One synthesized instrument (a soft plucked kalimba tine) in D major pentatonic, master gain 0.22.
- **Tick** (B5, very quiet): hover on tabs, item cards, achievement slots and hobbies; fine pointers only, at most one every 60ms.
- **Press** (A4): secondary controls without a cue of their own (ledge and outline buttons, socials, the theme trigger, non-legendary achievements).
- **Tab:** the tab's own degree (D4, E4, F#4, A4, B4, D5 in menu order).
- **Confirm** (D4 and A4, then D5): the Play button.
- **Toggle on / off** (A4 to D5 / D5 to A4): the menu sheet, the accordion, choosing a mode or a palette, the Locale switch, the sound switch turning on.
- **Unlock** (D4 F#4 A4 D5, then the recorded coin): the legendary achievement.
- **Boop** (a random high degree with a 2-semitone upward bend): the banner chibi.
- **Miss** (A3 to F#3): defined in the kit for errors.
The **sound switch** is a 44px icon button, the action fill with an `on-action` speaker on the action ledge when on, raised with a struck speaker when off, with a localized label that also says when reduced motion turned sound off. It shows once in the settings row from 768px up and once in the mobile top bar below. Sound is on by default, off by default under reduced motion, stored per visitor in `localStorage`, and never plays before the first interaction or on automatic events.

### Motion
- **Ease Out** (`cubic-bezier(0.23, 1, 0.32, 1)`): hovers, entrances, page changes, the foil.
- **Ease Pop** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): the press release only, a deliberate small overshoot.
- **Ease In Out** (`cubic-bezier(0.77, 0, 0.175, 1)`): the tab fill, the accordion chevron, ambient loops.
- **Ease Drawer** (`cubic-bezier(0.32, 0.72, 0, 1)`): the mobile sheet.
- **Page change:** a 220ms fade with a 6px rise. **Reduced motion:** press, raise and rise distances become zero (presses change colour only), the sheet fades, the equaliser, breathing dot, skeleton and foil are static, and chibi sprites hold their first frame.

### Admin
The Admin sets the same fonts, modes (dark by default) and the visitor's palette, and inherits the world through the shadcn roles mapped in the stylesheet: the palette's ground and raised surfaces, seam borders, the ledge buttons, Busy or Busy Deep for errors.

## Do's and Don'ts

### Do:
- **Do** let the palette's own frame, ground and raised colours own the whole shell (Navy Frame #05081c, Navy #0a0f2e and Navy Raised #141c48 by default), through the role tokens rather than fixed colours, so every component works in both palettes and both modes.
- **Do** keep the action fill to the Play button, the active tab, the sound switch when on and selection, and the action ink to focus, the menu check and link text.
- **Do** derive every stat from `content/`, the dictionaries or a live source (Lanyard, GitHub, YouTube), and hide a missing number rather than show zero.
- **Do** compute the ink on Tech colours and use the deep `-ink` variants for coloured text in light.
- **Do** give every pressable control a ledge, a 44px target and a note from the kit.
- **Do** use an outline button (ground fill, 2px seam border) for secondary actions sitting on a raised surface.
- **Do** keep the sound switch visible on every page and honour reduced motion for both motion and sound.
- **Do** write every new string in both Locales and keep the lowercase, casual voice.

### Don't:
- **Don't** invent game stats: no level, rank, XP, KDA, win rate or achievement Lucas did not earn.
- **Don't** use rarity colours for decoration, headings or backgrounds.
- **Don't** hard-code Tangerine, Electric, Off-white or Night for the action or for text on a bright fill; use `action`, `action-ledge`, `action-ink`, `on-action` and `on-bright`.
- **Don't** drift into esports HUD aggression: no chamfered corners, scanlines, hex grids, glowing neon edges or forced uppercase.
- **Don't** go back to neutral zinc surfaces with colour only from content.
- **Don't** play sound automatically, on hover for touch pointers, from presence updates, or anywhere the visitor cannot silence it.
- **Don't** put blur or soft shadows on anything that does not float above the client.
- **Don't** let the chibi hop, slide or tween; its movement lives in its drawn frames.
- **Don't** make the presence card disappear or change height; it always shows a state.
