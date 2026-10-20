---
version: 1
slug: "app-locale-page-tsx"
primary_target: "app/[locale]/page.tsx"
related_targets: ["app/[locale]/ClientLayout.tsx","app/[locale]/layout.tsx","components/sidebar/Sidebar.tsx"]
---

# Surface brief: home page and client shell

Scope: the home route (`/[locale]`, Route `me`) and the shell every public page sits in (sidebar, mobile top bar and sheet, content panel). Visitor mode: **Experience**, with one Persuade duty: a recruiter gets the role, the current work and the MDF 2025 win in the first viewport. World: DESIGN.md, "The Player Profile". Fidelity: production-ready, both Locales, both themes, desktop and mobile. Build path: code-led (no image generation in this run).

## Job and audience

Four readers arrive here first (PRODUCT.md): a recruiter skimming between tabs on a laptop, a client checking that Lucas ships, a peer or YouTube viewer coming for the person, and Lucas showing his corner of the web. The home page must make all four say "that's Lucas" within one viewport.

## Outcome and proof

- In 30 seconds: who he is (role, city), who he plays for now, his biggest win, and the resume one press away.
- Proof is only what exists: ongoing Experiences (today Bam Karaoke, since 2026-01, and Predi.GG, co-founder since 2025-09), MasterDevFrance 2025 and its page, Projects with images and live stars, diplomas, live Discord presence, the resume PDFs per Locale.
- Success: the Play button (resume) and the LinkedIn link get used; visitors reach `/mdf-2025` and `/what` from the home page.

## Direction contract

THESIS: The home page is Lucas's player profile screen: banner, current team, achievement showcase, inventory, all real data inside a cosy game client. It refuses the category default of a dark neutral sidebar with a centred "Hi, I'm" paragraph and cards that only get colour from screenshots.

OWN-WORLD (palette amended by Lucas on 2026-10-20, see Decisions 7): in the default electric palette, a navy night frame with faint sparkles, navy shell, raised navy slots with 16px corners, off-white text, and one action colour on the Play button, active tab and sound switch: off-white on an electric-blue ledge in dark, electric blue on a deep-blue ledge in light (the plum palette keeps Night, Plum, Velvet, Cream and Tangerine); rarity frames (common lilac-grey, rare sky, epic violet, legendary gold) on items, chunky controls that sink onto a ledge, Unbounded for titles, Geist for reading, Geist Mono for stats, a kalimba note on every press.

STORY: The visitor understands that Lucas is a fullstack developer in Paris who plays for Bam Karaoke and co-founded Predi.GG, believes he ships and wins (MDF 2025 legendary, Projects with live stars), sees he is a real person right now (presence), and presses Download my resume or goes to the inventory.

FIRST VIEWPORT: Desktop 1440x900. Left, the 320px sidebar: player card on top (64px chibi head in a live status ring, "ImJustLucas", role line), the six lowercase tabs, the always-on friends panel, settings row (sound switch first, Locale, theme) and socials at the bottom. Right, the panel opens on a full-width banner slot about 340px tall: a full-body chibi pose (about 260px) on the left; on the right the Display greeting "Yoooo, I'm Lucas!", one role line, then "current team" as two chips derived from ongoing Experiences (🎤 Bam Karaoke, 🔮 Predi.GG); bottom right of the banner, the action-coloured Play button "Download my resume" with the resume date in Data beside it, and a Ledge LinkedIn button. Under the banner, the achievement row: today MDF 2025 alone as one wide legendary slot, with room for up to two more added later in the Admin; the top edge of the featured inventory row peeks above the fold.

FORM: The game-client player profile (cosy, not competitive), third on the ordered list of seven grounded candidates; seed key 14c08ff6.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: walking down the tabs plays a rising pentatonic scale while the action fill slides from tab to tab; the legendary MDF slot plays its foil sheen once per session when it enters view, and clicking it plays the unlock sound before navigating to `/mdf-2025`.

## Page sequence (home)

1. **Banner** (above): greeting, role, current team, Play button, LinkedIn.
2. **Achievement showcase** (above): achievements are an Admin-editable content type (name per Locale, year, rarity, link, art). Today it holds only MDF 2025, shown as one wide legendary slot linking to `/mdf-2025`; Lucas adds others when he has a win of that level. Never pad the row with lesser items.
3. **Inventory, featured**: up to three Project item cards chosen and ordered by Lucas in the Admin (a `featured` flag and order on Projects), rarity-framed, with "see the whole inventory" to `/what`. His intended first selection: Predi.GG, his current job (Bam Karaoke, which first needs a Project entry added in the Admin), and others he picks. Nothing on the home page is chosen in code.
4. **About**: the bio ("Creative Mindset" today) in a 65ch reading slot, beside a "what i do when i'm not shipping" slot of his real hobbies, each a chibi pose with a lowercase label: surf, skate, playing LoL, coding, a coffee, watching a series, listening to music. The list lives in the content (Admin-editable), not in the component.
5. **FAQ**: the existing questions as Velvet accordion rows with toggle sounds.
6. Close: a small chibi waving and the contact tab link, so the page ends on Lucas, not on trivia.

## Shell behaviour

- The sidebar is mounted once and restyled between the desktop column and the mobile sheet (`docs/routing.md`); one Lanyard socket, one sound engine.
- Mobile (390 wide): 56px top bar with chibi head, name, sound switch and menu button; the sheet slides up with Ease Drawer holding the tabs, friends panel and settings. Banner stacks: chibi 120px beside the greeting, chips wrap, Play button full width; the showcase becomes a horizontal snap row with MDF first; inventory goes to one column.
- Page changes crossfade with a 6px rise (220ms); the active tab fill slides (240ms).
- Every target is at least 44px; focus is the 2px action-ink ring with offset; one visible `h1` per page (the greeting on home, styled Display).

## States and ranges

- **Presence**: playing, listening, online with nothing running, away, busy, offline, connecting (skeleton of the same height), Lanyard unreachable (shown as offline). Never hidden. Long song or game names truncate to one line with the full text in a tooltip.
- **Current team**: 0 to 3 ongoing Experiences. With 0, the chips give way to the chibi chilling and the line "en mode chilling tu connais" (EN: "just chilling, you know"), both from the dictionaries; never an invented status.
- **Achievements**: 1 to 3 slots, today 1; with 1, MDF takes the row as a wide slot; with 2 or 3, the legendary one comes first and is largest.
- **Featured Projects**: 0 to 3, in Lucas's Admin order; 0 hides the section and keeps the link to `/what`; stars missing hide the count, never show 0.
- **Resume**: always present per Locale; the date comes from `content/profile.json`.
- **Locales**: French strings run up to 30% longer (role line, Play label "Télécharger mon CV"); the banner must hold two-line role text without moving the Play button out of the first viewport.
- **Sound**: on, off, and off-by-reduced-motion; the switch reflects all three, and the first press after load is the first sound.
- **Themes**: dark (default) and light, each checked against the contrast rules in DESIGN.md.
- **Day and night**: the banner chibi wears the day or night outfit by Lucas's time in Paris (night 21:00 to 07:00). Pages are static, so the server renders the day version and the client switches after mount with a short crossfade (none under reduced motion); the image slot keeps the same size so nothing shifts.

## Constraints

- Binding from PRODUCT.md: the casual voice and lowercase menu labels, live Discord presence, full EN/FR parity, Admin-editable content, no invented testimonials, metrics or game stats.
- Other sessions own these files' current fixes: Geist wiring (PR #24), Badge as span (PR #25), and the accessibility P1s (badge contrast, global `select-none`, Escape on the mobile menu, `<main>`). Build on top of them once merged; do not redo them.
- New content goes through the content catalog and the Admin (ADR and `docs/content.md`), never hard-coded: a `featured` flag, a home order and a `rarity` field on Projects; an achievements document; the hobbies list. Lucas must be able to change all of it himself.
- `components/typography` gains the display, headline and data roles; Techs still render only through their badge component, restyled as chips.
- Sound and motion honour `prefers-reduced-motion`; no sound before the first interaction.

## Assets to produce

- Chibi poses in the existing head's style (originally commissioned from an artist), transparent WebP with provenance:
  - shell and states: full-body waving with a headset (banner), chilling (no ongoing job), sleeping (offline presence), waving goodbye (page close), trophy (MDF slot);
  - hobbies: surfboard, skateboard, playing LoL with a controller or keyboard, coding on a laptop, holding a coffee, watching a series, headphones on for music.
  Each pose has its own outfit matched to the activity; face, hair, eyes, line and cel shading never change. Prompts and outfits: `docs/design/chibi-poses.md`.
  Preferred route: the same artist, so the style stays identical. Alternative: image generation from the existing chibi as reference, kept only if Lucas judges it equal in quality and his commission terms allow derivatives.
- Achievement art for MDF 2025 (from the trophy or `mdf-cheque.png`) and for each other achievement.
- The sparkle: Lucas's hand tattoo (outlined four-point star) redrawn as an SVG, used for the backdrop tile and the legendary mark.

## Decisions (Lucas, 2026-10-20)

1. **Achievements**: Admin-editable content type; only MDF 2025 for now, no other win of that level yet.
2. **Featured Projects and rarity**: chosen, ordered and rated by Lucas in the Admin. The proposed starting rarities (Predi.GG epic; Qotum, Tricks and Bam Karaoke rare; the two boilerplates common) are only defaults he can change.
3. **No ongoing job**: "en mode chilling tu connais" / "just chilling, you know".
4. **Hobbies**: surf, skate, playing LoL, coding, coffee, watching a series, listening to music.
5. **Chibi art**: commissioned from an artist today; generation is welcome if it reaches the same quality.

6. **Role line**: "fullstack dev, co-founder of Predi.GG" / "fullstack dev, cofondateur de Predi.GG", lowercase like the menu, from the dictionaries.
7. **Palette** (later the same day): orange as the active colour did not suit him; electric blue does. The default palette is "electric": dark mode E (frame #05081c, ground #0a0f2e, raised #141c48, seam #2a3a7a, off-white #f6f3ea text, the action off-white with navy text on an electric-blue #2f6bff ledge, electric blue for link underlines and focus #6f97ff) and light mode F (frame #e8e4d9, ground #f6f3ea, raised #fffdf8, ink #10131f, the action electric blue #1a4fe8 with off-white text on a #0d2fa6 ledge). Plum and tangerine stays as a second palette in the theme menu, stored per visitor.

## Chibi art

Thirteen approved poses live in `.impeccable/mocks/chibi/` (white backgrounds); see `docs/design/chibi-poses.md`. The banner uses `banner-wave-flipped.png` by day; its night version is not made yet, so the night banner falls back to the day one.
