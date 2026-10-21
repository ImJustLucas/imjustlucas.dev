---
version: 1
slug: "app-locale-mdf-2025-page-tsx"
primary_target: "app/[locale]/mdf-2025/page.tsx"
related_targets: ["app/[locale]/mdf-2025/components/master-dev-scene.tsx"]
---

# Surface brief: MasterDevFrance 2025 (the unlocked reward)

Scope: `/[locale]/mdf-2025` (Route `mdf2025`, out of the menu): the page the legendary achievement slot on home leads to, after the unlock cue. Visitor mode: **Experience**: the visitor is inside the reward; the 3D showcase leads. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, every palette, both modes, desktop and mobile. Build path: code-led (asked of the session that started this work; no concept round).

## Proof

Only the win itself: MasterDevFrance 2025, a national competition for technical excellence in software development, the prize cheque (the 3D certificate, `public/models/cheque.glb`), and the achievement's own fields (rarity legendary, year, trophy art). No rank, score, prize amount, jury quote or metric beyond what the cheque model shows.

## Direction contract

THESIS: The page is the reward screen a game shows right after an unlock: the legendary item presented on its own, framed by its rarity, with the trophy in a showcase you can play with. It refuses the old leftover (a blue-to-violet gradient box with a grey caption under it) and the generic "3D demo in a card".

OWN-WORLD: inherited: raised tray slots, 16px corners, Unbounded titles, Geist Mono year, rarity tag, filled legendary sparkle, the foil, ledge buttons. New pieces: the unlock banner (the page banner wearing its item's legendary frame, top band and sparkle, an "achievement unlocked" live-style tag) and the showcase well (a sunken ground-coloured well with the Well lip, holding the canvas; night sky with stars in dark modes, the palette's daylight ground without stars or vignette in light).

STORY: The visitor who just heard the unlock sees the reward confirmed, reads what was won in one line in Lucas's voice, throws coins at the cheque (each landing plays a note, so throwing plays a little tune), and heads back to the profile.

FIRST VIEWPORT: Desktop 1440x900: the unlock banner (tag row, Headline "MasterDevFrance 2025", the line, the trophy chibi on its stage disc, the sparkle top right), then the showcase slot filling the rest of the fold: the well with the scene, and under it a controls row: the hint in muted Label on the left, the pause/play ledge button on the right. Mobile: banner stacked as the other page banners, a shorter well (the panel stays scrollable beside a scene that captures touch).

FORM: an extension of the home's player profile (inherits seed key 14c08ff6); no concept round.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: arriving, the foil crosses the unlock banner once (900ms, Ease Out); clicking the scene throws a coin (the coin), its landing on the cheque clinks on a random high degree of the kit. Dragging orbits without throwing. Pause freezes everything in place and orbiting still works. Reduced motion: no foil, the scene arrives paused with "play" offered, no sound without a gesture.

## States and ranges

- Loading the model: the loader over the well in the well's own colours, with progress in Data.
- Paused / reduced motion: frozen frame, the button reads "play".
- Sound off (switch or reduced motion): throws and landings are silent.
- Light mode: day ground, no stars, no vignette; gold coins stay readable.
