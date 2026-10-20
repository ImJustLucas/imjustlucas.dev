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
  button-outline:
    backgroundColor: "{colors.plum}"
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
  sound-switch-on:
    backgroundColor: "{colors.tangerine}"
    textColor: "{colors.night}"
    rounded: "{rounded.md}"
    size: "44px"
  sound-switch-off:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
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
  sidebar:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.cream}"
    rounded: "{rounded.xl}"
    padding: "16px"
    width: "{spacing.sidebar}"
  mobile-top-bar:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.cream}"
    rounded: "{rounded.xl}"
    height: "56px"
  player-card:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "16px"
  banner:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "28px"
  slot:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  item-card:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  achievement-slot:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "20px"
  presence-card:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "12px"
    height: "76px"
  accordion-row:
    backgroundColor: "{colors.velvet}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  team-chip:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px 0 10px"
    height: "40px"
  rarity-tag:
    textColor: "{colors.night}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  tech-chip:
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  live-tag:
    backgroundColor: "{colors.online}"
    textColor: "{colors.night}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: ImJustLucas

## Overview

**Creative North Star: "The Player Profile"**

The site is Lucas's player profile in a cosy game client. The sidebar is the client chrome: the player card with the chibi head in its live status ring, the tabs (the lowercase menu), the friends panel where his Discord presence lives, the settings row (sound, Locale, theme) and the socials. The content panel is the profile screen: on the home page a banner with who he is and the team he plays for right now, a showcase of real achievements with MasterDevFrance 2025 as the legendary one, an inventory of featured Projects framed by rarity, an about slot beside his hobbies, the FAQ, and a goodbye. Every stat on screen is a real fact from `content/` or a live source; the game is the frame, never the claim.

It is a cosy client, not a competitive one: deep plum instead of hextech navy and gold, soft fat corners, chunky buttons that sink onto a ledge when pressed, warm cream text, candy rarity colours, and a single tangerine accent that means "this is the thing to press". Pressable things answer with one note of a single instrument, so moving around the site plays a little melody, and one visible switch silences it all.

Density is relaxed: big slots with generous gaps, one focal object per row. The voice stays as PRODUCT.md binds it (first person, "Yoooo", emojis, lowercase menu labels). Anti-references: the previous "Dev's Desk" zinc shell (colour only through content, no accent), terminal or IDE costumes, near-black with a neon accent, and esports HUD aggression (angular chamfers, scanlines, rank emblems).

**Key Characteristics:**
- Two-zone client inside a 12px Night frame: a 320px Plum sidebar beside a rounded Plum profile panel, the only part that scrolls.
- Plum owns the whole shell in the default dark theme ("LAN night"); a lilac "daytime lobby" theme is the alternative, through the same role tokens.
- One accent, tangerine, for the Play button, the active tab, the sound switch when on, selection and focus.
- Rarity colours (common, rare, epic, legendary) frame content by its rarity field, never decoration.
- Chunky pressable controls on a solid ledge; Velvet slots and cards with soft 16px corners and a moulded-tray highlight.
- A one-instrument kalimba kit in D major pentatonic, on by default, behind an always-visible switch.
- The chibi is the mascot: stepped-frame poses on the banner, in the hobbies, the presence card and the goodbye.

## Colors

A committed plum world: the shell is the colour, with cream type, one tangerine accent and a four-step rarity ramp that labels content. Every colour is a role token that flips with the theme (frame, ground, raised, seam, ink, ink-muted, ledge, and the `-ink` variant of each accent), and the shadcn roles (background, card, primary, border, ring, destructive…) are mapped onto them, so every page and the Admin inherit the world without restyling.

### Primary
- **Tangerine** (#ff8a3d): the accent. Fills the Play button, the sliding active-tab fill, the sound switch when on, and text selection (with Night text). In the dark theme it is also the focus ring and a link's hover colour. Text on it is always Night.
- **Tangerine Ledge** (#c25a12): the solid face under tangerine controls, never text.
- **Tangerine Deep** (#b8470c): tangerine as text, link and focus ring in the light theme (the role `tangerine-ink`); in dark that role is Tangerine itself.

### Rarity (functional)
Rarity says what kind of thing an item is, set per item in the Admin. It is never a quality score and never invented.
- **Legendary** (#ffd84d, deep #8a6200): national-level wins. Today only MasterDevFrance 2025. **Legendary Ledge** (#8a6200) is the ledge under the legendary achievement slot.
- **Epic** (#b47cff, deep #7a3fd1): products Lucas founded or co-founded and runs in production.
- **Rare** (#46c2ff, deep #0b6fa8): shipped products and real client or employer work.
- **Common** (#b9a9cc, deep #6b5a80): side projects, boilerplates, experiments. Its frame is drawn at 70% opacity (Common in dark, Common Deep in light) so it reads as the quiet tier.

### Status (functional)
Discord's presence vocabulary, used for the status ring, the presence dots and the live tag.
- **Online** (#5fe08a, deep #1d7a45): online ring, the breathing dot, the equaliser bars, the live tag fill.
- **Away** (#ffb02e): idle ring and dot. **Busy** (#ff5d73, deep #c0233d): do-not-disturb ring and dot. Offline uses **Common** (its label in Common's ink); connecting uses **Seam**.
- **Busy Deep** in light and **Busy** in dark are also the destructive and error colour.

### Neutral (dark theme, "LAN night", the default)
- **Night** (#1c0f2b): the window frame around sidebar and panel, carrying the sparkles; the ledge under Velvet controls; and the text on every bright fill.
- **Plum** (#2a1540): the ground: sidebar, content panel, mobile top bar, the fill of outline buttons and team chips, the chibi's stage disc.
- **Velvet** (#3b2159): raised surfaces: player card, banner, slots, item cards, accordion rows, presence card, ledge and icon buttons, the theme menu.
- **Seam** (#5a3a80): 2px borders, the tab hover fill (at 70%), menu item focus, skeletons, scrollbar thumb.
- **Cream** (#fff1e6): primary text.
- **Haze** (#c9b6e4): secondary text: role lines, periods, descriptions, artist lines, section labels.

### Neutral (light theme, "daytime lobby")
- **Lilac Frame** (#e9ddfa): the window frame. No text sits directly on it.
- **Lilac Wash** (#f6f0ff): the ground.
- **Sheet** (#ffffff): raised surfaces.
- **Seam Light** (#d6c3f0): borders, dividers, and the ledge under Sheet controls.
- **Plum** (#2a1540): primary text. **Dusk** (#5b4a73): secondary text.
- In light, bright rarity and status colours stay as fills, bands and 2px frames with Night text; as text or a thin line on a light surface they switch to their deep variant.

### Named Rules
**The Plum Owns the Shell Rule.** In the dark theme the frame, sidebar and panel are Night, Plum and Velvet. Never fall back to a neutral grey surface with colourful accents; the colour is the room, not the furniture.

**The One Tangerine Rule.** A Tangerine fill marks the single most important action or state in its zone: the Play button in the panel, the active tab and the sound switch in the chrome, plus focus and selection. A second Tangerine-filled button in the panel means one of them is wrong. Secondary links stay Cream with a Haze underline in dark (Tangerine only on hover) and use Tangerine Deep as their ink in light.

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
- **Body** (Geist 400, 1rem, 1.65): paragraphs, capped at 65ch (the FAQ column at 72ch). The banner role line is Body at weight 500 in Haze, 1.0625rem, rising to 1.25rem from 768px.
- **Label** (Geist 500, 0.875rem): tabs, buttons, chips, presence lines, small section labels ("current team", "friends").
- **Tag** (Geist 600, 0.75rem, +0.02em): rarity tags, live and WIP tags, Tech chips.
- **Data** (Geist Mono 500, 0.8125rem, tabular figures): periods, dates, star counts, elapsed time (m:ss), the resume date, the Locale code.

### Named Rules
**The Copy Keeps Its Case Rule.** Type is set in the case the copy is written in. Unbounded is never forced to uppercase; the lowercase menu labels and casual voice are binding. The one uppercase string is the two-letter Locale code, in Data.

**The Typography Primitives Rule.** Text goes through `components/typography` (Display, Headline, Title, Data, Tag, P, Muted), with the element chosen by `as` so the look never dictates the outline. A raw heading with its own sizes is drift.

## Layout

The client fills the viewport (`100dvh`, no page scroll) inside a 12px Night frame with 12px gutters; only the content panel scrolls.

- **Sidebar** (320px from 768px up, Plum, 24px corners, 16px padding, 24px between groups), top to bottom: the player card, the six tabs (44px rows, 4px apart), the friends panel, then the settings row (sound, Locale, theme) and the social row pushed to the bottom.
- **Content panel**: the remaining width, 24px corners, 28px padding (16px below 768px), Plum ground. Page content is centred at a 1180px maximum width, with 48px between sections and 16px between a section title and its row.
- **Rows** are plain CSS grids with 12px gaps, not a 12-column system: featured Projects run 1, 2 (768px) then 3 (1280px) columns; the about row splits 1:1 from 1024px; two or three achievements sit 2fr / 1fr / 1fr with the rarest first, while a single one takes the full row as a wide slot.
- **Banner**: from 768px a two-column grid, the chibi (200 to 260px) on the left spanning greeting, role, current team and actions, with a minimum height of 340px; below 768px the chibi shrinks to 120px beside the greeting and the role, team and actions run full width, the Play button full width below 640px.
- **Reading text** holds 65ch inside its slot, never the full panel width.
- **Mobile** (below 768px): a 56px Plum top bar (40px chibi head, name, sound switch, menu button) replaces the sidebar column. The same sidebar, mounted once, becomes a full-width sheet from 68px down, sliding up with Ease Drawer (260ms in, 180ms out), with the player card hidden and the panel `inert` behind it. Escape or widening to 768px closes it. Achievements with more than one slot become a horizontal snap row.
- **Breakpoints** are Tailwind's: 640, 768 (the client's one structural switch), 1024, 1280.

## Elevation & Depth

Depth is tonal first (Night, then Plum, then Velvet; Lilac Frame, Lilac Wash, Sheet in light) and tactile second: pressable controls stand on a solid ledge like console buttons, and slots carry a one-pixel top highlight like a moulded tray. A soft blurred shadow exists only for layers that float above the client.

### Shadow Vocabulary
- **Ledge** (`box-shadow: 0 4px 0 rgb(var(--ledge))`): every pressable control at rest. The ledge is Night under Velvet and Plum controls, Seam Light under Sheet, Tangerine Ledge under tangerine controls, Legendary Ledge under the legendary slot.
- **Ledge Raised** (`0 6px 0` with `translateY(-2px)`): hover, on hover-capable pointers only.
- **Ledge Pressed** (`0 0 0` with `translateY(4px)` and `brightness(0.94)`): active; the control sits on its ledge.
- **Tray** (`inset 0 1px 0 rgb(255 241 230 / 0.08)` in dark, `inset 0 1px 0 rgb(255 255 255 / 0.9)` in light): the top highlight inside the player card, banner, slots, item cards, accordion rows and presence card.
- **Float** (`0 24px 48px -12px rgb(12 4 22 / 0.6)` in dark, `0 24px 48px -12px rgb(42 21 64 / 0.28)` in light): the mobile sheet and menus.

### Named Rules
**The Real Button Rule.** Anything pressable has a ledge and sinks onto it when pressed; anything with a ledge is pressable. Static cards and slots never get one. Ghost and link controls are not raised controls and have none.

**The Float Means On Top Rule.** Blurred shadows belong only to layers above the client (the mobile sheet, menus).

## Shapes

Fat, friendly corners from one scale: 24px for the frame's two zones (sidebar, panel, mobile top bar and sheet), 16px for slots, cards, the banner, accordion rows and menus, 10px for buttons, tabs, artwork and screenshots, full circles for the chibi head, the chibi's stage discs, status dots and all chips and tags. Borders are 2px, never hairlines: Seam on the banner, outline buttons, team chips and WIP tags; the rarity colour on items. Plain slots (player card, about, hobbies, presence, accordion) are borderless Velvet with the tray highlight. Focus is a 2px ring in Tangerine (Tangerine Deep in light) with a 2px offset (inset on accordion rows). No angular chamfers, notched corners or clip-path frames.

Materials:
- **The sparkle**: Lucas's hand tattoo, an outlined four-point star with slightly concave sides, the site's one ornament. On the frame it is drawn whole and small (8px and 6px stars, outlined) running along the 12px gutters only, including the gutter between sidebar and panel, at stroke opacity 0.12 in Cream on Night and 0.08 in Plum on Lilac Frame; it is never clipped and never behind text. Filled in Legendary, it marks legendary achievements in their top-right corner.
- **Legendary foil**: a pale gold light band sweeps across a legendary slot over 900ms with Ease Out, once per session when it first scrolls into view, again on hover and on click; at rest the slot is flat.
- **Chibi art**: the ImJustLucas chibi as transparent square WebP poses (`public/images/chibi/`, registry `lib/chibi.ts`): banner, chilling, sleeping, goodbye, trophy, and the hobbies surf, skate, LoL, coding, coffee, series, music. Every pose keeps the commissioned style, face, hair and eyes, and wears its own outfit (`docs/design/chibi-poses.md`). A pose may have a night outfit, worn by Lucas's time in Paris (`Europe/Paris`, 21:00 to 07:00), never the visitor's clock or theme; poses without night art wear their day one. Pages render the day art and switch after mount with a 300ms crossfade, with no layout shift. The full-body chibi stands in front of a circular ground-coloured stage disc.

## Components

Every control is drawn in the client's vocabulary; shadcn and Radix stay as the behaviour layer.

### Buttons
- **Shape:** 10px corners, Label type, 16px icons, a 2px Tangerine focus ring with a 2px offset.
- **Play** (primary): Tangerine fill, Night label in Unbounded 700, 52px tall with 24px side padding, on a Tangerine Ledge; plays the confirm chord. One per screen (on home, "Download my resume", with its date in Data beside it).
- **Ledge** (default): Velvet fill (Sheet in light), Cream label, 44px tall, 16px padding; hover also tints Seam at 40%.
- **Outline:** Plum fill (the ground), 2px Seam border, on a ledge: the secondary button wherever it sits on a Velvet surface, so it stays distinct from its background (LinkedIn on the banner, GitHub with its live star count and the external link on item cards).
- **Icon:** 44px square ledge buttons (sound, Locale, theme, socials, menu) with screen-reader labels.
- **Ghost / Link:** no ledge; ghost tints Seam on hover, link is Tangerine Deep (Tangerine in dark) and underlined.
- **Destructive:** Busy Deep fill with Cream text in light, Busy with Night text in dark, on a ledge.
- **States:** hover raises 2px onto a 6px ledge (fine pointers only); press sinks 4px in 80ms and releases in 160ms with Ease Pop; disabled drops the ledge to 50% opacity.

### Tabs (the menu)
- **Style:** full-width 44px rows, Label type, a lowercase label from the dictionaries and an 18px line icon on the left.
- **Hover:** Seam at 70% and the tick. **Active:** the Tangerine fill slides to the tab (240ms, Ease In Out), Night text, `aria-current="page"`. Each tab plays its own note, so walking down the menu plays a rising scale.
- **Mobile:** the same tabs in the sheet; choosing one plays its note and closes the sheet.

### Player card (signature)
Velvet slot at the top of the sidebar: the 64px chibi head in a 3px status ring coloured by Lucas's live Discord status (Seam while connecting), "ImJustLucas" in Title Large, and one Haze Label line with role and city. No level, rank or XP.

### Friends panel / presence (signature)
A Label heading in Haze with a live tag (Online fill) while Lucas is online, and a presence card of a fixed 76px height so the sidebar never jumps. **Playing:** 48px game art with a small badge, the game name, then a breathing Online dot, the elapsed time in Data (m:ss) and the detail line; on the right, the 56px LoL pose in his day or night outfit by Paris time. **Listening:** 48px album art with the Spotify mark, the title, then three small Online equaliser bars and the artist; on the right, the 56px music pose stepping through its two drawn frames while he listens. **Online, away, busy:** the 44px chibi head in its ring, a status dot and label, and a playful line. **Offline:** the sleeping pose and "offline" in Common's ink. **Connecting:** a Seam skeleton of the same size; if Lanyard is unreachable after 10 seconds the card shows offline. Long names truncate to one line with the full text as a native tooltip. Presence never plays a sound.

### Banner (signature)
A Velvet slot with a 2px Seam border and the tray: the full-body chibi on its stage disc (a button: booping swaps to another pose with the boop cue; hover plays its drawn frames), the Display greeting, the role line, "current team" with one team chip per ongoing Experience (or the chilling pose and line when there is none), and the actions: Play with the resume date, then the outline LinkedIn button.

### Team chip
40px tall, full radius, Plum fill with a 2px Seam border, the Experience's emoji then the company in Label; the role is read to assistive tech only.

### Item card (Projects)
Velvet card, 16px corners, 2px frame and 4px top band in the item's rarity colour, the tray. A 16:9 screenshot (10px corners, top-anchored crop, a placeholder icon and label when missing), the name in Title with the rarity tag beside it, the period in Data with a WIP tag, three lines of description in Haze, the Tech loadout as chips, and a footer of outline buttons. Padding 16px, 20px from 640px. Hovering plays the tick; heights follow content within an aligned grid.

### Achievement slot (signature)
A link slot: rarity frame and top band, the achievement art in a circular stage (128px in the wide slot), the rarity tag and year in Data, the name in Title Large, a description in Haze and an arrow that nudges 4px on hover. The legendary slot also stands on the Legendary Ledge, carries the filled sparkle and the foil, and plays the unlock (arpeggio, then the coin) on click, holding navigation for about half a second so it is heard.

### Chips and tags
- **Rarity tag:** rarity fill, Night text, Tag type, full radius, 2px by 8px.
- **Tech chip:** the Tech's own colour as fill and 2px border with computed ink, or an outline (see The Computed Ink Rule); Tag type, full radius, 2px by 10px.
- **Live tag:** Online fill, Night text. **WIP tag:** 2px Seam outline, ink text.

### Accordion (FAQ)
Velvet rows with 16px corners, the tray and 12px gaps instead of dividers; the trigger is at least 56px tall with 20px side padding and a Seam hover tint; the chevron turns over 200ms with Ease In Out; the answer is Haze body text at 65ch; opening and closing play the toggle notes.

### Theme menu
The theme switch is an icon button that opens a Velvet menu (16px corners, 2px Seam border, Float) of 40px items (dark, light, system), Seam on focus, a Tangerine Deep check on the current one.

### Chibi sprites
A pose's drawn frames alternate in steps (200ms each), never tweened, only while it plays (hover, a live state), on screen and without reduced motion; otherwise the first frame shows. The chibi itself never hops, slides or scales.

### Sound kit and switch
One synthesized instrument (a soft plucked kalimba tine) in D major pentatonic, master gain 0.22.
- **Tick** (B5, very quiet): hover on tabs, item cards, achievement slots and hobbies; fine pointers only, at most one every 60ms.
- **Press** (A4): secondary controls without a cue of their own (ledge and outline buttons, socials, the theme trigger, non-legendary achievements).
- **Tab:** the tab's own degree (D4, E4, F#4, A4, B4, D5 in menu order).
- **Confirm** (D4 and A4, then D5): the Play button.
- **Toggle on / off** (A4 to D5 / D5 to A4): the menu sheet, the accordion, choosing a theme, the Locale switch, the sound switch turning on.
- **Unlock** (D4 F#4 A4 D5, then the recorded coin): the legendary achievement.
- **Boop** (a random high degree with a 2-semitone upward bend): the banner chibi.
- **Miss** (A3 to F#3): defined in the kit for errors.
The **sound switch** is a 44px icon button, Tangerine with a speaker when on, Velvet with a struck speaker when off, with a localized label that also says when reduced motion turned sound off. It shows once in the settings row from 768px up and once in the mobile top bar below. Sound is on by default, off by default under reduced motion, stored per visitor in `localStorage`, and never plays before the first interaction or on automatic events.

### Motion
- **Ease Out** (`cubic-bezier(0.23, 1, 0.32, 1)`): hovers, entrances, page changes, the foil.
- **Ease Pop** (`cubic-bezier(0.34, 1.56, 0.64, 1)`): the press release only, a deliberate small overshoot.
- **Ease In Out** (`cubic-bezier(0.77, 0, 0.175, 1)`): the tab fill, the accordion chevron, ambient loops.
- **Ease Drawer** (`cubic-bezier(0.32, 0.72, 0, 1)`): the mobile sheet.
- **Page change:** a 220ms fade with a 6px rise. **Reduced motion:** press, raise and rise distances become zero (presses change colour only), the sheet fades, the equaliser, breathing dot, skeleton and foil are static, and chibi sprites hold their first frame.

### Admin
The Admin sets the same fonts and themes (dark by default) and inherits the world through the shadcn roles mapped in the stylesheet: Plum or Lilac Wash ground, Velvet or Sheet surfaces, Seam borders, the ledge buttons, Busy or Busy Deep for errors.

## Do's and Don'ts

### Do:
- **Do** let Plum (#2a1540), Night (#1c0f2b) and Velvet (#3b2159) own the whole dark shell, and Lilac Wash (#f6f0ff) the light one, through the role tokens rather than fixed colours.
- **Do** keep a Tangerine fill to the Play button, the active tab, the sound switch when on, focus and selection.
- **Do** derive every stat from `content/`, the dictionaries or a live source (Lanyard, GitHub, YouTube), and hide a missing number rather than show zero.
- **Do** compute the ink on Tech colours and use the deep `-ink` variants for coloured text in light.
- **Do** give every pressable control a ledge, a 44px target and a note from the kit.
- **Do** use an outline button (Plum fill, 2px Seam border) for secondary actions sitting on a Velvet surface.
- **Do** keep the sound switch visible on every page and honour reduced motion for both motion and sound.
- **Do** write every new string in both Locales and keep the lowercase, casual voice.

### Don't:
- **Don't** invent game stats: no level, rank, XP, KDA, win rate or achievement Lucas did not earn.
- **Don't** use rarity colours for decoration, headings or backgrounds.
- **Don't** drift into esports HUD aggression: no chamfered corners, scanlines, hex grids, glowing neon edges or forced uppercase.
- **Don't** go back to neutral zinc surfaces with colour only from content.
- **Don't** play sound automatically, on hover for touch pointers, from presence updates, or anywhere the visitor cannot silence it.
- **Don't** put blur or soft shadows on anything that does not float above the client.
- **Don't** let the chibi hop, slide or tween; its movement lives in its drawn frames.
- **Don't** make the presence card disappear or change height; it always shows a state.
