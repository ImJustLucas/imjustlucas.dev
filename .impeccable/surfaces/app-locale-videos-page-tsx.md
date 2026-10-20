---
version: 1
slug: "app-locale-videos-page-tsx"
primary_target: "app/[locale]/videos/page.tsx"
related_targets: []
---

# Surface brief: Videos (replays)

Scope: `/[locale]/videos` (Route `videos`): the YouTube Videos and the empty state. Visitor mode: **Experience**: the one page where Lucas's life (vlogs, ski, day-in-the-life) shows; the thumbnails lead. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, both palettes, both modes, desktop and mobile. Build path: code-led.

## Proof

Only the channel feed (title, thumbnail, date, URL, the "new" flag on the latest Video under 30 days). Titles stay untranslated. No view counts or likes: the feed has none.

## Direction contract

THESIS: The Videos page is the client's replays tab: a grid of replay tiles where the thumbnail is the hero and a round play disc rises onto it on hover. It refuses the default black-box cards with a grey clock and a filled button under each.

OWN-WORLD: inherited: raised tray slots, 16px corners, 10px artwork corners, Unbounded titles, Geist Mono dates, outline buttons on raised surfaces, the tick on hover. New pieces: the play disc (56px, ground fill, 2px seam rim, ink play glyph) and the ground-coloured skeleton under every thumbnail.

STORY: The visitor recognises Lucas in the thumbnails, spots the newest one by its "new" tag, and opens one on YouTube in a new tab.

FIRST VIEWPORT: Desktop 1440x900: the page banner (Headline "youtube videos", the route description, the series chibi on its stage disc), then three replay tiles per row from 1280px (two from 768px): 16:9 thumbnail, the title in Title over two lines at most, the date in Data with a "new" tag, and an outline "Watch now!" button with the YouTube mark.

FORM: an extension of the home's player profile (inherits seed key 14c08ff6); no concept round.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: hovering a tile ticks, zooms the thumbnail to 1.03 (300ms, Ease Out) and lifts the play disc in from 8px below; pressing the thumbnail or the button plays the press note and opens YouTube in a new tab. Reduced motion: the disc shows without movement, no zoom.

## States and ranges

- 0 Videos (source down on a fresh build, or none yet): an empty slot with the chilling chibi, the existing empty copy, and the subscribe link styled as a secondary link; never a blank page.
- Thumbnails loading: the ground skeleton, never black.
- Long titles clamp to two lines with the full title in the link's accessible name.
- Mobile: one column, play disc always visible on touch pointers.
