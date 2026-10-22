---
version: 1
slug: "app-locale-trophies-page-tsx"
primary_target: "app/[locale]/trophies/page.tsx"
related_targets: ["components/trophies/TrophyCabinet.tsx","components/trophies/TrophyLayer.tsx","components/sidebar/TrophyCount.tsx"]
---

# Surface brief: Trophies

Scope: `/[locale]/trophies` (Route `trophies`, out of the menu), the trophy toast at the top of the client and the trophy count at the sidebar's foot. Visitor mode: **Experience**: the visitor sees what they unlocked by exploring and what is left to find. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, every palette, both modes, desktop and mobile. Build path: code-led.

## Proof

Only the visitor's own progress, from their browser (`lib/trophies/trophies.ts`, docs/trophies.md). Trophies are the visitor's, never Lucas's (his are Achievements); no invented stats, no global unlock percentages.

## Direction contract

THESIS: the visitor's own trophy screen in the game client: the count as the page's one Display number with one pip per Trophy, filled in its rarity once unlocked, then one shelf per rarity holding its Trophies as rows. It refuses a generic grid of same-size cards.

OWN-WORLD: inherited: page banner with the trophy pose, raised tray slots, 2px seam rules, rarity bands, rings and tags (The Rarity Is Data Rule), the live tag, Unbounded, Geist Mono for counts and days, the kit's unlock. New pieces: the pip row, the trophy row (disc, name, how, day or count), the empty socket (seam ring pressed in by the ledge inset), the trophy toast dropping in at the top of the client.

STORY: a visitor unlocks something anywhere on the site, a toast drops in with the unlock, the count at the sidebar's foot ticks up; on the trophies screen they see their count, each shelf, what is locked and how close they are (3/5), and two "???" rows with a hint.

FIRST VIEWPORT: Desktop 1440x900: the page banner; the summary slot ("2/16" at Display, the pips, the latest unlock, the storage note); then the common and rare shelves side by side (from 1280px; one column below, where a shelf would leave a name no room).

FORM: an extension of the home's player profile; no concept round. Lucas chose the Route, the count's place, the 16 Trophies and the two secret ones (2026-10-22).

FINISH: reviewed by the finish reviewer (fix: shelves from 1280px, the phone row, the day in Data, the empty socket), documented in DESIGN.md (Trophies).

Signature interaction: an unlock anywhere plays the unlock (silent for one Lucas's presence unlocked) and drops the toast, one at a time, 900ms after what earned it.

## States and ranges

- Before hydration: the count shows "–", the pips are empty and the sidebar count has no number.
- Nothing unlocked: "nothing yet, go poke around 👀". All unlocked: "you're a legend 👑".
- Secret, locked: "???" with its hint and a question icon.
- Storage refused: progress holds for the visit; the page still renders.
