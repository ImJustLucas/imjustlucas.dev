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
  inspect-screen:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "28px"
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
  patch-tag-new:
    backgroundColor: "{colors.online}"
    textColor: "{colors.navy}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    height: "24px"
    padding: "0 10px"
  patch-tag-changed:
    textColor: "{colors.off-white}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    height: "24px"
    padding: "0 8px"
  patch-tag-fixed:
    backgroundColor: "{colors.navy-seam}"
    textColor: "{colors.off-white}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    height: "24px"
    padding: "0 10px"
  current-patch:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  version-link:
    textColor: "{colors.navy-haze}"
    typography: "{typography.label}"
    height: "44px"
  page-banner:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "20px 28px"
  career-stop:
    backgroundColor: "{colors.navy}"
    rounded: "{rounded.full}"
    size: "56px"
  career-slot:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  medal:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.full}"
    size: "112px"
  loadout:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  loadout-button:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  replay-tile:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "16px 20px 20px"
  play-disc:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.full}"
    size: "56px"
  friend-request:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "24px 28px"
  status-tag:
    backgroundColor: "{colors.online}"
    textColor: "{colors.navy}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  not-found-slot:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "24px 40px 36px"
    width: "34rem"
  unlock-banner:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "20px 28px"
  level-slot:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  xp-bar:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.full}"
    height: "16px"
  showcase-slot:
    backgroundColor: "{colors.navy-raised}"
    rounded: "{rounded.lg}"
    padding: "16px"
  showcase-well:
    backgroundColor: "{colors.navy}"
    rounded: "{rounded.md}"
    height: "clamp(360px, calc(100dvh - 420px), 600px)"
  admin-sidebar-compact:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.xl}"
    padding: "16px"
    width: "272px"
  admin-editor-banner:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "20px 28px"
  admin-entry-row:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  admin-new-entry-row:
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  admin-input:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  admin-rarity-chip:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "44px"
  admin-tech-chip:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "36px"
  admin-ongoing-chip-on:
    backgroundColor: "{colors.online}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "44px"
  admin-switch-track:
    backgroundColor: "{colors.navy-seam}"
    rounded: "{rounded.full}"
    width: "40px"
    height: "24px"
  admin-save:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  admin-save-changed:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  admin-delete:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.busy}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  admin-step:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  admin-notice:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "10px 8px 10px 12px"
  admin-refusal:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  admin-todo-disc:
    backgroundColor: "{colors.away}"
    textColor: "{colors.navy}"
    rounded: "{rounded.full}"
    size: "32px"
  admin-sign-in:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.off-white}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "20px 40px 36px"
    width: "30rem"
---

# Design System: ImJustLucas

## Overview

**Creative North Star: "The Player Profile"**

The site is Lucas's player profile in a cosy game client. The sidebar is the client chrome: the player card with the chibi head in its live status ring, the tabs (the lowercase menu), the friends panel where his Discord presence lives, the settings row (sound, Locale, theme) and the socials. The content panel is the profile screen: on the home page a banner with who he is and the team he plays for right now, a showcase of real achievements with MasterDevFrance 2025 as the legendary one, an inventory of featured Projects framed by rarity, his level earned from his GitHub contributions, an about slot beside his hobbies, the FAQ, and a goodbye. The other profile screens open on a page banner and keep the game's objects: the inventory of every Project filtered by the loadout of Techs they use, the career path of stops on a track with the diplomas as medals, and the replays. The contact screen is the client's add-friend screen: one request window to send Lucas a request, with his live status and his level, as a friend request shows a player's. The legendary achievement's own page, MasterDevFrance 2025, is the reward screen of its unlock: an unlock banner wearing the item's legendary frame, then the prize cheque standing on its stage in a showcase where the visitor throws coins. The arcade is the client's game library: a shelf of cabinets, one per hobby, beside the open one: Ollie, where the visitor skates Lucas down a Paris street, or Surf, where he rides the swell between rocks and gulls. The patch notes are the client's "what's new" window, reached from the version link at the sidebar's foot: the current version open as one big slot, the older ones folded season by season. The trophies screen is the visitor's own, reached from the count across from the version: what they unlocked by exploring the client, shelf by rarity, each unlock announced by a toast at the top of the client. Every stat on screen is a real fact from `content/` or a live source; the game is the frame, never the claim.

It is a cosy client, not a competitive one: a deep navy night (or, in the second palette, deep plum), soft fat corners, chunky buttons that sink onto a ledge when pressed, warm off-white text, candy rarity colours, and a single action colour that means "this is the thing to press": off-white standing on an electric-blue ledge at night, electric blue by day, tangerine in the plum palette. Pressable things answer with one note of a single instrument, so moving around the site plays a little melody, and one visible switch silences it all.

Density is relaxed: big slots with generous gaps, one focal object per row. The voice stays as PRODUCT.md binds it (first person, "Yoooo", emojis, lowercase menu labels). Anti-references: the previous "Dev's Desk" zinc shell (colour only through content, no accent), terminal or IDE costumes, near-black with a glowing neon accent (electric blue is a solid ledge and an underline here, never a glow), hextech gold trim (gold belongs to the legendary rarity alone), and esports HUD aggression (angular chamfers, scanlines, rank emblems).

**Key Characteristics:**
- Two-zone client inside a 12px frame: a 320px sidebar beside a rounded profile panel, both on the palette's ground, the panel the only part that scrolls.
- Five palettes, each with a dark and a light mode, all through the same role tokens: "electric" (the default; navy night in dark, off-white daytime in light), "plum" (the plum and tangerine client), "khaki" (olive and chocolate), "sakura" (burgundy night and cherry blossom) and "surf" (deep sea and sand, sea foam by day). Dark is the default mode.
- One action colour for the Play button, the active tab, the sound switch when on and selection; its ink colour draws focus.
- Rarity colours (common, rare, epic, legendary) frame content by its rarity field, never decoration.
- Chunky pressable controls on a solid ledge; raised slots and cards with soft 16px corners and a moulded-tray highlight.
- A one-instrument kalimba kit in D major pentatonic, on by default, behind an always-visible switch.
- The chibi is the mascot: stepped-frame poses on the banner, in the hobbies, the presence card and the goodbye; only inside the Arcade's game screen does he ride, jump and tumble.
- Each of the Arcade's game screens keeps a palette of its own (a Paris street for Ollie, a coast of sea and sand for Surf), by day or by night; the chrome round it keeps the site's.

## Colors

A committed world in five palettes: the shell is the colour, with one action colour and a four-step rarity ramp that labels content. Every colour a component uses is a role token (frame, ground, raised, seam, ledge, ink, ink-muted, action, action-ledge, action-ink, on-action, on-bright, and the `-ink` variant of each rarity and status colour) that changes with the palette and the mode. The shadcn roles (background, card, primary, border, ring, destructive…) are mapped onto them, so every page and the Admin inherit the world without restyling. The palette is the `data-palette` attribute on `<html>` (absent for electric, `plum` for plum); the mode is next-themes' `dark` class.

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

### More palettes (khaki, sakura, surf)
Two more palettes on the same roles, chosen by Lucas on 2026-10-20 and selected the same way (`data-palette="khaki"`, `"sakura"`, `"surf"`). Their values live only in `styles/globals.css`; every text pair below is 4.5:1 or more.

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

| Role | Surf dark | Surf light ("Écume") |
|---|---|---|
| frame | #04161a | #dcebea |
| ground | #082a30 deep sea | #f1f7f6 sea foam |
| raised | #0f3a42 | #ffffff |
| seam | #1e5a63 | #cfe3e1 |
| ink / ink-muted | #f3ecdf / #a9cfd0 | #0b2b35 / #4a6268 |
| action | #e9d8b4 sand | #5fd0bd sea glass |
| action-ledge | #1fa3a3 turquoise | #1f8f84 |
| action-ink, link-line | #4fd1cf | #16766d |
| on-action / on-bright | #082a30 / #04161a | #06303a / #0b2b35 |

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
- **In the Admin**, Online also means published (the published notice's disc and border, the "en cours" chip and tag) and Away means something to fix: the to-do discs, the warning tags, the unpublished dot and the conflict callout. Away has no deep variant, so it stays a fill, a dot or a 2px frame.

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

### The game screen (Ollie)
Lucas chose a palette of its own for the game (2026-10-21): the Arcade's screen is a Paris street drawn on a canvas, in colours that live only in `components/arcade/ollie/draw.ts` and stay the same in every site palette and mode. Day or night follows Lucas's time in Paris (21:00 to 07:00), like the chibi's outfits, never the visitor's clock, mode or palette.

| Street | Day | Night |
|---|---|---|
| sky, top to horizon | #9fd3f2 to #ffe8c8 | #070d26 to #28305c |
| sun / crescent moon | #fff4cf | #fff1c9 |
| clouds / stars | white at 85% | no clouds; #fff6e0 stars |
| far skyline (mansards, chimney pots, now and then the tower) | #a9bdd2, shade #97adc5 | #18213f, shade #141b35 |
| stone façades | #f1e2c4, #ecd9b6, #f4e8d0; joints #d9c39d | #2c3354, #283050, #30385a; joints #222944 |
| windows | #7f9fbe | #1a2038, lit #ffcf6b |
| zinc roofs / dormers | #8095ad / #687c94 | #1e2643 / #161c34 |
| wrought iron (rails, lamps) | #2b2f3a | #0d1022 |
| café front / glass | #3a3340 / #a9c6dc | #1a1a2c / #ffd98a |
| sidewalk / joints / curb | #ddd5c6 / #c8bfad / #b3a995 | #3a3f5e / #30354f / #292e48 |
| lamp glow | none | #ffcf6b at 28% |
| shadow | #2b2f3a at 18% | black at 30% |

- **Awnings**, striped with white at 55%: tomato (#d4513f), bottle green (#2f6b4f), navy (#2b3a6e), mustard (#d9a23b).
- **Chibi Maroon** (#4a1f24): the 3px outline round the street furniture, the line of the chibi art, so the obstacles sit with Lucas.
- **Sticker rim** (#fffaf0): an 8px light rim drawn round each piece of furniture and each pigeon before its shapes, so the obstacles read like stickers against the façades, each over a soft footprint shadow on the sidewalk.
- **Haze:** a veil over everything behind the sidewalk, #faf4e8 at 50% by day, #070d26 at 38% by night, so the background steps back and the street furniture comes forward.
- **Street furniture:** the cone (#ff8a3d, a #fff6ea band, a #3a3340 base); the bin, a #3fae5c hoop and pole over a see-through bag (#9fbfa8 by day, #7f9a8a by night); the bench, wooden #c9803f slats on #2b2f3a legs; the pigeon (#9aa1b6 body, #8a91a8 head, #7c8399 tail, #b4bacb wing, #5fb3a1 neck, #e8a55a beak).
- **Sparkles** to pick up: the tattoo star filled #fffaf0 with a 2.5px #2f6bff line; the same stars circle Lucas's head after a crash. The cone and the sparkle line share Tangerine's and Electric's hexes but are fixed: they never follow the palette.
- **Score ink:** the score over the street is Off-white (#f6f3ea) by night and Ink Charcoal (#10131f) by day, the street's own ink.

### The game screen (Surf)
The second cabinet's palette of its own (Lucas's choice of a palette per cabinet, 2026-10-21): a coast drawn on a canvas, the sea and sand of the site's "surf" palette carried into the game, in colours that live only in `components/arcade/surf/draw.ts` and stay the same in every site palette and mode. Day or night follows Lucas's time in Paris, as in Ollie.

| Coast | Day | Night |
|---|---|---|
| sky, top to horizon | #8fd8e6 to #fdf0d5 | #04161a to #0f3a42 |
| sun (low, with a glow) / crescent moon | #fff4cf | #fff1c9 |
| clouds / stars | white at 85% | no clouds; #fff6e0 stars |
| headlands / their beach strip | #9cc7c9, shade #86b6b8 / #e9d8b4 sand | #0a2a30, shade #082429 / #5a5444 |
| lighthouse, banded | #fffaf0, bands #e2574c | #cfe3e1, bands #a8443c; lamp #ffe3a1, beam at 22% |
| open sea, horizon to swell | #5fd0bd sea glass to #1fa3a3 turquoise | #0f3a42 to #082a30 deep sea |
| light on the water | #fffaf0 at 70% | #e9d8b4 sand at 55% |
| swell lines / their foam | #4cc3b3 / #f1f7f6 at 75% | #1e5a63 / #a9cfd0 at 45% |
| the water he rides, top to bottom | #127c84 to #0b5560 | #0a3038 to #04161a |
| foam lip and rings | #f1f7f6 sea foam | #cfe3e1 |
| haze over the sea behind him (not the sky) | #fdf0d5 at 32% | #04161a at 30% |
| shadow | #0b2b35 at 22% | black at 35% |

- **Gates:** each is one obstacle rising from the sea under one coming down from the sky, with the gap between them; every obstacle has Ollie's sticker rim (#fffaf0, 8px) under its 3px Chibi Maroon line, so it reads against sea and sky alike. **Rock**, a sea stack (#76707c, lit face #948e9a, shaded face and crack #5a5560, #3f8f5a weed at the waterline). **Beacon**, a channel tower in #fffaf0 with #e2574c bands under a red lamp housing and a #ffd84d lamp that blinks at night with a glow. **Piling**, a #a8734a post with #7f5236 grain, its foot wet (#5e3d2a) and barnacled (#e9d8b4), under a plank of the jetty deck across the top. **Gulls**, a column of gulls from the gap to the sky, facing Lucas (#fbfbf7 body, #8d99a3 wings, #2b2f3a wingtips and eye, #f2b33d beak).
- **After a crash**, three tattoo stars circle where he went in, filled #fffaf0 with a #1fa3a3 line.
- **Score ink:** #0b2b35 by day and #f3ecdf by night, the surf palette's own inks.

### Named Rules
**The Palette Owns the Shell Rule.** The frame, sidebar and panel are the palette's own frame, ground and raised colours (Navy Frame, Navy and Navy Raised in electric dark; Night, Plum and Velvet in plum dark), always through the role tokens. Never fall back to a neutral grey surface with colourful accents; the colour is the room, not the furniture.

**The One Action Rule.** An action fill marks the single most important action or state in its zone: the Play button in the panel, the active tab and the sound switch in the chrome, plus selection; the action ink draws focus. A second action-filled button in the panel means one of them is wrong. In the Admin a save button takes the action fill only while its form holds unpublished changes, so a lit button always has something to publish. A component never names Tangerine, Electric or Off-white directly for this role; it uses `action`, `action-ledge`, `action-ink` and `on-action`, so both palettes follow. Secondary links use the action ink as their text in light; in electric dark they stay ink with an Electric underline and take the action ink on hover.

**The Rarity Is Data Rule.** A rarity colour appears only on an item whose rarity field says so, as its 2px frame, 4px top band and tag (and the filled sparkle on legendary). Never use the rarity hues for headings, backgrounds or decoration. Inside the legendary item's own showcase the scene is the item, so the cheque's stage rim (its top band in 3D) and the coins are Legendary, the rim Legendary Deep by day.

**The Computed Ink Rule.** Text on a colour that is not part of the palette (a Tech's own colour) is whichever of Night or Cream contrasts more, computed; if neither reaches 4.5:1, the chip is drawn as a 2px outline in that colour with the theme's ink instead of a fill.

**The Screen Keeps Its Own Palette Rule.** The game screen never takes the site palette, and the chrome around it always does. Inside the canvas every colour is the street's own (see The game screen), switched only by Paris day and night; the cabinet, its marquee and deck, the shelf's tiles and the cards standing over the screen are role tokens like every other slot.

## Typography

**Display Font:** Unbounded (with Geist, ui-sans-serif, system-ui)
**Body Font:** Geist (with ui-sans-serif, system-ui)
**Data Font:** Geist Mono (with ui-monospace, SFMono-Regular)

**Character:** Unbounded is the game title: wide, round-shouldered and heavy, friendly at 600 and 700 and never aggressive. Geist does the reading and the controls, so menus and paragraphs stay plain and fast. Geist Mono with tabular figures sets the stats: dates, periods, star counts, elapsed time, the Locale code.

All three fonts are CSS variables (`--font-display`, `--font-geist-sans`, `--font-geist-mono`) set on `<body>` by every root layout (the Locale segment and the Admin); Unbounded loads Latin and Latin Extended for French.

### Hierarchy
- **Display** (Unbounded 700, clamp(2.25rem, 1.6rem + 2.2vw, 3.5rem), 1.05, -0.02em): the banner greeting, the home page's `h1`; on the patch notes, the current version, that page's one Display. Drops to 1.625rem below 640px so "Yoooo, moi c'est Lucas Bellier !" holds in four lines beside the 120px chibi (the greeting carries Lucas's full name, the name he is searched by: docs/seo.md). One per page at most.
- **Headline** (Unbounded 700, 1.75rem, 1.15, -0.015em): page titles on the other pages, one visible `h1` each, inside the page banner where a page has one.
- **Title Large** (Unbounded 600, 1.375rem): the player name, achievement names, a cabinet's name on its marquee, the current patch's title, `h3` in long-form content.
- **Title** (Unbounded 600, 1.125rem, 1.3): section titles (achievements, inventory, about me, FAQ), item names, the mobile top bar name, the goodbye line, a cabinet tile's name (1rem on phones), the Arcade's screen card titles.
- **Button Play** (Unbounded 700, 1.0625rem): the Play button's label only.
- **Body** (Geist 400, 1rem, 1.65): paragraphs, capped at 65ch (the FAQ column at 72ch). The banner role line is Body at weight 500 in the muted ink, 1.0625rem, rising to 1.25rem from 768px; the page banner's line is the same, held at 1.0625rem.
- **Label** (Geist 500, 0.875rem): tabs, buttons, chips, presence lines, small section labels ("current team", "friends").
- **Tag** (Geist 600, 0.75rem, +0.02em): rarity tags, live and WIP tags, Tech chips, the theme menu's section labels.
- **Data** (Geist Mono 500, 0.8125rem, tabular figures): periods, dates, star counts, elapsed time (m:ss), the resume date, the Locale code, the Arcade's scores (five digits, zero-padded).

### Named Rules
**The Copy Keeps Its Case Rule.** Type is set in the case the copy is written in. Unbounded is never forced to uppercase; the lowercase menu labels and casual voice are binding. The one uppercase string is the two-letter Locale code, in Data.

**The Typography Primitives Rule.** Text goes through `components/typography` (Display, Headline, Title, Data, Tag, P, Muted), with the element chosen by `as` so the look never dictates the outline. A raw heading with its own sizes is drift. `cn` knows the type roles (display, headline, title, play, label, tag, data) as font sizes, so a role class survives next to a text colour; a new role is added there too.

## Layout

The client fills the viewport (`100dvh`, no page scroll) inside a 12px frame in the frame colour, with 12px gutters; only the content panel scrolls. The first stop of every page is a "skip to content" link ("aller au contenu"), hidden until it takes keyboard focus, then shown as a 44px ledge button floating over the window's top left corner (24px in, Float under its ledge); it moves focus to the content panel (`main#content`), past the chrome's thirteen stops.

- **Sidebar** (320px from 768px up, the ground colour, 24px corners, 16px padding, 24px between groups), top to bottom: the player card, the six tabs (44px rows, 4px apart), the quick menu button, the friends panel, then the settings row (sound, Locale, theme) and the social row pushed to the bottom, with the version link under the social row and the trophy count across from it.
- **Content panel**: the remaining width, 24px corners, 28px padding (16px below 768px), the ground colour. Page content is centred at a 1180px maximum width, with 48px between sections and 16px between a section title and its row.
- **Rows** are plain CSS grids with 12px gaps, not a 12-column system: featured Projects run 1, 2 (768px) then 3 (1280px) columns; the about row splits 1:1 from 1024px; two or three achievements sit 2fr / 1fr / 1fr with the rarest first, while a single one takes the full row as a wide slot.
- **Banner**: from 768px a two-column grid, the chibi (200 to 260px) on the left spanning greeting, role, current team and actions, with a minimum height of 340px; below 768px the chibi shrinks to 120px beside the greeting and the role, team and actions run full width, the Play button full width below 640px.
- **Page banner**: a two-column grid, the text beside a chibi column of 96px, 128px from 640px and 160px from 768px; below 640px the Headline takes the full row and the chibi sits beside the line. Padding 16px, 24px from 640px, 20px by 28px from 768px; 48px down to the page's first section.
- **Page rows**: the career path is one column of stops (a 44px track column, 56px from 640px, with 12px then 20px to the slot, 16px between stops); medals run 3 columns from 768px; the loadout's buttons are one row swiped sideways on phones (bleeding to the slot's edges, snapping to the buttons, the chosen one scrolled into view, each edge fading over 2.5rem while buttons hide past it) and wrap from 640px (8px apart, 12px between lines), above the item grid, which runs 1, 2 (768px) then 3 (1280px) columns; replays run 1, 2 (768px) then 3 (1280px) columns.
- **Contact window**: the page holds an 880px maximum width under its Headline title (24px below it); from 768px the title and the request window are centred vertically in the panel (a minimum height of the viewport less 80px, the panel's frame and padding, lifted by 6vh of bottom padding). The window is one column below 768px (the chibi at 144px, centred above the details) and a 240px chibi column beside the details from 768px (32px apart, 24px between rows); "right now" sits 48px below it.
- **Reward screen** (MasterDevFrance 2025): one column at the 1180px maximum, 48px between the unlock banner, the showcase slot and the back link. The unlock banner keeps the page banner's grid, padding and chibi column. The showcase slot has 12px padding (16px from 640px) with 12px (16px) between the well and its controls row; the well is clamp(240px, 36dvh, 300px) tall below 640px, so the panel still scrolls beside a scene that captures touch, and clamp(360px, 100dvh − 420px, 600px) from 640px, so banner and showcase fill the first view. The controls row wraps: the throw button, the hint, and the pause/play button pushed right; below 640px the hint drops to its own last line.
- **Arcade:** the 1180px maximum, a plain header (the Headline over Lucas's line at the page banner's 1.0625rem, 8px apart, no banner slot) 24px above the floor. The floor is one grid with 12px gaps: below 1280px the shelf is a row of two tiles above the full-width cabinet; from 1280px the shelf stands to the cabinet's right as a 16.5rem column with the leaderboard under it, both top-aligned; below 1280px the leaderboard follows the cabinet. The cabinet has 12px padding (16px from 640px) and 12px (16px) between marquee, screen and deck; the screen is 3:2 below 640px and 16:9 from 640px.
- **Reading text** holds 65ch inside its slot, never the full panel width.
- **Mobile** (below 768px): a 56px top bar on the ground colour (40px chibi head, name, then the quick menu button, sound switch and menu button 6px apart, 8px between groups; the name drops to 1rem below 390px so the whole handle fits at 375px) replaces the sidebar column. The same sidebar, mounted once, becomes a full-width sheet from 68px down, sliding up with Ease Drawer (260ms in, 180ms out), with the player card hidden and the panel `inert` behind it. Escape or widening to 768px closes it. Achievements with more than one slot become a horizontal snap row.
- **Breakpoints** are Tailwind's: 640, 768 (the client's one structural switch), 1024, 1280.

## Elevation & Depth

Depth is tonal first (frame, then ground, then raised: Navy Frame, Navy, Navy Raised by default; Linen Frame, Off-white, Paper in electric light; Night, Plum, Velvet and Lilac Frame, Lilac Wash, Sheet in plum) and tactile second: pressable controls stand on a solid ledge like console buttons, and slots carry a one-pixel top highlight like a moulded tray. A soft blurred shadow exists only for layers that float above the client.

### Shadow Vocabulary
- **Ledge** (`box-shadow: 0 4px 0 rgb(var(--ledge))`): every pressable control at rest. The ledge is the frame colour under raised and ground controls in dark (Navy Frame, Night), the seam colour under them in light (Linen Seam, Seam Light), the action ledge under action controls (Electric, Electric Ledge, Tangerine Ledge), and Legendary Ledge under the legendary slot.
- **Ledge Raised** (`0 6px 0` with `translateY(-2px)`): hover, on hover-capable pointers only.
- **Ledge Pressed** (`0 0 0` with `translateY(4px)` and `brightness(0.94)`): active; the control sits on its ledge.
- **Tab Ledge** (`0 3px 0 rgb(var(--action-ledge))`): under the sliding active-tab fill, which travels with it.
- **Tray** (`inset 0 1px 0 rgb(246 243 234 / 0.07)` in electric dark, `inset 0 1px 0 rgb(255 241 230 / 0.08)` in plum dark, `inset 0 1px 0 rgb(255 255 255 / 0.9)` in both light modes): the top highlight inside the player card, banner, slots, item cards, accordion rows and presence card.
- **Well** (`inset 0 2px 0 rgb(var(--ledge))`): the showcase well on the reward screen, the Arcade's cabinet screen (its lip drawn over the canvas in both) and the XP bar's track, the tray's inverse: a ledge-coloured lip along its top edge, so it reads as pressed into the slot. Never on anything pressable.
- **Float** (`0 24px 48px -12px rgb(2 4 16 / 0.6)` in electric dark, `rgb(16 19 31 / 0.22)` in electric light, `rgb(12 4 22 / 0.6)` in plum dark, `rgb(42 21 64 / 0.28)` in plum light): the mobile sheet, menus, the quick menu and its toasts, the trophy toast, the Admin's published notice and the cards standing over the Arcade's game screen.

### Named Rules
**The Real Button Rule.** Anything pressable has a ledge and sinks onto it when pressed; anything with a ledge is pressable. Static cards and slots never get one. Ghost and link controls are not raised controls and have none.

**The Float Means On Top Rule.** Blurred shadows belong only to layers above the client (the mobile sheet, menus, the Admin's pinned published notice) and to the cards that stand over the Arcade's game screen.

## Shapes

Fat, friendly corners from one scale: 24px for the frame's two zones (sidebar, panel, mobile top bar and sheet), 16px for slots, cards, the banner, accordion rows and menus, 10px for buttons, tabs, artwork and screenshots, full circles for the chibi head, the chibi's stage discs, status dots, palette swatches and all chips and tags. Borders are 2px, never hairlines: the seam colour on the banner, outline buttons, team chips, WIP tags and menus; the rarity colour on items. Plain slots (player card, about, hobbies, presence, accordion) are borderless raised surfaces with the tray highlight. Focus is a 2px ring in the action ink with a 2px offset (inset on accordion rows). The new objects keep the scale: stop discs, medals and the play disc are full circles with a 2px seam (or Online) ring, the career track is a 4px rounded line, the showcase well and the cabinet screen take 10px corners and the cheque's 3D stage is a round disc. No angular chamfers, notched corners or clip-path frames.

Materials:
- **The sparkle**: Lucas's hand tattoo, an outlined four-point star with slightly concave sides, the site's one ornament. On the frame it is drawn whole and small (8px and 6px stars, outlined) running along the 12px gutters only, including the gutter between sidebar and panel, at stroke opacity 0.12 in the dark ink on the dark frame (Off-white on Navy Frame, Cream on Night) and 0.08 in the light ink on the light frame (Ink Charcoal on Linen Frame, Plum on Lilac Frame); it is never clipped and never behind text. Filled in Legendary, it marks legendary achievements in their top-right corner. Outlined at 12px, it is the icon of the patch notes' "new" tag and of its count in a row's tally.
- **Legendary foil**: a pale gold light band sweeps across a legendary slot over 900ms with Ease Out, once per session when it first scrolls into view, again on hover and on click; at rest the slot is flat. On the unlock banner it crosses once on arrival, 200ms after the page, and never on hover.
- **Chibi art**: the ImJustLucas chibi as transparent square WebP poses (`public/images/chibi/`, registry `lib/chibi.ts`): banner, chilling, sleeping, goodbye, trophy, the hobbies surf, skate, football, tennis, LoL, coding, coffee, series, music, the ollie (the skate's jump frame), surf-ride and surf-wipeout (on the board and off it), the three drawn only in the games, and the season's christmas (the banner pose in a Christmas hat) and santa. Every pose keeps the commissioned style, face, hair and eyes, and wears its own outfit (`docs/design/chibi-poses.md`). A pose may have a night outfit, worn by Lucas's time in Paris (`Europe/Paris`, 21:00 to 07:00), never the visitor's clock, mode or palette: the banner (whose night art does not exist yet, so it wears the day one) and the LoL pose in the friends panel; the hobby tiles always show the day LoL pose. Pages render the day art and switch after mount with a 300ms crossfade, with no layout shift. The season follows the same clock: all December in Paris (`isDecemberInParis`), the banner rests in the christmas pose and santa joins the poses a boop can swap to, checked after mount like the night outfit. The full-body chibi stands in front of a circular ground-coloured stage disc.

## Components

Every control is drawn in the client's vocabulary; shadcn and Radix stay as the behaviour layer. Values below name the electric dark default; every colour is a role, so the other palette and mode follow (see Roles across palettes).

### Buttons
- **Shape:** 10px corners, Label type, 16px icons, a 2px action-ink focus ring with a 2px offset.
- **Play** (primary): the action fill (Off-white), `on-action` label (Navy) in Unbounded 700, 52px tall with 24px side padding, on the action ledge (Electric); plays the confirm chord. One per screen (on home, "Download my resume", with its date in Data beside it; on contact, the LinkedIn DM; on the 404, "Respawn at home", with the error code under it; on the Arcade, play, resume and play again on the screen's cards, one at a time, 44px tall below 640px and 52px from 640px).
- **Ledge** (default): raised fill (Navy Raised), ink label, 44px tall, 16px padding; hover also tints the seam colour at 40%.
- **Outline:** ground fill (Navy), 2px seam border, on a ledge: the secondary button wherever it sits on a raised surface, so it stays distinct from its background (LinkedIn on the banner, GitHub with its live star count and the external link on item cards, Discord and the other platforms on the contact window). The small size is 36px tall with 12px padding.
- **Icon:** 44px square ledge buttons (sound, Locale, theme, socials, menu, the quick menu on phones) with screen-reader labels.
- **Ghost / Link:** no ledge; ghost tints the seam colour on hover, link is the action ink and underlined.
- **Secondary link** (the shared `SECONDARY_LINK` style): inline links in copy and titles (a company name, the subscribe line). The action ink with a 2px `link-line` underline 4px below; in the dark modes the ink, taking the action ink on hover. External ones open in a new tab.
- **Destructive:** Busy Deep fill with Cream text in light, Busy with `on-bright` text in dark, on a ledge. The Admin's delete is the declared exception: a quiet outline in the error ink (see Admin).
- **States:** hover raises 2px onto a 6px ledge (fine pointers only); press sinks 4px in 80ms and releases in 160ms with Ease Pop; disabled drops the ledge to 50% opacity.

### Tabs (the menu)
- **Style:** full-width 44px rows, Label type, a lowercase label from the dictionaries and an 18px line icon on the left.
- **Hover:** the seam colour at 70% and the tick. **Active:** the action fill slides to the tab on its 3px action ledge (240ms, Ease In Out), `on-action` text, `aria-current="page"`. The fill moves by 3rem a tab (a 2.75rem row and its 0.25rem gap), so it stays on its tab when the visitor raises the browser's font size. Each tab plays its own note, so walking down the menu plays a rising scale.
- **Mobile:** the same tabs in the sheet; choosing one plays its note and closes the sheet.

### Player card (signature)
A raised slot at the top of the sidebar: the 64px chibi head in a 3px status ring coloured by Lucas's live Discord status (the seam colour while connecting), "ImJustLucas" in Title Large, and one muted Label line with role and city. No level, rank or XP.

### Friends panel / presence (signature)
A muted Label heading with a live tag (Online fill, `on-bright` text) while Lucas is online, led by a 12px line icon (2.5px stroke) of the device he is on: a monitor on his computer, a phone on his phone, a globe in a browser (its name read before the tag, "on his phone, live", and shown as a native tooltip). Under the heading, **the lobby line** (a 20px row, `px-1` like the heading): an 8px dot, then how many visitors are on the site in muted Label, the number in Data and the ink ("**5** players in the lobby"), or "just you in the lobby" when the visitor is alone, never 0. The dot is Online with company and Common alone, static (the presence card's breathing dot is the panel's one ambient loop). Its row is held from the first render so the card never moves when the count arrives, and it goes only when the store is down; a native tooltip says what it counts ("visitors on the site right now, counted without tracking"). A new count rises in like a page (see Motion); it is not a live region, so screen readers read the count where it stands and never hear it change. The presence card has a fixed 76px height so the sidebar never jumps; it shows, in this order of precedence, a game, his editor, a show, a Spotify track, then his status. **Playing:** 48px game art with a small badge, the game name, then a breathing Online dot, the elapsed time in Data (m:ss) and the detail line; on the right, the 56px LoL pose in his day or night outfit by Paris time. **Coding** (an editor's rich presence: VS Code, Cursor, Zed, the JetBrains IDEs…, never shown as a game): the language icon with the editor as its badge, the project (his workspace) as the name, then the breathing dot, the elapsed time and the language; without a project, "coding in {language}" leads and the editor is the detail. The file, the line and every other free text the editor sends are never kept. On the right, the 56px coding pose. **Watching:** the playing layout with the series pose. **Listening:** 48px album art with the Spotify mark on an `on-bright` disc, the title, then three small Online equaliser bars and the artist, and under them the track's progress, a 4px full-round bar on a seam track filled in Online's ink (deep by day), moved once a second without a tween; on the right, the 56px music pose stepping through its two drawn frames while he listens. The whole slot is the link to the track on Spotify (new tab, press note, a seam tint at 40% on hover over 150ms, its focus ring drawn inside the slot). **Online, away, busy:** the 44px chibi head in its ring, a status dot and label, and a line: Lucas's own when he set one (the site message in Lanyard KV, otherwise his Discord custom status with its emoji, Unicode or a 16px custom one; one line, plain text), the playful stock line otherwise. **Offline:** the sleeping pose and "offline" in Common's ink, with his site message if he left one. **Connecting:** a seam-coloured skeleton of the same size; if Lanyard is unreachable after 10 seconds the card shows offline. Art that fails to load falls back to the seam placeholder. Long names truncate to one line with the full text as a native tooltip. Presence never plays a sound on its own. **For screen readers** the card itself is not a live region (the elapsed time changes every second, and the head beside a status already says it, so it is hidden there); a separate polite status line says only a change of activity once it has held for 2 seconds: "Lucas is now playing {game}", "…coding", "…watching {show}", "…listening to {song} by {artist}", "…is now {status}". The first state after connecting, a new track, the language, his own line and the elapsed time are never announced.

### Banner (signature)
A raised slot with a 2px seam border and the tray: the full-body chibi on its stage disc (a button: booping swaps to another pose with the boop cue, until Lucas's activity changes; hover plays its drawn frames; it rests in the pose of what Lucas is doing live, see Chibi sprites, otherwise waving, in the christmas pose all December), the Display greeting, the role line, "current team" with one team chip per ongoing Experience (or the chilling pose and line when there is none), and the actions: Play with the resume date, then the outline LinkedIn button.

### Team chip
40px tall, full radius, ground fill with a 2px seam border, the Experience's emoji then the company in Label; the role is read to assistive tech only.

### Item card (Projects)
Raised card, 16px corners, 2px frame and 4px top band in the item's rarity colour, the tray. A 16:9 screenshot (10px corners, top-anchored crop, a placeholder icon and label when missing), the name in Title with the rarity tag beside it, the period in Data with a WIP tag, three lines of description in the muted ink, the Tech loadout as chips, and a footer of outline buttons. Padding 16px, 20px from 640px. Hovering plays the tick and zooms the screenshot to 1.03 over 300ms (Ease Out; none under reduced motion); heights follow content within an aligned grid. The name is the link to the Project's page, stretched over the whole card (its focus ring drawn 4px inside the frame); the footer's buttons sit above it. Pressing it plays toggle on.

### Inspect screen (signature)
A Project's page, and the same content as a window over the inventory: the item card grown into the screen a game opens when you inspect an item. The same frame (2px rarity frame, 4px top band, tray, 16px corners), padding 16px, 24px from 640px, 28px from 1024px. Across the top the name in Headline (the page's `h1`; `h2` in the window) with the rarity tag, WIP tag and Period in Data under it, and, in the window, the 44px outline close button at the right. Then from 1024px two columns, 3fr and 2fr, 32px apart (stacked below, 24px apart): the viewer, a 16:9 screen (10px corners, top-anchored crop, the card's placeholder when there is no image) with, when there are several images, a wrapping strip of 16:9 thumbnails (80px, 96px from 640px, 10px corners, 2px seam frame at 70% opacity, the one shown framed in the action ink at full opacity; hover ticks, a press plays press and crossfades the screen); and the stats: the full description in the muted ink at 1.0625rem, the holder row (the coding chibi at 64px on its ground stage disc, "Lucas" in Title, the role in muted Label, or "still building it" for a WIP Project with no role), the loadout (the "loadout" Tag over the Tech chips), and the actions pushed to the bottom: "visit the site" as the action fill with an external-link icon (Label, not the Play type; plays confirm) and the outline GitHub button with its live star count. Under a 2px seam, the lore, only the sections the Owner wrote (context, what I built, outcome): from 1024px a 13rem column for the Title and the paragraphs beside it at 65ch, 32px between sections. The page puts a secondary "back to the inventory" link with a left arrow 24px above the screen. The window is a modal dialog over the client dimmed by the frame colour at 75%: from 768px centred, 1080px at most, 24px from the viewport's edges, with Float; below, a sheet from 12px under the top, its top corners 24px, sliding up, its title row with the close button pinned at its top while it scrolls. Closing gives focus back to the card that opened it. It opens with toggle on (from the card) and closes with toggle off, through history.

### Achievement slot (signature)
A link slot: rarity frame and top band, the achievement art in a circular stage (128px in the wide slot), the rarity tag and year in Data, the name in Title Large, a description in the muted ink and an arrow that nudges 4px on hover. The legendary slot also stands on the Legendary Ledge, carries the filled sparkle and the foil, and plays the unlock (arpeggio, then the coin) on click, holding navigation for about half a second so it is heard.

### Level slot (signature)
Lucas's level, earned from his real GitHub contributions (1 contribution = 1 xp, counted since his account opened; going from level n to n + 1 costs 100·n xp), in the home page's "level" section between the inventory and the about slot, under a Title like its neighbours. A borderless raised slot with the tray (20px padding, 28px from 768px), two rows parted by a 2px seam rule. **Level row:** the level badge, a 64px (72px from 768px) ground disc with a 2px seam ring holding "lv" ("niv.") in muted Tag over the number in Headline, not a button and with no ledge; beside it the xp earned in the level in Data at Title size in the ink, then "/ 1,100 xp" in muted Data, "345 xp to level 12" in Label ink at the right, the XP bar, and the rule ("1 GitHub contribution = 1 xp · 6,255 xp in total") in muted Label, so the number never claims more than it is. **XP bar:** a 16px full-round track in the ground colour with the Well lip, the fill in the ink with a 3px darker base (the action ink stays the Play button's), cut by 2px raised-colour notches every tenth; a level with any xp shows at least a sliver. To assistive tech it is a progressbar named "xp towards level 12". **Streak row:** from 768px the heatmap at the left and the streak at the right, beside today's column; below 768px the streak, the heatmap at full width, then the link. The streak is a 48px ground disc with a 2px seam ring and a lucide flame, in the ink with a faint fill once today counts, the muted ink while today is still open and the seam colour with no streak, then the day count in Title over "streak, today's in" / "streak, today's still open" / "no streak right now, the next commit starts one" in muted Label. The heatmap is the last 20 weeks as GitHub draws them, a column per week with Sunday on top, 14px dots 4px apart from 768px (sharing the width below), the empty day in the seam colour and GitHub's four shades as the ink at 25, 45, 70 and 100%; each day's count is its native tooltip, and assistive tech reads the total under it ("2,290 contributions in the last 20 weeks") instead. "see me on GitHub" is a secondary link with an up-right arrow that nudges 2px on hover, a 44px target, opening the Profile's GitHub in a new tab with the press note. The section is absent when the level cannot be read (no GitHub token, or GitHub down on a fresh build); a previous page keeps showing while GitHub is down at runtime.

### Page banner
The home banner's smaller cousin at the top of the projects, experiences and videos pages: a raised slot with a 2px seam border and the tray, the page title in Headline, one line in Lucas's voice in the muted ink, and a full-body chibi pose on its ground stage disc (coding for the inventory, coffee for the career, series for the replays). The pose is not a button here and has no cue.

### Unlock banner (signature)
The page banner of a legendary item's own page (today MasterDevFrance 2025), wearing the item's rarity like its achievement slot: a raised slot with the tray, a 2px Legendary frame and 4px Legendary top band in place of the seam border, and the filled sparkle (24px) in the top-right corner. The Headline is the page title, shrinking with the phone's width below 640px (min(1.75rem, 5.6vw), 32px clear of the sparkle) so one long name never overflows; under it a tag row: the rarity tag, an "unlocked" tag drawn as the live tag with a 12px check, and the year in muted Data. Then Lucas's line in the muted ink and the trophy pose on its ground stage disc, not a button. The foil crosses it once on arrival.

### Showcase (signature)
The trophy on show, in a borderless raised slot with the tray. **Well:** a sunken ground-coloured well with 10px corners and the Well lip, holding a transparent R3F canvas: in the dark modes a night sky with drifting stars, bloom and a vignette; in light the palette's daylight ground, no stars, no vignette, and a bloom held to the gold. The cheque stands on a 3D stage disc in the palette's raised colour (read live from `--raised`, following palette and mode) with a Legendary rim, a slow bob, and gold coins (Legendary, with a shimmer) falling round it. The lens frames cheque and stage by the well's aspect (about 60% of a wide well, across with a margin on a phone); dragging orbits within limits without zoom or pan, and a click or tap on the scene throws a coin from the camera to that point. **Controls row:** "throw a coin" as a ledge button (the same throw for keyboards and screen readers, disabled while paused), a muted Label hint with a pointer icon (a touch wording on coarse pointers, a paused wording while still), and a pause/play ledge button that plays toggle off / on. **Loading:** over the well in its ground, a spinning seam ring and the progress in Data. A back link to the profile (a secondary link with a left arrow that nudges 4px on hover, a 44px target) closes the page.

### Arcade (signature)
The client's game library (`app/[locale]/arcade`, `components/arcade/`): a shelf of cabinets, one per hobby (`lib/arcade/cabinets.ts`), beside the one that is open. The best is the visitor's own, kept in their `localStorage` (for the visit only when storage refuses); each game also has a top 10 of players, every score replayed by the server before it stands there (`docs/arcade.md`).
- **Cabinet tile:** a raised slot with the tray and 16px corners (10px padding, 12px from 640px; a transparent 2px border, so selection never moves it): the pose (56px, 64px from 640px) on its ground stage disc, the name in Title, the tagline in muted Label from 640px only, and a tag. The open cabinet is ringed with a 2px action-ink border and carries a "playing" tag drawn as the live tag (Online, `on-bright`). A locked cabinet ("soon") shows its pose as a silhouette in the seam colour (the pose file as a CSS mask), a 20px lock badge on a ground disc in the muted ink at its corner, and a "soon" tag on the seam fill with ink text. Tiles tick on hover. A playable tile is a button (`aria-current` on the open one) that opens its cabinet with toggle on, its seam border on hover and the 2px action-ink focus ring; the open cabinet is kept in the address (`?cabinet=surf`, none for the first) so it can be shared, and choosing another one loads its game and its leaderboard. Inside a button the name is a span, not a heading. A locked tile is not a button.
- **Cabinet:** a borderless raised slot with the tray. **Marquee:** the game's name in Title Large across from "best" in muted Data with the number in ink ("-----" before a first run). **Screen:** a sunken well in the ground colour with 10px corners and the Well lip drawn over the canvas, 16:9 from 640px and 3:2 on phones, where the street fills the height and shows less road ahead. It takes focus (`role="application"`, described by the game and the hint) with the 2px action-ink ring, 2px out. While a run is on, the score sits top-right in Data in the street's own ink, the best before it at 60%; it hides while a card carries the score. **Deck:** the hint in muted Label with a keyboard icon (a hand and the touch wording on coarse pointers), and pause / resume as a ledge button pushed right, disabled unless a run is on or paused.
- **Screen cards:** the client's windows over the street: raised, a 2px seam border, 16px corners, Float, 12px by 10px padding (24px by 20px from 640px), centred in the right 73% of the screen so they never cover Lucas, who rides in the left quarter. **Ready:** the best (or the first-run line) in muted Data from 640px, over Play; on phones Play stands alone on the street, with no card. **Paused:** "paused" in Title over Resume. **Over:** "game over" or "new best!" in Title, the score and best in muted Data with ink numbers, then, once a run is kept, "#3 on the leaderboard" in Data in the action ink with a trophy line icon (or "this score couldn't be saved" in muted Data), over Play again. The card's button is the panel's one Play, except while the first name is asked, when it drops to a ledge button and Save takes the action.
- **First name:** asked once, the first time a run would make the board, between the screen and the deck: a ground strip (10px corners, 12px padding, 16px from 640px) with "you're in the top 10!" in Title after a trophy in the action ink, then the "your first name" label and the Admin's field (44px, ground, 2px seam border, Body size) beside the Play-variant "save my score" (stacked below 640px), and one Label line under them: the hint that the name is public and kept in this browser, in muted ink, or what is wrong with it in the error ink (an alert). On a fine pointer the field takes focus. Saving plays toggle on and announces the place.
- **Leaderboard:** a raised slot with the tray (12px padding, 16px from 640px): "top 10" in Title across from the game's name in muted Data, then up to ten rows (36px, 10px corners): the place in muted Data (two digits), the name in Label, truncated, and the score in Data pushed right; rows alternate a 60% ground band, the visitor's own row takes the seam fill with a "you" tag drawn as the live tag. Loading: three pulsing seam rows (still under reduced motion). Empty: "nobody on the board yet, your turn" with the game's own emoji (🛹 Ollie, 🏄 Surf) in muted Label; unreachable: a muted line saying the board is resting.
- **Input:** in Ollie, Space, ↑ or W, or a press on the screen, jumps, and holding flies higher; in Surf the same keys and press pop Lucas off the swell, each one again in the air to climb higher (no hold); Space or Enter also starts, resumes, and restarts after a 450ms guard; Escape or P pauses and P resumes. A polite live region says the run started, paused, and its result.
- **Loading:** the cabinet's shape (the same padding and screen aspect) with a spinning seam ring on the ground screen, so nothing moves when the game's chunk arrives.

### Patch notes (signature)
The client's "what's new" window (`app/[locale]/patch-notes`, `components/patch-notes/`), under a page banner with the coding pose: the current version open, then the older ones season by season, folded. A season is the version's first number.
- **Current patch:** a raised slot with a 2px seam border and the tray (padding 16px, 24px from 640px, 24px by 28px from 768px). From 1024px a 15rem column, parted from the lines by a 2px seam rule, 40px apart: the version ("v2.12") at Display size, the page's one Display, then the patch title in Title Large, then the "current version" tag drawn as the live tag with a 12px check, the date in muted Data beside it, and the outline GitHub button (small) at the column's foot; the lines beside it, centred. Below 1024px the column stacks over the lines, 24px apart.
- **Tag chips:** Tag type, full radius, 24px tall, 10px side padding, each with its own 12px icon so colour is never the only difference: **new**, the Online fill with `on-bright` text and the outlined tattoo sparkle; **changed**, the 2px seam outline with ink text and a refresh icon; **fixed**, the seam fill with ink text and a wrench.
- **Lines:** new, then changed, then fixed, whatever order they were written in. From 640px the chips form one aligned column (as wide as the widest chip) beside the text, 12px apart; below 640px each chip sits over its line, 16px between lines. The text is ink Body at 65ch.
- **Seasons:** 48px apart, each "season 2" in Title across from "14 patches · Oct 2026" (a month range "Jun 2026 → Oct 2026" when it spans several) in muted Data, 16px above its rows. A season holding only the current patch shows no section.
- **Folded row:** the FAQ's accordion row (toggle on / off, tick on hover), several open at once. The trigger holds the version pill (Data in ink on a 28px ground pill, a 4.5rem column), the title in Title (Unbounded 600, 1rem on phones), from 640px the tally (each tag's icon then its count, in muted Data; read as "3 new, 1 fixed") and the date in muted Data, right-aligned in a 7.5rem column; on phones the date sits under the title and the tally is hidden. Opened, a 2px seam rule at 70%, then the lines and, when the patch has one, the small outline GitHub button.
- **Address:** each patch answers to its version (`#v2-9`); arriving on one opens its row, and the browser scrolls it in.
- **Version link:** at the sidebar's foot, under the social row: a scroll icon, "patch notes" in Label in the muted ink and the version in Data ("v2.12"), then, until the visitor has opened the patch notes, an 8px breathing Online dot (said to screen readers as unread). Which version they have read is stored per visitor in `localStorage` (`imjustlucas.patch-seen`) and never shown before hydration, so the dot is absent from the server's page. A quiet link, no ledge, 44px tall: hover lifts it to the ink and draws the 2px `link-line` underline under its label; on the page it stays in the ink with `aria-current="page"`. It ticks on hover and plays the Patch cue when pressed; in the mobile sheet it also closes the sheet. With no patch it is not shown.
- **Empty:** one raised slot with the tray, the chilling pose on its ground stage disc (128px, 144px from 640px) and the empty line.

### Trophies (signature)
The visitor's Trophies (`app/[locale]/trophies`, `components/trophies/`, docs/trophies.md), never Lucas's: his are Achievements. Under a page banner with the trophy pose, 48px above a summary slot and the shelves, 12px apart. Their progress lives in the visitor's browser, so the screen is static and fills in after hydration.
- **Summary:** a raised slot with a 2px seam border and the tray (padding 16px, 24px from 640px, 24px by 28px from 768px). The count at Display size ("7/16", the total in the muted ink; "–" before hydration), the page's one Display, over "trophies unlocked" in muted Label; beside it from 768px (40px apart), stacked below otherwise, one 12px pip per Trophy in shelf order (4px apart, 6px from 640px), a ground pip pressed in by the ledge inset until its Trophy is unlocked, then its rarity's fill (The Rarity Is Data Rule: each pip is that Trophy); the latest unlock ("latest: painter, Oct 22, 2026", the day in muted Data), "nothing yet, go poke around 👀" or, with all of them, "you're a legend 👑", in medium ink Label; then the storage note in muted Label (kept in this browser only).
- **Shelf:** one per rarity, commonest first, two columns from 1280px (common beside rare, epic beside legendary, top-aligned; narrower, a shelf leaves a name no room): a raised slot with the tray and its rarity's 4px top band, the rarity's name in Title across from the count in muted Data ("1/6"), then its Trophies as rows parted by 2px seam rules at 70%, 8px in from the slot's sides.
- **Trophy row:** static, no ledge, at least 76px: a 48px ground disc with the Trophy's 20px line icon, the name in Title at 1rem over how to earn it in muted Label, then at the right what it stands at (below 640px, under the line). **Unlocked:** the disc ringed 2px in the rarity (its frame) with an ink icon, an ink name, and the day in muted Data after a 14px Online-ink check. **Locked:** an empty socket, the 2px seam ring pressed in by the ledge inset like an empty pip, the icon and name in the muted ink, and either a 16px lock or, for a Trophy built on a Tally (or platinum), "3/5" in muted Data over a 56px by 6px ground bar filled in the muted ink. **Secret, locked:** "???" for the name, its hint for the line, a question-mark icon; its rarity still shows on its shelf.
- **Toast:** a raised window with a 2px seam border, 16px corners, Float and the tray, 384px at most, at the top of the client (24px in from the top right from 768px, full width 12px in on phones), so it never meets the quick menu's toasts at the bottom: the Trophy's rarity as its 4px top band, the icon on a 56px ground disc ringed in the rarity, then the "trophy unlocked" live tag (Online fill, 12px check) beside the rarity tag, the name in Title and how it was earned in muted Label. One at a time: the first 900ms after the unlock so the cue that earned it sounds first, the next of a burst 300ms after; each stays 4.2 seconds, and a press dismisses it. Announced through a polite status region mounted with the client ("Trophy unlocked: painter").
- **Count:** at the sidebar's foot, across from the version link: an award icon and the count in Data ("7/16"), the muted ink, ink on hover and on the trophies screen, the version link's 2px underline on hover; read as "trophies: 7 of 16". No number before hydration rather than a wrong one. Press plays press, hover the tick, and it closes the mobile sheet.

### Career path (signature)
Experiences as stops on a track, in the Owner's order. **Track:** a 4px rounded seam line running from under each disc to the next, lit Online between two consecutive ongoing stops. **Stop disc:** 44px (56px from 640px), ground fill with a 2px seam ring, the Experience's emoji (a muted briefcase line icon when it has none); an ongoing stop takes an Online ring and a breathing Online dot on a 3px ground rim at its shoulder. Hovering the slot tilts the emoji (-12deg, 1.1 scale, Ease Pop). **Slot:** a borderless raised slot with the tray: the period in Data and the "current team" tag while ongoing, the company in Title Large as a secondary link with an up-right arrow that nudges on hover (opens in a new tab; the slot itself is not a link; 10px of vertical padding brings its target past 44px without moving the line), the role in ink with the contract type tag, and the description in the muted ink. Hovering ticks.

### Medals (signature)
The diplomas as coins Lucas earned, each in a raised slot (side by side below 768px, stacked and centred from 768px) beside the diploma in Title, the school in muted Label and the years in Data. **Medal:** a 96px (112px from 768px) round button on a ledge, ground face with a 2px seam border and a dashed seam rim inset 6px; the face carries a muted graduation cap and the level lettered in Unbounded 700, the back Lucas's chibi head and the year it was minted (the end year) in Mono. It turns like a coin (rotateY, 600ms, Ease Out) when its slot is hovered on fine pointers, and pressing it keeps it turned (`aria-pressed`), playing toggle on or off. The slot ticks on hover.

### Loadout (signature)
The Projects page's filter and order, between its banner and the item grid: a raised slot with the tray, "loadout" in Title Large with the Tech count in muted Data across from it. The order and every number come from the Projects (`lib/content/loadout.ts`): the most used first, then the longest held, then by name; a Tech no Project uses is not shown. **Loadout button:** an outline ledge button (ground fill, 2px seam border, 44px, 10px corners) with a 12px disc in the Tech's own colour ringed in the seam, then the Tech name in Label over "2 projects · since 2023" in 0.75rem Data, on one line each. The chosen one (`aria-pressed`) takes the action fill on the action ledge with `on-action` text, like the active tab; pressing it again, or "all", shows every Project. Choosing plays toggle on, clearing toggle off, and each button ticks on hover. One Tech at a time; it is kept in the URL (`?tech=nextjs`) so a filtered view can be shared, and an unknown one shows everything.
- **From 640px:** "all", then the 8 most used Techs, wrapping, then a dashed outline button "+24 techs" (`aria-expanded`, its chevron turning over 200ms) that unfolds the rest in place and folds them back ("fewer techs"), toggle on and off. Folded, a chosen Tech beyond the 8 still shows, after them.
- **Below 640px:** no row of Techs; one outline button (a sliders icon and "techs", or the chosen Tech's disc and name on the action fill) opens every Tech in a sheet sliding up from the bottom (the mobile sheet's motion, at most 85% of the viewport, its list scrolling): "loadout" in Title, a 44px close button, the quick menu's search field (focused only when pressed, so the keyboard never covers the Techs), then "all" and the Techs as full-width loadout buttons, filtered as one types (case, accents and punctuation ignored, `techMatches` in `lib/content/inventory.ts`). Choosing one closes it; Escape, a press outside or the close button close it with toggle off; focus goes back to the button.
- **Order:** an outline button with an up-down arrow, "sort: rarity" (the order alone below 640px, so both buttons share one row), opening a menu of radios drawn like the theme menu: rarity (the default, rarest first, then newest), newest (Period order), oldest, name (a → z). Choosing plays toggle on; the order is kept in the URL (`?sort=recent`, none for rarity), an unknown one is rarity (`sortProjects` in `lib/content/inventory.ts`).
- Across from the order, a polite live line in muted Data says how many Projects are shown; items fade in (150ms) as they appear.

### Replay tile (signature)
A Video as a borderless raised slot with the tray (16px top padding, 20px elsewhere from 640px): a 16:9 thumbnail with 10px corners over a pulsing seam skeleton, zooming to 1.03 over 300ms on hover; on it a 56px play disc (ground fill, 2px seam rim, ink play mark, on a ledge) that rises 8px into view on hover, always visible on touch, and sinks onto its ledge when the thumbnail is pressed. Below, the title in Title clamped to two lines, the date in Data with the "new" tag on the latest Video, and an outline "Watch now!" button with the YouTube mark pushed to the bottom, whose accessible name starts with its visible label ("Watch now: “{title}” on YouTube"). The thumbnail is the same link for the mouse, hidden from keyboards and screen readers; the tile ticks on hover. **Empty:** one raised slot with the chilling pose on its stage disc, the empty line and a subscribe secondary link.

### Friend request (signature)
The contact screen's window: a raised slot with a 2px seam border and the tray, 16px corners, padding 16px, 24px from 640px, 24px by 28px from 768px. **Left:** the waving banner pose, or the pose of what Lucas is doing live (see Chibi sprites), on its ground stage disc, the disc ringed 4px in Lucas's live status colour (Online, Away, Busy, Common offline, the seam colour while connecting; the ring eases over 300ms with Ease Out when the status changes), and under it the status tag: Tag type, full radius, 2px by 10px, the status colour as fill with `on-bright` text (ink on the seam fill while connecting), led by the device icon of the live tag. The tag is the only place the window states the status; the pose is not a button here. **Right**, centred against the chibi from 768px: "ImJustLucas" in Title Large, followed by the level chip (a 28px full-round chip, ground fill and 2px seam border, "lv" ("niv.") in muted Tag then the level in Title; the rule "1 GitHub contribution = 1 xp · 6,255 xp in total" as its native tooltip; to assistive tech "level 8"; absent when the level cannot be read, like the home page's level slot), wrapping under the name when the row is short, over the role line in muted Label; the LinkedIn DM as the screen's one Play button (full width below 640px, its label allowed to wrap, 52px at least) with the reply promise in muted Label beside it from 1024px and under it below; the outline "Add me on Discord" button linking to his Discord profile; then a 2px seam rule (20px above the row) and "also on" in muted Label with GitHub, YouTube and Instagram as 44px outline buttons with 12px padding, 8px apart, wrapping. **Opened:** pressing Play plays the confirm chord, opens LinkedIn in a new tab and swaps the mark to a check and the label to "LinkedIn's open, say hi 👋" ("LinkedIn est ouvert, dis-moi salut 👋") for 2.4 seconds, the swap instant (no motion to reduce) and announced in a polite screen-reader live region. Nothing is sent from the site, so the label never claims a request went out. The outline buttons play the press note. **Right now:** below the window, "right now" in Title over a borderless raised slot with the tray at the friends panel's fixed 76px height (12px padding) holding the same presence card in every state, so the window never moves when Lucas starts or stops a game.

**Platform marks** are lucide line icons; a mark lucide does not draw (Discord) is redrawn as a 1.75px-stroke outline with round joins so it sits with them, never a filled brand logo beside line icons.

### Not found (the 404)
The client's "wiped out" screen, where the voice gets the room the audit asked for. Both 404s draw the same `NotFoundSlot` (`components/not-found`): a raised slot with a 2px seam border and the tray, at most 34rem wide and centred in its panel, holding the sleeping pose on its ground stage disc (160px, 208px from 640px), the Headline as the page's `h1` ("Wiped out!", "Lessivé !"), one line in the muted ink at the page banner's size ("Not a wave in sight… So I'm taking a nap 😴"), then the screen's one Play button with a house icon, "Respawn at home" ("Réapparaître à l'accueil"), and the error code in muted Data under it. Padding 20px with 28px at the bottom; from 640px, 24px at the top, 40px at the sides and 36px at the bottom. The pose is not a button and the slot has no cue; Play plays confirm.
- **Locale 404** (`app/[locale]/page-not-found`): in the shell, in its Locale, centred in the content panel's height. Below 640px Play takes the full width and shows only the verb ("Respawn", "Réapparaître"); the destination stays in its accessible name. The status stays 404 (`proxy.ts` rewrites with it).
- **Global 404** (`app/global-not-found.tsx`): outside every Locale, so it speaks both, English first. The client's sparkle frame holds a single ground panel, no sidebar; the headline and line are set twice (the French in `lang="fr"`, its headline in the muted ink) from the same dictionary strings, and Play reads "Respawn · Réapparaître" and goes to the root address, which sends the visitor to their browser's Locale. On the narrowest phones its two words wrap onto two lines. It reads the visitor's palette and mode before the first paint (the palette script plus next-themes' stored mode, dark by default) since it has no ThemeProvider, and plays no sound, as it has no switch to silence it.

### Loading tip (signature)
A game's loading tip, shown only during a real wait, never behind an added delay (`components/loading-tip/`, tips and their selection in `lib/loading-tips.ts`, texts under `LoadingTips` in the dictionaries). Two waits carry one: a cabinet's game loading in the Arcade, and the MDF 2025 scene loading in the showcase (its code, then its assets; the second loader takes over the first one's tip, so the wait keeps one tip). Pages, Project windows and the quick menu are static or prefetched and show no loading screen, so they have no tip.
- **When:** only once the wait has lasted 400ms, so a fast load never flashes one; one tip per wait, never the tip shown last in the tab (kept in `sessionStorage`), never the MDF 2025 tip on its own page. Drawn at random, a feature the visitor has not tried yet (palette, mode, sound switch, Arcade, patch notes, read from the keys those features already store; the quick menu keeps none) twice as likely as a plain tip, one they used half as likely.
- **Look:** one centred line at the foot of the loading screen's well (16px in, 20px from 640px, 38ch at most, balanced): the outlined sparkle (14px, ink) inline before the word "tip" / "astuce" in Label at weight 600 in the ink, a middle dot, then the tip in muted Label. Placed absolutely, so the ring never moves; on phones the Arcade's ring sits 20px above centre, leaving the foot to a tip of three lines.
- **Copy:** Lucas's voice, first person, lowercase, one emoji, 90 characters at most: a feature to discover (⌘K and its secrets, hinted and never spelt out, the palettes and light mode, the mute, the Arcade's top 10, the add-friend screen, the patch notes, the Level, the presence, the Locale) or a small true fact about him (his coffee, his boards, his League mains, the tattoo, his handle).
- **Access:** hidden from assistive tech; the loading screen's status already announces the wait. It enters with the page change's fade and 6px rise, a fade only under reduced motion.

### Chips and tags
- **Rarity tag:** rarity fill, `on-bright` text (Navy in electric, Night in plum), Tag type, full radius, 2px by 8px.
- **Tech chip:** the Tech's own colour as fill and 2px border with computed ink, or an outline (see The Computed Ink Rule); Tag type, full radius, 2px by 10px.
- **Status tag:** the friend request's status tag (see above), the live tag in every status colour.
- **Live tag:** Online fill, `on-bright` text, led in the friends panel by the device icon; the "current team" tag on an ongoing stop and the "new" tag on the latest Video are drawn the same. **WIP tag:** 2px seam outline, ink text; the contract type tag is drawn the same.
- **Patch tags:** new, changed and fixed, 24px tall, each with its own icon (see Patch notes).

### Accordion (FAQ)
Raised rows with 16px corners, the tray and 12px gaps instead of dividers; the trigger is at least 56px tall with 20px side padding and a seam hover tint; the chevron turns over 200ms with Ease In Out; the answer is muted body text at 65ch; opening and closing play the toggle notes.

### Quick menu (signature)
The client's quick menu: a game client's command window over everything, reached from anywhere (`components/quick-menu/`, commands in `lib/quick-menu/commands.ts`). ⌘K or Ctrl+K toggles it, "/" opens it outside a field, and the triggers open it: from 768px a full-width ledge row under the tabs (raised, 44px, an 18px search mark, "quick menu" in Label, the shortcut as two keycaps pushed right), below 768px a 44px search icon button in the top bar before the sound switch. It loads on first use (its own chunk, fetched on a trigger's hover or focus, or on the first shortcut); the page ships only the shortcuts and the Konami listener.
- **Window:** a modal dialog (focus kept inside, the client inert and dimmed by the frame colour at 75%, Escape or a press outside closes it, focus back where it was), raised with a 2px seam border, 16px corners, Float and the tray, 640px at most, 12px from the viewport's edges, from 12vh down on desktop and 12px down on phones, at most 76vh tall (the viewport less 24px on phones), only its list scrolling. Its name ("quick menu") and description are for assistive tech only.
- **Field:** the Admin's input (48px, ground, 2px seam border turning the action ink at 70% while focused, 10px corners, Body size so phones never zoom, the caret in the action ink, placeholder in the muted ink at 75%) with a 20px muted search mark; on phones a 44px outline close button beside it. It is the combobox: typing filters, ↑ ↓ (looping), Home and End choose, Enter runs, and the list follows through `aria-activedescendant`; a polite live line says the number of results.
- **Rows:** sections headed by lowercase muted Tags (as in the theme menu), rows 44px with 10px corners, 4px apart: an 18px line icon (the tab's icon for a page, a backpack for a Project, the platform's mark, a 14px palette swatch ringed in the seam, the sparkle for a secret), the label in Label, then at the right the Project's rarity tag, an action-ink check on the current palette and mode, the other Locale's code in Data, or an up-right arrow on an external link. The chosen row, by keyboard or pointer, takes the action fill on its 3px action ledge with `on-action` text, like the active tab; it is the menu's one action fill.
- **Commands,** labelled in the visitor's Locale and found by words of both ("projets" finds "what i've done" on the English site), accents, case and punctuation ignored: every Route (the menu's in menu order, then MDF 2025 and the patch notes); every Project's page; play each playable cabinet (on the Arcade it opens in place); the five palettes and the three modes; the other Locale, on the same page; mute or unmute; copy this page's link, LinkedIn, GitHub, Discord and the Resume. Whole, leading and word-start matches rank first; a loose match (the query's letters in order) shows only when nothing matches closely. Sections follow their best row.
- **Notes:** opening and closing without choosing play toggle on / off, moving the chosen row ticks, and each command plays its own: a page its tab's note (MDF 2025 the unlock), a Project toggle on, a cabinet confirm, a palette, mode or Locale toggle on, a link press, the Resume and the copied link confirm; the sound command is the switch's own.
- **Secrets,** never listed, revealed by typing their words (or their first three letters): "konami" (or the Konami code typed anywhere outside a field) shows the ollie pose, otherwise drawn only in the game, with an "unlocked" live tag and the unlock; "coffee", "sleep", "gg" show the coffee, sleeping and trophy poses; "do a barrel roll" turns the client window once (refused with the laughing pose under reduced motion); "sudo hire lucas" or "hire me" grants permission, then goes to the contact screen.
- **Toast:** a raised window with a 2px seam border, 16px corners, Float and the tray, 384px at most, bottom right 24px in from 768px, full width 12px in at the bottom on phones: the pose (64px) on its ground stage disc, or a check (or a cross) on a 44px ground disc for a copied link, then the Title and one muted Label line. It is a polite status, stays 4.2 seconds, and a press dismisses it.
- **Empty:** the chilling pose (72px) on its ground stage disc over one muted line that suggests what to type.
- **Keyboard hints** (fine pointers only, under a 2px seam rule): keycaps for ↑ ↓ move, ↵ select, esc close, and the shortcut at the right. A keycap is Data at 0.75rem on a ground cap with a 2px seam rim and 6px corners, no ledge: it is not pressable.

### Theme menu
The theme switch is a 44px icon button (a sun in light, a moon in dark) that opens a raised menu (16px corners, 2px seam border, Float, 6px inner padding) in two sections, each headed by a lowercase Tag label in the muted ink and parted by a 2px seam rule: **mode** (dark, light, system), set by next-themes, and **palette** (electric blue, plum, khaki, sakura, surf), each with a 14px solid swatch in its signature colour (`PALETTE_SWATCH`), so it reads the same in every mode and never looks like a radio button. Items are 40px rows in Label, lowercase in both Locales, the seam colour on focus, an action-ink check on the current choice; choosing one plays the toggle-on note. To assistive tech each section is a group named by its label, its items `menuitemradio` with `aria-checked` on the current choice, and the switch is named "Theme and palette" ("Thème et palette"). The palette is stored per visitor in `localStorage` (`imjustlucas.palette`) and applied before the first paint by a script in the `<head>` of both root layouts, so a plum visitor never sees electric flash; the Admin follows the palette.

### Chibi sprites
**Live poses:** the banner chibi and the friend request's chibi strike the pose of what Lucas is doing (`components/presence/activity-pose.ts`): lol at a game, coding at his editor or while busy, series in front of a show, music on Spotify (stepping through its frames), coffee while away, sleeping offline; online with nothing on, or connecting, they keep their own pose. The page renders the resting pose and the live one replaces it once Lanyard answers, in the same box, so nothing shifts.
The quick menu's toasts show poses still, the ollie among them as the Konami secret. A pose's drawn frames alternate in steps (200ms each), never tweened, only while it plays (hover, a live state), on screen and without reduced motion; otherwise the first frame shows. The chibi itself never hops, slides or scales. The one exception is inside the Arcade's game screen, where Lucas is the player: in Ollie he rolls on the skate pose, swaps to the ollie pose in the air with a small tilt, tumbles on a crash and lies in the end pose; in Surf he rides on the surf-ride pose, tilts with his climb and fall, and goes in on the surf-wipeout pose (see Motion); outside the screen the rule holds.

### Sound kit and switch
One synthesized instrument (a soft plucked kalimba tine) in D major pentatonic, master gain 0.22, joined by two recorded sounds for the coins: the coin and its impact, fetched once on first use (the reward screen warms them on load).
- **Tick** (B5, very quiet): hover on tabs, item cards, inspect screen thumbnails, achievement slots, hobbies, career slots, medal slots, loadout buttons, replay tiles, patch rows, the version link, the trophy count and the quick menu's rows, and each move of its chosen row by keyboard; fine pointers only, at most one every 60ms.
- **Press** (A4): secondary controls without a cue of their own (ledge and outline buttons, socials, the theme trigger, non-legendary achievements, secondary links, the replay thumbnail).
- **Tab:** the tab's own degree (D4, E4, F#4, A4, B4, D5 in menu order; B4 is the arcade).
- **Confirm** (D4 and A4, then D5): the Play button, the Arcade's play and play again, and "visit the site" on an inspect screen.
- **Toggle on / off** (A4 to D5 / D5 to A4): opening an item card's inspect window and closing it, the menu sheet, the quick menu (closed without choosing), the accordion, turning a medal, choosing a mode or a palette, the Locale switch, the sound switch turning on, playing / pausing the showcase, resuming / pausing a run in the Arcade, opening / closing a patch row; on alone when a run lands on the leaderboard.
- **Unlock** (D4 F#4 A4 D5, then the recorded coin): the legendary achievement (and MDF 2025 chosen in the quick menu), a new best in the Arcade, 450ms after the miss, and the quick menu's Konami, gg and hire secrets, and every Trophy's toast but one Lucas's presence unlocked, which stays silent.
- **Boop** (a random high degree with a 2-semitone upward bend): the banner chibi, and the quick menu's pose secrets (coffee, sleep, a refused barrel roll).
- **Throw** (the recorded coin): throwing a coin in the showcase, by click, tap or the throw button.
- **Clink** (the recorded impact, then a quiet random high degree): a thrown coin landing on the cheque, at most once per coin every 500ms, so throwing plays a little tune. Only the visitor's coins sound; the falling ones are silent.
- **Miss** (A3 to F#3): the crash in the Arcade; defined in the kit for errors.
- **Hop** (D5 with a 2-semitone bend): the jump in Ollie, the pop in Surf.
- **Pickup** (F#5 then A5): a sparkle picked up in Ollie, a gate passed in Surf.
- **Milestone** (A4, D5, F#5): every 100 points in Ollie, every 10 gates in Surf (instead of that gate's pickup).
- **Patch** (D5, A5, then F#5, settling a step below the top): pressing the sidebar's version link.

The Arcade's cues sound only during play, after the visitor's own press starts a run, and through the same switch.
The **sound switch** is a 44px icon button, the action fill with an `on-action` speaker on the action ledge when on, raised with a struck speaker when off, with a localized label that also says when reduced motion turned sound off. It shows once in the settings row from 768px up and once in the mobile top bar below. Sound is on by default, off by default under reduced motion, stored per visitor in `localStorage`, and never plays before the first interaction or on automatic events.

### Motion
- **Ease Out** (`cubic-bezier(0.23, 1, 0.32, 1)`): hovers, entrances, page changes, the foil.
- **Ease Pop** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): the press release only, a deliberate small overshoot.
- **Ease In Out** (`cubic-bezier(0.77, 0, 0.175, 1)`): the tab fill, the accordion chevron, ambient loops.
- **Ease Drawer** (`cubic-bezier(0.32, 0.72, 0, 1)`): the mobile sheet.
- **Page change:** a 220ms fade with a 6px rise.
- **Lobby count:** each new count (and the first) rises in the same way, 220ms with Ease Out; the dot changes colour over 150ms.
- **Quick menu:** the window rises 12px from 0.98 scale and fades in over 220ms with Ease Out over the client dimmed by the frame colour (150ms); the chosen row's action fill changes in 150ms, never slides; a toast rises the same way. The barrel roll turns the whole client window once (1.1s, Ease In Out). Reduced motion: window and toast only fade, and the barrel roll is refused with a toast.
- **Trophy toast:** drops 12px from above and from 0.98 scale over 220ms with Ease Out (`toast-drop`, the window rise mirrored). Reduced motion: it only fades.
- **Inspect window:** from 768px it rises 12px from 0.98 scale and fades in over 220ms with Ease Out; below, the sheet slides up over 260ms with Ease Drawer; the dimmed client fades in over 150ms. Reduced motion: it only fades.
- **Career arrival:** each stop disc pops on (from 0.5 scale and transparent, 320ms, Ease Pop) 160ms after the one above it, and the track segment below it draws down (scaleY from its top, 160ms, Ease In Out) 120ms after its disc, so the line reaches each stop as it lands.
- **Medal turn:** 600ms rotateY with Ease Out, 600px perspective.
- **Replay hover:** the thumbnail zooms to 1.03 over 300ms and the play disc fades and rises over 150ms, both Ease Out.
- **XP fill:** a bar that starts below the fold renders full, empties at mount while off screen, and fills once when 60% of it comes into view (a clip-path reveal, 900ms, Ease Out); already on screen at mount, it stays full, so no empty frame ever flashes. Reduced motion: it never empties.
- **Reward arrival:** the unlock banner's foil crosses once, 900ms with Ease Out after a 200ms delay.
- **Showcase:** the cheque bobs slowly, coins spin and fall, stars drift. Every step is scaled to a 60fps frame and capped at 1/20s, so coins fall at the same pace at any frame rate and never jump after a tab switch. Pause freezes cheque, coins, shimmer and stars where they are (the canvas renders on demand) and orbiting still works; play resumes from there.
- **Arcade game:** the run advances in fixed steps of 1/120s, a frame counting for 0.25s at most, so the street keeps its pace at any frame rate and never leaps after a stall; a hidden tab or a blurred window pauses it. The layers scroll in parallax (clouds 0.05, skyline 0.12, façades and their lamps 0.45, the sidewalk and obstacles at full speed, so nothing in the background can pass for an obstacle), and the board bobs on the paving joints. The jump swaps the skate pose for the ollie pose, mirrored so he faces the road and tipped back 0.44 rad so the board's nose points up, then tilted a little with his climb and fall; the crash tumbles him (0.55s, easing out) under a short fading shake (0.3s), three sparkles circle his head, then from 0.6s the end pose (sleeping, or trophy on a new best) lies on the sidewalk. Sparkles bob, stars twinkle and pigeons beat their wings. **Surf** keeps the same clock and the same pause: the coast scrolls in parallax (clouds 0.04, headlands 0.08, the three swell lines 0.35, the gates and the water he rides at full speed); the swell keeps rolling on the ready screen. On the swell he rises and falls 1.5 units, the pose's own spray behind the board; in the air the surf-ride pose tilts with his climb and fall (nose up to 0.3 rad, down to 0.35 rad). The crash swaps to the surf-wipeout pose, which turns 0.9 rad and drops into the sea (0.6s, easing out) under the same 0.3s shake, three sparkles circling, with two rings of foam spreading where he went in; from 0.7s the end pose floats in the water he rode, its lower part under the front sea: the wipeout, or on a new best the surf pose with the board under his arm, waist-deep. Gulls beat their wings, the night beacons blink and the lighthouse's beam sweeps.
- **Reduced motion:** press, raise and rise distances become zero (presses change colour only, a new lobby count only fades), the sheet fades, the equaliser, breathing dot, skeleton and foil are static, and chibi sprites hold their first frame. The career path arrives drawn, medals swap faces without turning, chips and thumbnails stay put, and the play disc only fades, and filtered items appear without fading. The unlock banner shows no foil, and the showcase arrives paused with "play" offered. In the Arcade there is no tumble and no shake (the end pose comes at once), clouds and skyline stand still, the façades drift slowly (0.15), sparkles do not bob, stars do not twinkle, and the board does not bob. In Surf the headlands stand still, the swell lines drift slowly (0.12) and stop rolling, he neither bobs nor tilts, the foam rings, beam and blinking hold still, and the swell does not roll on the ready screen.

### Admin
The Owner's screen of the same client (`app/admin/`, French only), built from the same vocabulary in a calmer tone. It sets the same fonts, modes (dark by default) and the visitor's palette, every colour a role as on the site. It plays no sound (no switch, no notes, not even the theme menu's), shows no foil, and the chibi appears only on the home banner, the sign-in and content-unavailable screens, and where the pose is the value: a Hobby's row and the pose picker (the player card keeps its head). Here Online also means published and Away means something to fix.

- **Shell:** the sparkle frame round a ground sidebar and the ground panel, 24px corners, 12px apart, only the panel scrolling. The sidebar is 320px from 1024px and 272px from 768 to 1023px (the gutter's sparkles follow it), 16px padding, 24px between groups: the player card, the tabs, then, pushed to the bottom over a 2px seam rule (16px above), the footer row: the theme menu's 44px icon button, "Voir le site" as an outline ledge button filling the row (a new tab) and the sign-out 44px raised icon button (its label kept as its name; a POST, never a link). **Player card:** a raised slot with the tray (16px padding, 12px on the compact card), the chibi head in a 3px seam ring since the Admin has no live presence (56px, 40px on the compact card), "ImJustLucas" in Title Large (Title on the compact card), an "admin" tag (2px seam outline, muted Tag) and the login in muted Label from 1024px only.
- **Tabs:** Accueil, Projects, Experiences, Techs, Achievements, Hobbies, Profile, Patch notes (a scroll icon), drawn as the client's tabs (44px rows 4px apart, an 18px line icon, the seam colour at 70% on hover, the action fill sliding to the open one on its 3px action ledge over 240ms with Ease In Out, gone when no tab matches), silent. The labels are the domain's names as written, the Owner's vocabulary, not the public menu's lowercase. The **theme menu** is the site's, in French, opening upward from the footer, without its notes.
- **Mobile** (below 768px): a 56px ground top bar (the 40px head, the name in Title, the "admin" tag, the 44px menu button at the right) and the same sidebar as a sheet from 76px down, without the player card: Float, rising 24px with Ease Drawer (260ms in, 180ms out), the panel `inert` behind it; Escape, a new page or widening to 768px closes it.
- **Panel:** 16px padding at the top and sides (28px from 768px) and 64px of room at the bottom inside the scroll, so a pinned save footer meets the panel's very edge; content centred at a 56rem maximum.

**Editor banner.** Each editor opens on a compact banner, 32px above its entries: a raised slot with a 2px seam border and the tray (16px padding, 24px from 640px, 20px by 28px from 768px), the editor's name in Headline with the count in muted Data on its baseline ("9 Projects"), one muted Label line at 65ch on how the site shows these entries, and "Ajouter un …" as a 44px outline ledge button with a plus that opens the new-entry row. No chibi. The home's banner is the same slot holding "Admin", the line on where saves go (the branch in Data on a small ground chip) at the page banner's 1.0625rem, and from 640px the coding pose (120px) on its ground stage disc.

**Entry row (signature).** An entry is a raised row with the tray and 16px corners, 12px from the next, that opens in place on its form.
- **Closed:** a header button at least 64px tall (16px side padding, 20px from 640px; the seam colour at 30% on hover) holding, wrapping, what tells the entry apart: an optional thumb (an Experience's emoji on a 36px ground disc, an Achievement's art on a 40px disc, a Hobby's pose at 44px on its stage disc), the name in Title (Unbounded, truncated), facts in muted Data (a period, a year, "place 2 sur 6"), and tags (the rarity tag; WIP and contract type as 2px seam outlines; "en cours" as the live tag; "sans Tech" as a warning tag, the Away fill with `on-bright` text). While its form holds unpublished changes, an 8px Away dot and "non publié" in muted Tag sit before the chevron (the dot alone below 640px). The chevron (20px, muted) turns over 200ms with Ease In Out. Project and Achievement rows wear a 4px top band in their rarity colour, without the side frame (The Rarity Is Data Rule).
- **Open:** a 2px seam outline inset round the row, a 2px seam rule under the header, then the form (20px above, 16px at the sides and below, 20px from 640px). The form stays mounted while closed, so changes survive closing, and which rows are open is kept above the editor, so a row stays open across a save.
- **Address:** a row answers to `#kind-index` (`#project-1`, `#hobby-0`; a Tech by its id, a Resume as `#cv-fr`): arriving on one, or following a link to it, opens it and scrolls it in below the published notice.
- **Actions:** controls kept in view on the closed header (a Hobby's up and down step buttons) sit in a slot after the toggle, and the chevron stays at the row's right edge, after them.

**New-entry row.** The last row of a list, answering to `#new`: transparent with a dashed 2px seam outline, a 32px seam disc (70%) with a plus, the label in semibold Label and an optional muted hint ("ajouté en dernier"); opened, it fills raised with the tray.

**Danger zone.** Under an entry's form, past a 2px dashed seam rule with 16px either side: "Supprimer publie aussi, après confirmation." in muted Label across from the delete button.

**Techs.** A Tech has two fields, so its rows are short and always open, not rows that open: a raised row with the tray holding the Tech chip as the site draws it over its id in muted Data (a 160px column from 1024px), the name and colour fields with "Publier" in line, and the delete button (up beside the chip on narrower panels, away from "Publier").

**Fields.** A long form is grouped under small titles (muted Tag in Geist with a 2px seam rule running to the right; 24px between groups, 16px within).
- **Input:** 44px, 10px corners, the ground fill pressed into the raised row, a 2px seam border (the muted ink at 40% on hover) that turns the error colour on a field error, Body size (1rem) so phones never zoom, placeholders in the muted ink at 75%. Text areas start at 96px and grow with their content; selects are the input with a 16px muted chevron; numbers take tabular figures and years are set in Data's mono. The label sits 6px above in Label ink, a hint after "·" in the muted ink; an error sits under its field in the error colour (Label, with a circle-alert icon), and a refused save focuses the first field it names.
- **Localized text:** one field per Locale, fr then en, side by side from 1024px, each labelled by its Locale code in Data on a small ground chip (the one uppercase string) beside "Français" or "Anglais".
- **Rarity chips:** four 44px pill radios (commun, rare, épique, légendaire), ground fill with a 2px seam border and a 10px disc in the rarity's colour ringed in the seam; the chosen one takes the rarity as fill and border with `on-bright` text. None is chosen on a new entry.
- **Tech chips:** 36px pill checkboxes in Tag type, the picked ones first in their display order. Unpicked, a ground outline with a 10px disc in the Tech's colour; picked, drawn as on the site with a check: the Tech's colour as fill and border with the computed ink, or a 2px outline in that colour with the theme's ink (The Computed Ink Rule). The legend counts "3 sur 24" in muted Data, or with none shows an Away dot and "Aucune : le Project sort des filtres".
- **Pose picker:** the nine Hobby poses as radio tiles in a grid (5 columns, 9 from 640px, 5 again from 768 to 1023px): a ground tile with 10px corners and a 2px seam border, the pose (up to 64px) on a raised stage disc and its name in muted Tag; the chosen one takes an action-ink border, ink text and a seam disc.
- **Period:** start and end side by side from 1024px, each a month select ("Année seule" first) and an 88px year field. The end carries "En cours" as a 44px pill toggle, a ground outline at rest and the Online fill with `on-bright` text when on, which dims the end's date to 40%.
- **Switch:** a 44px ground row with a 2px seam border (the action ink at 70% when on) holding a 40 by 24px track (the seam colour, the action fill when on) with a 16px knob (the muted ink, `on-action` when on) that slides 16px, then the label and an optional muted hint.
- **File picker:** for an image, a 16:9 preview (112px wide, 144px from 640px; ground, 2px seam border, top-anchored crop) showing the file in place, then the one picked; beside it a dashed 2px seam area on the ground holding a 36px raised "Choisir" (then "Changer") ledge button and the file: the current path in Data, or the picked name over its size in Data ("1,2 Mo · publié avec le reste"). A file over the upload limit is stopped before it is sent; on an error the border turns solid in the error colour.
- Every chip, tile and picker shows focus as the usual 2px action-ink ring with a 2px offset.

**Save, delete and step buttons.**
- **Save:** 44px, 20px padding, semibold Label, 10px corners, on a ledge: an outline (ground fill, 2px seam border) at rest, it takes the action fill on its action ledge with `on-action` text once its form holds changes, so the lit button is the one with something to publish; a spinner and "Publication…" while it runs. On long forms (a Project, an Experience, an Achievement, new or not, and the Profile's links) it sits in a footer pinned to the panel's bottom while the form scrolls: raised, under a 2px seam rule, 12px padding, bleeding to the row's edges, the refusal under the button. Short forms (a Tech, a Hobby, a Resume) keep it in line.
- **Delete:** a quiet outline in the error ink, never filled: 44px, ground fill, 2px seam border, the label and trash icon in the error colour, on a ledge. It asks before submitting and publishes. A declared Admin exception to the Destructive button: a delete sits beside forms the Owner edits often, so it never outshouts "Publier".
- **Step:** a 36px ground ledge button without a border, an arrow then its label (the arrow alone below 1024px, the label kept as its name): a Hobby's "Monter" and "Descendre".

**Published notice.** A save that went live is announced at the top of the panel, in flow above the editor (it takes its own room, 16px above the content, and never covers the entry it names) and sticky while the panel scrolls: a raised strip with 16px corners, a 2px Online-ink border at 60% and Float; a 32px Online disc with an `on-bright` check; what went live in semibold ink ("Predi.GG publié.") then "En ligne dans environ une minute." in the muted ink; a 36px ghost close button. It enters with the page change (220ms, 6px rise), is announced as a status, and clears at the next save, the next page or when closed. Rows reached by their address land below it.

**Refusal callout.** A refused save says so under its button: a ground strip with 10px corners and a 2px border, Label ink text that starts "Rien n'a été publié" and says what to do. **Away** (the border at 70%, a triangle on a 20px Away disc with `on-bright` ink) for a conflict, with a 36px outline "Recharger la page" link on a ledge that re-reads the editor; **Busy** (the error ink at 60%, a circle icon) for every other refusal (invalid fields, refused, failed, not owner), with a "Se reconnecter" link on a ledge when the account is not the Owner's. Announced as an alert.

**Patch notes.** One entry row per patch, newest first, answering to `#patch-0`…: the version as an outline tag ("v2.12"), the French title in Title, "en ligne" as the live tag on the newest, then the date and the tag counts ("3 nouveau · 1 corrigé") in muted Data. The form is grouped **La version** (the version with a "saison.patch" hint beside a date input, the localized title, an optional link) and **Les notes**: a "Lignes" legend with the count in muted Data, then one line per entry, a bordered strip (10px corners, 2px seam border, the ground at 40%, 12px padding) holding the "Étiquette" select (Nouveau, Modifié, Corrigé) beside the fr and en fields, and a 44px remove icon button (muted trash, the error ink on hover, disabled on the last line); under them "Ajouter une ligne" as a step button with a plus, which focuses the new line's select. The new-entry row's hint suggests the next version ("v2.13 proposée") and the form starts on it and today's date in Paris.

**Home.** After the banner, 40px apart: **À faire** (Title, the count in muted Data) is one raised list with the tray, items parted by 2px seam rules: a 32px Away disc with an `on-bright` line icon, the problem in semibold ink Label, why it matters in muted Label, then 36px outline ledge links with an arrow to where to fix it (a row's address). The items come from the alert rules (`lib/admin/alerts.ts`): a Resume older than six months or older than the newest Experience's start, and a Project with no Tech; two Resumes stale for the same reason are one item with a link per Resume. With nothing to fix, one raised strip with an Online-ink check says so. **Le contenu** indexes the seven editors as one raised list (6px padding, 2px seam rules): each a 64px row with the tab's icon in a 40px ground square ringed in the seam, the name in Title, its counts in muted Data ("9 · 3 sur l'accueil", the Resumes' dates, "23 versions"), and an arrow that nudges 4px on hover over the seam colour at 40%.

**Sign-in and content unavailable.** **Sign-in** (anyone but the signed-in Owner): the sparkle frame round one ground panel, no sidebar, centring a raised slot with a 2px seam border and the tray (at most 30rem; 20px padding with 28px at the bottom, 40px at the sides and 36px at the bottom from 640px): the coding pose on its ground stage disc (144px, 160px from 640px), "Admin" in Headline, one muted line, the screen's one Play button, "Se connecter avec GitHub" (full width below 640px), and "Retour au site" as a muted link with a 2px seam underline. A signed-in account that is not the Owner's gets the sleeping pose, "Accès refusé", its login in bold ink, and "Se déconnecter" as a ledge button in place of Play. **Content unavailable** (an editor that cannot read the content branch): the same slot inside the panel (at most 36rem), the sleeping pose (128px, 144px from 640px), "Contenu indisponible", the branch in Data, the reason in Data on a ground strip with a 2px border in the error ink at 60%, a muted hint, then "Recharger" (outline) beside "Se déconnecter".

## Do's and Don'ts

### Do:
- **Do** let the palette's own frame, ground and raised colours own the whole shell (Navy Frame #05081c, Navy #0a0f2e and Navy Raised #141c48 by default), through the role tokens rather than fixed colours, so every component works in both palettes and both modes.
- **Do** keep the action fill to the Play button, the active tab, the sound switch when on, selection and, in the Admin, a save button whose form has changes, and the action ink to focus, the menu check and link text.
- **Do** derive every stat from `content/`, the dictionaries or a live source (Lanyard, GitHub, YouTube), and hide a missing number rather than show zero.
- **Do** compute the ink on Tech colours and use the deep `-ink` variants for coloured text in light.
- **Do** give every pressable control a ledge, a 44px target and a note from the kit (the Admin's controls stay silent).
- **Do** use an outline button (ground fill, 2px seam border) for secondary actions sitting on a raised surface.
- **Do** keep the sound switch visible on every page that plays sound (the Admin plays none) and honour reduced motion for both motion and sound.
- **Do** write every new string in both Locales and keep the lowercase, casual voice.
- **Do** open a profile screen with the page banner (Headline, one line, a chibi pose on its stage disc) when it has a pose of its own.
- **Do** keep a game screen in its own palette and everything round it in the role tokens (The Screen Keeps Its Own Palette Rule).

### Don't:
- **Don't** invent game stats: no rank, KDA, win rate or achievement Lucas did not earn. The one level and its xp are derived from his GitHub contributions, live, and the slot says so; never a level, xp or rank from anything else.
- **Don't** use rarity colours for decoration, headings or backgrounds.
- **Don't** hard-code Tangerine, Electric, Off-white or Night for the action or for text on a bright fill; use `action`, `action-ledge`, `action-ink`, `on-action` and `on-bright`.
- **Don't** drift into esports HUD aggression: no chamfered corners, scanlines, hex grids, glowing neon edges or forced uppercase.
- **Don't** go back to neutral zinc surfaces with colour only from content.
- **Don't** play sound automatically, on hover for touch pointers, from presence updates, or anywhere the visitor cannot silence it.
- **Don't** put blur or soft shadows on anything that does not float above the client.
- **Don't** let the chibi hop, slide or tween; its movement lives in its drawn frames. The Arcade's game screen is the one exception (see Chibi sprites).
- **Don't** make the presence card disappear or change height; it always shows a state.
