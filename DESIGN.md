---
name: ImJustLucas
description: Lucas's personal site as his player profile, a cosy game client in plum and tangerine where his work, wins and live presence are the stats.
colors:
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
    backgroundColor: "{colors.tangerine}"
    textColor: "{colors.night}"
    typography: "{typography.button-play}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-ledge:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-icon:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    size: "44px"
  sound-toggle-on:
    backgroundColor: "{colors.tangerine}"
    textColor: "{colors.night}"
    rounded: "{rounded.md}"
    size: "44px"
  tab:
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  tab-active:
    backgroundColor: "{colors.tangerine}"
    textColor: "{colors.night}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  content-panel:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.cream}"
    rounded: "{rounded.xl}"
    padding: "{spacing.panel}"
  player-card:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "16px"
  item-card:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  achievement-slot:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "16px"
  presence-card:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "12px"
  rarity-tag:
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  tech-chip:
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

<!-- SEED: chosen with Lucas on 2026-10-20 in the Impeccable world workshop (seed 14c08ff6), before implementation. Values below are decided and contrast-checked, but no page uses them yet; re-run /impeccable document once the home page and shell are built so this file describes the shipped world. -->

# Design System: ImJustLucas

## Overview

**Creative North Star: "The Player Profile"**

The site is Lucas's player profile in a cosy game client. The sidebar is the client chrome: the player card with the chibi and its live status ring, the tabs (the lowercase menu), the friends panel where his Discord presence lives, and the settings row with the sound switch. The content panel is the profile screen: a banner with who he is and the team he plays for right now, a showcase of real achievements with MasterDevFrance 2025 as the legendary one, an inventory of Projects framed by rarity, and a match history of Experiences. Every stat on screen is a real fact from `content/` or a live source; the game is the frame, never the claim.

It is a cosy client, not a competitive one: deep plum instead of hextech navy and gold, soft fat corners, chunky buttons that sink when pressed, warm cream text, candy rarity colours, and a single tangerine accent that means "this is the thing to press". Everything clickable answers with a short note from one instrument, so moving around the site sounds like a little melody, and one visible switch silences it all.

Density is relaxed: big slots with generous gaps, one focal object per row. The voice stays exactly as PRODUCT.md binds it (first person, "Yoooo", emojis, lowercase menu labels); the world makes room for it instead of dressing it up. Anti-references: the previous "Dev's Desk" zinc shell (colour only through content, no accent), terminal or IDE costumes, near-black with a neon accent, and esports HUD aggression (angular chamfers, scanlines, rank emblems).

**Key Characteristics:**
- Two-zone client: a 320px sidebar (player card, tabs, live friends panel, settings) beside a rounded plum profile panel.
- Plum owns the whole shell in the default dark theme; a lilac "daytime lobby" theme is the alternative.
- One accent, tangerine, for the primary action, the active tab, focus and selection.
- Rarity colours (common, rare, epic, legendary) carry meaning on content, never decoration.
- Chunky, pressable controls with a visible ledge; slots and cards with soft 16px corners.
- A one-instrument sound kit in D major pentatonic, on by default, with a global mute that is always visible.
- The chibi is the mascot: poses, reactions, empty states.

## Colors

A committed plum world: the shell is the colour, with cream type, one tangerine accent and a four-step rarity ramp that labels content.

### Primary
- **Tangerine** (#ff8a3d): the accent. Fills the Play button (Download my resume), the active tab, the sound switch when on, selection and keyboard focus rings in the dark theme. Text on it is always Night (7.8:1). It stays under a tenth of any screen; its rarity is what makes "press here" obvious.
- **Tangerine Ledge** (#c25a12): the solid edge under tangerine controls (the button's bottom face), never text.
- **Tangerine Deep** (#b8470c): tangerine's role as text, link underline and focus ring in the light theme (4.8:1 on Lilac Wash).

### Rarity (functional)
Rarity says what kind of thing an item is, set per item in the Admin. It is never a quality score and never invented.
- **Legendary** (#ffd84d / deep #8a6200): wins and awards of national level. Today only MasterDevFrance 2025; nothing lesser is promoted to fill the tier.
- **Epic** (#b47cff / deep #7a3fd1): products Lucas founded or co-founded and runs in production (Predi.GG).
- **Rare** (#46c2ff / deep #0b6fa8): shipped products and real client or employer work (Qotum, Tricks, Bam Karaoke).
- **Common** (#b9a9cc / deep #6b5a80): side projects, boilerplates, experiments.

### Status (functional)
Discord's own presence vocabulary, used only for the player card ring and the friends panel.
- **Online** (#5fe08a / deep #1d7a45), **Away** (#ffb02e), **Busy** (#ff5d73 / deep #c0233d), offline uses **Common**.
- **Busy** and **Busy Deep** double as the error colour in the Admin (dark and light).

### Neutral (dark theme, "LAN night", the default)
- **Night** (#1c0f2b): the window frame around the panel, carrying a faint sparkle pattern; also the text colour on every bright fill.
- **Plum** (#2a1540): the shell ground, sidebar and content panel.
- **Velvet** (#3b2159): raised surfaces: player card, slots, item cards, ledge buttons, presence card.
- **Seam** (#5a3a80): slot borders, dividers, the inactive tab hover fill.
- **Cream** (#fff1e6): primary text (14.8:1 on Plum, 12.3:1 on Velvet).
- **Haze** (#c9b6e4): secondary text, periods, artist lines (7.3:1 on Velvet).

### Neutral (light theme, "daytime lobby")
- **Lilac Frame** (#e9ddfa): the window frame. No text sits directly on it.
- **Lilac Wash** (#f6f0ff): the shell ground.
- **Sheet** (#ffffff): raised surfaces.
- **Seam Light** (#d6c3f0): borders and dividers.
- **Plum** (#2a1540): primary text (14.7:1 on Lilac Wash). **Dusk** (#5b4a73): secondary text (7.1:1).
- In light, bright rarity and status colours stay as fills and 2px frames with Night text; whenever they become text or a thin line on a light surface, use their deep variant (all 4.8:1 or more on Lilac Wash and Sheet).

### Named Rules
**The Plum Owns the Shell Rule.** In the dark theme the frame, sidebar and panel are Night, Plum and Velvet. Never fall back to a neutral grey surface with colourful accents; the colour is the room, not the furniture.

**The One Tangerine Rule.** Tangerine marks the single most important action or state in view: the Play button, the active tab, the sound switch when on, focus. A second tangerine button on the same screen means one of them is wrong.

**The Rarity Is Data Rule.** A rarity colour appears only on an item whose rarity field says so, as its frame, top band and tag. Never use the rarity hues for headings, backgrounds or decoration.

**The Computed Ink Rule.** Text on any coloured fill (rarity, status, a Tech's own colour) is whichever of Night or Cream gives the higher contrast ratio, computed, never chosen by hand. A Tech chip that fails 4.5:1 with both is drawn as an outline in the Tech colour instead.

## Typography

**Display Font:** Unbounded (with Geist, ui-sans-serif, system-ui)
**Body Font:** Geist (with ui-sans-serif, system-ui)
**Data Font:** Geist Mono (with ui-monospace, SFMono-Regular)

**Character:** Unbounded is the game title: wide, round-shouldered and heavy, friendly at 700 and never aggressive. Geist does the reading and the controls, so menus and paragraphs stay plain and fast. Geist Mono, with tabular figures, sets the stats: dates, periods, star counts, elapsed time.

**Wiring.** Unbounded is a variable Google font (weights 200 to 900, Latin Extended for French) loaded through `next/font/google` and exposed as `--font-display` beside the existing `--font-geist-sans` and `--font-geist-mono`; set on `body` or below, never on `html`.

### Hierarchy
- **Display** (Unbounded 700, clamp(2.25rem, 1.6rem + 2.2vw, 3.5rem), line-height 1.05, -0.02em): the greeting on the profile banner ("Yoooo, I'm Lucas!"). One per page at most.
- **Headline** (Unbounded 700, 1.75rem, line-height 1.15, -0.015em): page titles, one visible `h1` per page.
- **Title** (Unbounded 600, 1.125rem, line-height 1.3): section titles (achievements, inventory, match history), item and achievement names, the player name in the sidebar (at 1.375rem).
- **Button Play** (Unbounded 700, 1.0625rem): the label of the Play button only.
- **Body** (Geist 400, 1rem, line-height 1.65): paragraphs, capped at 65ch.
- **Label** (Geist 500, 0.875rem): tabs, buttons, presence lines, chip text at rest.
- **Tag** (Geist 600, 0.75rem, +0.02em): rarity tags, "live" and "new" tags, Tech chips.
- **Data** (Geist Mono 500, 0.8125rem, tabular numbers): periods, dates, star counts, elapsed time.

### Named Rules
**The Copy Keeps Its Case Rule.** Type is set in the case the copy is written in. Unbounded is never forced to uppercase: the lowercase menu labels and the casual voice are binding, and shouting caps would turn the cosy client into an esports HUD.

**The Typography Primitives Rule.** Text still goes through `components/typography`, which gains the display, headline and data roles; a raw heading with its own sizes is drift.

## Layout

The client fills the viewport (`100dvh`, no page scroll) inside a 12px Night frame; only the content panel scrolls.

- **Sidebar** (320px from 768px up), top to bottom: the player card, the tabs 24px below, the friends panel, then the settings row (sound, Locale, theme) and the social row pushed to the bottom.
- **Content panel**: the rest of the width, 24px corners, 28px padding (16px on mobile), Plum ground.
- **Profile pages** are built from slots on a 12-column grid with 12px gaps and 48px between sections. Full-width rows alternate with rows of 2 or 3 slots so the scroll has a rhythm: a dense inventory row earns a quiet text row after it.
- **Reading text** (bio, FAQ) holds a 65ch column inside its slot, never the full panel width.
- **Mobile** (below 768px): a 56px top bar (chibi head, name, sound switch, menu button, all 44px targets) replaces the sidebar. The menu opens as a full-screen client sheet holding the same sidebar, mounted once and restyled (`docs/routing.md`). Slot rows collapse to one column; the achievement showcase becomes a horizontal snap row.
- The fixed corner chibi of the previous site is retired; the mascot lives in the player card, the banner and empty states, where it covers nothing.

## Elevation & Depth

Depth is tonal first (Night, then Plum, then Velvet; Lilac Frame, Lilac Wash, Sheet in light) and tactile second: controls have a solid ledge underneath, as if they were real buttons on a console, and slots have a faint top highlight like a moulded tray. Soft blurred shadows exist only for things that float.

### Shadow Vocabulary
- **Ledge** (`box-shadow: 0 4px 0 var(--ledge)`, where the ledge is the control's own darker shade, Tangerine Ledge for tangerine controls, Night for Velvet ones): every pressable control at rest. Pressing moves the control down 4px and the ledge to 0.
- **Ledge Raised** (`box-shadow: 0 6px 0 var(--ledge)` with `translateY(-2px)`): hover on pressable controls and on item cards that link somewhere.
- **Tray** (`box-shadow: inset 0 1px 0 rgb(255 241 230 / 0.08)`): the top highlight inside slots, cards and the player card in the dark theme.
- **Float** (`box-shadow: 0 24px 48px -12px rgb(12 4 22 / 0.6)`): tooltips, the theme menu, the mobile client sheet.

### Named Rules
**The Real Button Rule.** Anything pressable has a ledge and sinks when pressed; anything with a ledge is pressable. Static cards never get one.

**The Float Means On Top Rule.** Blurred shadows and backdrop blur belong only to layers above the client (tooltips, menus, the mobile sheet).

## Shapes

Fat, friendly corners from one scale: 24px for the panel, 16px for slots, cards and the player card, 10px for buttons, tabs and artwork, full circles for avatars, status rings and chips. Borders are 2px, never hairlines: Seam on resting slots, the rarity colour on items (with a 4px top band in the same colour), Tangerine for focus (2px ring with a 2px offset). No angular chamfers, notched corners or clip-path frames.

Materials:
- **Sparkle backdrop**: a tiled SVG of small four-point sparkles on the Night frame only, at 6% opacity (4% in light on Lilac Frame). Never behind text.
- **Legendary foil**: legendary items get a slow foil sheen (a moving light band across a pale gold gradient) only while hovered or during their unlock moment; at rest they are flat Legendary.
- **Chibi art**: the ImJustLucas chibi in the existing style, transparent, in poses tied only to his real life (surf, skate, playing LoL, coding, coffee, watching a series, music, plus chilling, sleeping, waving and the trophy). Every pose keeps the commissioned artist's style; art is produced once, versioned in `public/images/chibi/`, and the hobby list behind it lives in the content, editable in the Admin.

## Motion and Sound

Motion and sound are one grammar: a control moves the way a button moves and plays one note when it does. Nothing moves or sounds on its own except the live presence, which may move but never sounds.

### Motion tokens
- **Ease Out** (`cubic-bezier(0.23, 1, 0.32, 1)`): every hover, entrance and state change.
- **Ease Pop** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): small overshoots on press release, tag and badge entrances, the chibi hop.
- **Ease In Out** (`cubic-bezier(0.77, 0, 0.175, 1)`): the sliding tab indicator and the accordion chevron.
- **Ease Drawer** (`cubic-bezier(0.32, 0.72, 0, 1)`): the mobile client sheet.
- **Durations:** press down 80ms, release 160ms; hover 150ms; tab indicator 240ms; page change 220ms (fade and a 6px rise, through View Transitions where supported); mobile sheet 260ms in, 180ms out; unlock moment 900ms.

### Signature moves
- **The press:** pressable controls sink 4px onto their ledge and pop back with Ease Pop.
- **The tab slide:** the tangerine active-tab fill slides between tabs instead of jumping.
- **The unlock:** the legendary achievement plays its foil sheen once per session when it first scrolls into view; clicking it replays the sheen with the unlock sound.
- **Live presence:** three equaliser bars while Lucas listens, a breathing green dot while he plays; a new song or game crossfades in over 200ms.
- **The chibi:** blinks now and then; on click it hops, swaps to a random pose and plays a boop.

### Sound kit
One instrument (a soft plucked kalimba tine) in one key (D major pentatonic: D, E, F#, A, B, over two octaves), synthesized with Web Audio so it costs no download. Recorded samples are allowed later only if they keep the same instrument and key.
- **Tick** (B5, very quiet): hover on tabs and item cards, fine pointers only, at most one every 60ms.
- **Tab**: each menu item plays its own degree in menu order (me D4, what i've done E4, how i do it F#4, my experiences A4, yt videos B4, contact D5), so walking down the menu plays a scale.
- **Confirm** (D4 and A4 together, then D5): the Play button and other primary actions.
- **Toggle on / off** (A4 to D5 / D5 to A4): theme, Locale, accordion, the sound switch itself (only the "on" direction is audible).
- **Unlock** (arpeggio D4 F#4 A4 D5, then the existing `coin.mp3`): clicking the legendary achievement.
- **Boop** (a random degree with a short upward bend): clicking the chibi.
- **Miss** (A3 to F#3): the 404 page's button and Admin errors.

### Sound switch
A speaker button, always visible: first in the sidebar settings row and in the mobile top bar, 44px, Tangerine when sound is on, Velvet with a struck speaker when off, with a localized label ("sound on" / "son activé") for assistive tech and as a tooltip. Sound is on by default and off by default when the visitor's system asks for reduced motion. The choice is stored per visitor in `localStorage` and also governs the MDF 2025 scene. No sound ever plays before the visitor's first interaction, on automatic events (presence updates, page loads, scroll), or above a master gain of 0.25.

### Reduced motion
Under `prefers-reduced-motion: reduce`: no translation, scale or rotation (presses and tabs change colour only), fades of 150ms or less, ambient loops (equaliser, breathing dot, sparkles, foil) shown static, and sound off unless the visitor turns it on.

## Components

Every control is rebuilt in the client's vocabulary; a stock shadcn look inside the client is a lapse. shadcn and Radix stay as the behaviour layer.

### Buttons
- **Shape:** 10px corners, 2px focus ring in Tangerine (Tangerine Deep in light) with a 2px offset.
- **Play** (primary): Tangerine fill, Night label in Unbounded 700, 52px tall, 24px side padding, Tangerine Ledge underneath; one per screen (the Play button is "Download my resume" on the home page).
- **Ledge** (secondary): Velvet fill, Cream label, Night ledge, 44px tall; Sheet fill, Plum label and Seam Light ledge in light.
- **Icon:** 44px square ledge buttons for settings and socials, with `sr-only` labels.
- **States:** hover raises 2px with a 6px ledge; press sinks onto the ledge; disabled drops the ledge and goes to 50% opacity.

### Tabs (the menu)
- **Style:** full-width 44px rows in Geist 500, lowercase labels from the message dictionaries, an icon slot on the left.
- **Hover:** Seam fill and the tick sound. **Active:** the sliding Tangerine fill, Night text, `aria-current="page"`. **Focus-visible:** the Tangerine ring.
- **Mobile:** the same tabs inside the full-screen client sheet; choosing one plays its note and closes the sheet.

### Player card (signature)
Velvet slot at the top of the sidebar: the chibi head (64px) in a 3px status ring coloured by Lucas's real Discord status, the name "ImJustLucas" in Unbounded, and one Haze line with his role and city from the dictionaries. No level, rank or XP numbers.

### Friends panel / presence (signature)
Always rendered, titled with a live tag. **Playing:** game art 48px, game name, elapsed time in Data, breathing dot. **Listening:** album art 48px with the Spotify mark, title and artist, equaliser bars. **Online with no activity, away, busy:** the chibi head with the status and a playful line. **Offline or unreachable:** "offline" in Common with a chibi sleeping pose. **Connecting:** a skeleton of the same size, so the sidebar never jumps. Presence never plays a sound.

### Item card (Projects)
Velvet card, 16px corners, 2px frame and 4px top band in the item's rarity colour, rarity tag top-right. Image band (10px corners, top-anchored crop), title in Unbounded 600, one line saying what it is and Lucas's role, the Tech loadout as chips, and a footer with the GitHub ledge button and its live star count in Data. Heights follow content; rows align by grid, not by fixed height.

### Achievement slot (signature)
Square-ish slot with the achievement art centred, its name in Title, the year in Data and the rarity tag; legendary slots carry the foil material and link to their page (MDF 2025 links to `/mdf-2025`).

### Chips
- **Tech chip:** the Tech's own colour as fill with computed ink (see The Computed Ink Rule), full radius, Tag type.
- **Rarity tag:** rarity fill, Night text, full radius. **Live / New tags:** Online or Tangerine fill, Night text.

### Match history (Experiences timeline)
One continuous vertical track from the first internship to today: each Experience is a row with its period in Data, company and role, contract type and description; ongoing rows sit at the top with a "live" tag and an Online dot, and the track is solid Seam behind finished rows and Tangerine behind ongoing ones.

### Accordion (FAQ)
Velvet rows with 16px corners and 12px gaps instead of hairline dividers; a chevron that rotates over 200ms with Ease In Out and the toggle sounds.

### Admin
The Admin keeps its forms and works on the same tokens in a calmer register: Lilac Wash or Plum page, Sheet or Velvet fields with 2px Seam borders, Busy for errors, Online Deep or Online for the saved notice. No sounds in the Admin except Miss on an error.

## Do's and Don'ts

### Do:
- **Do** let Plum (#2a1540), Night (#1c0f2b) and Velvet (#3b2159) own the whole dark shell, and Lilac Wash (#f6f0ff) the light one.
- **Do** keep Tangerine (#ff8a3d) to one primary action per screen plus the active tab, the sound switch and focus.
- **Do** derive every stat from `content/`, the dictionaries or a live source (Lanyard, GitHub, YouTube), and label live data with its state.
- **Do** compute the ink on every coloured fill and use the deep variants for coloured text in light.
- **Do** give every pressable control a ledge, a 44px target and a note from the kit.
- **Do** keep the sound switch visible on every page and honour reduced motion for both motion and sound.
- **Do** write every new string in both Locales and keep the lowercase, casual voice.

### Don't:
- **Don't** invent game stats: no level, rank, XP, KDA, win rate or achievement Lucas did not earn.
- **Don't** use rarity colours for decoration, headings or backgrounds.
- **Don't** drift into esports HUD aggression: no chamfered corners, scanlines, hex grids, glowing neon edges or forced uppercase.
- **Don't** go back to neutral zinc surfaces with colour only from content.
- **Don't** play sound automatically, on hover for touch devices, or anywhere the visitor cannot silence it.
- **Don't** put blur or soft shadows on anything that does not float above the client.
- **Don't** make the presence card disappear; it always shows a state.
