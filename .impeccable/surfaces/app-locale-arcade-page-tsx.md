---
version: 1
slug: "app-locale-arcade-page-tsx"
primary_target: "app/[locale]/arcade/page.tsx"
related_targets: ["components/arcade/OllieGame.tsx","lib/arcade/ollie.ts"]
---

# Surface brief: Arcade (the game library)

Scope: `/[locale]/arcade` (Route `arcade`, the sixth menu tab, before contact). Visitor mode: **Experience**: the visitor is inside the game; the cabinet's screen leads. World: DESIGN.md, "The Player Profile", inherited whole; the game screen itself carries the game's own palette (Lucas's choice, 2026-10-21), never the site palette. Fidelity: production, both Locales, every palette and mode for the chrome, desktop and touch. Build path: code-led (decisions asked of Lucas in two structured rounds: first game = skate runner "à la dino de Chrome", sixth tab, palette of its own, surf as a "soon" cabinet; no comp round).

## Proof

Only what is true: Lucas skates and surfs (his Hobbies), the chibi poses are his commissioned character. Scores are the visitor's own; the best score lives in the visitor's browser only. No leaderboard, no invented players or ranks.

## Direction contract

THESIS: The Arcade is the client's game library: a shelf of cabinets, one per hobby, and the selected cabinet open beside it as the "now playing" screen. It refuses a grid of game cards opening a modal, and a bare canvas dropped in a generic card.

OWN-WORLD: inherited tray slots, 16px corners, 2px seams, Unbounded titles, Geist Mono scores, the action fill only on the screen's one Play / Play again button, ledge buttons for pause. New pieces: the cabinet (a raised slot: a marquee row with the game's name and the best score, the screen as a sunken 10px-cornered well holding the 16:9 canvas, a control deck under it), and cabinet tiles on the shelf (chibi on its stage disc; a locked tile shows the pose as a seam-coloured silhouette with a "soon" tag). Inside the screen: a Paris street in its own day and night colours (zinc roofs, stone façades, orange cones, green bins, pigeons), day or night by Lucas's time in Paris, sparkles as the outlined tattoo star.

STORY: The visitor sees Lucas on his board in a Paris street, presses Play (or Space), jumps cones and benches, hears each jump and sparkle as a note of the kit, crashes, sees his score against his best (the trophy pose on a new record), and plays again in one press. The surf cabinet promises the next game.

FIRST VIEWPORT: Desktop 1440x900: page title "arcade" and one line in Lucas's voice across the top; under it the cabinet takes about three quarters of the panel width (marquee, then the screen with the start card over the street: game name, the hint, the Play button, the best score; then the deck: hint left, pause right); the shelf stands to its right as a column of cabinet tiles, Ollie selected, Surf locked. Mobile: title and line, the shelf as a row of two tiles, then the cabinet full width; tapping the screen jumps.

FORM: an extension of the home's player profile (inherits seed key 14c08ff6); the game library of a game client, first on the ordered list; no concept round.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: the jump. Lucas swaps from the rolling pose to the ollie pose with the board tipped up, the hop note plays, and he lands back on the rolling pose; a held press flies higher. Crash: he tumbles once (no tumble and no screen shake under reduced motion), the miss cue plays, the game-over card rises.

## States and ranges

- Ready: the street stands still, Lucas on his board, the start card.
- Running: the score and best in Data, top right of the screen; Escape or the pause button pauses; a hidden tab pauses.
- Paused: frozen frame, the card offers "resume".
- Over: score, best, trophy pose on a new record, "play again"; Space / Enter also restarts after a short guard.
- Reduced motion: far layers stand still, the middle layer drifts slowly, no tumble, no shake.
- Sound off: silent game; nothing sounds before the visitor's first press.
- No storage: the best score holds for the visit only.
