---
version: 1
slug: "app-locale-how-page-tsx"
primary_target: "app/[locale]/how/page.tsx"
related_targets: []
---

# Surface brief: How (the loadout)

Scope: `/[locale]/how` (Route `how`): the Tech categories and their Techs. Visitor mode: **Experience** with a Read duty: a recruiter or peer finds whether Lucas uses a given Tech within seconds. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, both palettes, both modes, desktop and mobile. Build path: code-led.

## Proof

Only `content/tech-categories.json` and `content/techs.json` (name, colour, order). No proficiency bars, levels, years of experience or ratings: none exist.

## Direction contract

THESIS: How Lucas builds is his loadout screen: each Tech category is a bag slot, its Techs the items inside it as colour chips on a sunken ground tray, with the count of items as the slot's one stat. It refuses the default two-column shadcn cards with a title, grey description and a pile of badges.

OWN-WORLD: inherited: raised tray slots with 16px corners, Unbounded titles, Geist muted descriptions, Tech chips with computed ink (The Computed Ink Rule), Geist Mono for the count, the tick on hover. New piece: the item well, a ground-coloured inset tray (10px corners) inside the slot that holds the chips, like an inventory grid.

STORY: The visitor reads the casual intro, scans five bags (Languages, Frontend, Backend, DevOps & Tools, AI), spots TypeScript, Next.js or Claude Code by colour and name.

FIRST VIEWPORT: Desktop 1440x900: the page banner (Headline, the rewritten intro, the coding chibi at about 160px on its stage disc) then a grid of bag slots, two columns from 1024px with the first bag (Languages) beside Frontend, each slot: name in Title, item count in Data on the right, description in muted body, the well of chips below.

FORM: an extension of the home's player profile (inherits seed key 14c08ff6); no concept round.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: hovering a bag ticks and lifts its chips one step in a 30ms ripple (2px, Ease Out), like items settling in a bag; reduced motion keeps them still.

## States and ranges

- 1 to many categories, 1 to about 8 Techs each; the grid aligns rows, heights follow content.
- A Tech colour with no 4.5:1 ink renders as an outline chip (existing TechBadge rule).
- Mobile: one column, chips wrap.

## Copy (Lucas, 2026-10-20)

The stock intro is replaced: EN "My loadout: everything I build with, sorted by what it's for 🛠️", FR "Mon loadout : tout ce avec quoi je construis, rangé par usage 🛠️".
