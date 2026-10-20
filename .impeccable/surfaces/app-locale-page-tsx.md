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

OWN-WORLD: Night frame with faint sparkles, Plum shell, Velvet slots with 2px Seam borders and 16px corners, Cream text, one Tangerine accent on the Play button, active tab and sound switch, rarity frames (common lilac-grey, rare sky, epic violet, legendary gold) on items, chunky controls that sink onto a ledge, Unbounded for titles, Geist for reading, Geist Mono for stats, a kalimba note on every press.

STORY: The visitor understands that Lucas is a fullstack developer in Paris who plays for Bam Karaoke and co-founded Predi.GG, believes he ships and wins (MDF 2025 legendary, Projects with live stars), sees he is a real person right now (presence), and presses Download my resume or goes to the inventory.

FIRST VIEWPORT: Desktop 1440x900. Left, the 320px sidebar: player card on top (64px chibi head in a live status ring, "ImJustLucas", role line), the six lowercase tabs, the always-on friends panel, settings row (sound switch first, Locale, theme) and socials at the bottom. Right, the panel opens on a full-width banner slot about 340px tall: a full-body chibi pose (about 260px) on the left; on the right the Display greeting "Yoooo, I'm Lucas!", one role line, then "current team" as two chips derived from ongoing Experiences (🎤 Bam Karaoke, 🔮 Predi.GG); bottom right of the banner, the Tangerine Play button "Download my resume" with the resume date in Data beside it, and a Ledge LinkedIn button. Under the banner, a row of three achievement slots with MDF 2025 legendary first and largest; the top edge of the inventory row peeks above the fold.

FORM: The game-client player profile (cosy, not competitive), third on the ordered list of seven grounded candidates; seed key 14c08ff6.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: walking down the tabs plays a rising pentatonic scale while the Tangerine fill slides from tab to tab; the legendary MDF slot plays its foil sheen once per session when it enters view, and clicking it plays the unlock sound before navigating to `/mdf-2025`.

## Page sequence (home)

1. **Banner** (above): greeting, role, current team, Play button, LinkedIn.
2. **Achievement showcase** (above): three slots, MDF 2025 legendary first; the other two come from the achievements content (see open decisions). Each slot links to its proof when one exists.
3. **Inventory, featured**: up to three Project item cards from a `featured` flag, rarity-framed, with "see the whole inventory" to `/what`.
4. **About**: the bio ("Creative Mindset" today) in a 65ch reading slot, beside a slot of real hobbies drawn as chibi poses (skate, surf, karaoke, LoL) once Lucas confirms the list.
5. **FAQ**: the existing questions as Velvet accordion rows with toggle sounds.
6. Close: a small chibi waving and the contact tab link, so the page ends on Lucas, not on trivia.

## Shell behaviour

- The sidebar is mounted once and restyled between the desktop column and the mobile sheet (`docs/routing.md`); one Lanyard socket, one sound engine.
- Mobile (390 wide): 56px top bar with chibi head, name, sound switch and menu button; the sheet slides up with Ease Drawer holding the tabs, friends panel and settings. Banner stacks: chibi 120px beside the greeting, chips wrap, Play button full width; the showcase becomes a horizontal snap row with MDF first; inventory goes to one column.
- Page changes crossfade with a 6px rise (220ms); the active tab fill slides (240ms).
- Every target is at least 44px; focus is the 2px Tangerine ring with offset; one visible `h1` per page (the greeting on home, styled Display).

## States and ranges

- **Presence**: playing, listening, online with nothing running, away, busy, offline, connecting (skeleton of the same height), Lanyard unreachable (shown as offline). Never hidden. Long song or game names truncate to one line with the full text in a tooltip.
- **Current team**: 0 to 3 ongoing Experiences. With 0, the chips give way to a line Lucas must write (see open decisions); never an invented status.
- **Achievements**: 1 to 3 slots; with 1, MDF takes the row with a wider slot.
- **Featured Projects**: 0 to 3; 0 hides the section and keeps the link to `/what`; stars missing hide the count, never show 0.
- **Resume**: always present per Locale; the date comes from `content/profile.json`.
- **Locales**: French strings run up to 30% longer (role line, Play label "Télécharger mon CV"); the banner must hold two-line role text without moving the Play button out of the first viewport.
- **Sound**: on, off, and off-by-reduced-motion; the switch reflects all three, and the first press after load is the first sound.
- **Themes**: dark (default) and light, each checked against the contrast rules in DESIGN.md.

## Constraints

- Binding from PRODUCT.md: the casual voice and lowercase menu labels, live Discord presence, full EN/FR parity, Admin-editable content, no invented testimonials, metrics or game stats.
- Other sessions own these files' current fixes: Geist wiring (PR #24), Badge as span (PR #25), and the accessibility P1s (badge contrast, global `select-none`, Escape on the mobile menu, `<main>`). Build on top of them once merged; do not redo them.
- New content fields go through the content catalog and the Admin (ADR and `docs/content.md`), not hard-coded: a `featured` flag and a `rarity` field on Projects, and achievements.
- `components/typography` gains the display, headline and data roles; Techs still render only through their badge component, restyled as chips.
- Sound and motion honour `prefers-reduced-motion`; no sound before the first interaction.

## Assets to produce

- Chibi poses in the existing head's style, transparent WebP with provenance: full-body waving with a headset (banner), skateboard, surfboard, karaoke mic, controller, trophy, sleeping (offline presence), waving goodbye (page close). Generated or commissioned; listed for Lucas to approve.
- Achievement art for MDF 2025 (from the trophy or `mdf-cheque.png`) and for each other achievement.
- The sparkle backdrop tile (SVG, authored in code).

## Open decisions (Lucas decides, the builder must not invent)

1. **Achievements**: a new Admin-editable content type (name, year, rarity, link, art) or derived from diplomas plus MDF. Which two achievements sit beside MDF 2025?
2. **Rarity per Project**: confirm the proposed mapping (Predi.GG epic; Qotum and Tricks rare; the two boilerplates common) and which Projects are featured.
3. **Role line** in both Locales, and the line shown when no Experience is ongoing.
4. **Hobby list** for the About slot (skate, surf, ski, karaoke, LoL?), so no pose claims a hobby that is not his.
5. **Chibi art**: generated in this repo or commissioned from an artist.
