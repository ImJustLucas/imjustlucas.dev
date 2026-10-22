---
version: 1
slug: "app-locale-patch-notes-page-tsx"
primary_target: "app/[locale]/patch-notes/page.tsx"
related_targets: ["components/patch-notes/CurrentPatch.tsx","components/patch-notes/PatchSeasons.tsx","components/patch-notes/PatchLines.tsx","components/sidebar/VersionLink.tsx"]
---

# Surface brief: Patch notes (what's new)

Scope: `/[locale]/patch-notes` (Route `patchNotes`, out of the menu) and the version link at the foot of the sidebar. Visitor mode: **Read**: the visitor wants to know what changed on the site, newest first, and dip into older versions. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, every palette, both modes, desktop and mobile. Build path: code-led.

## Proof

Only `content/patch-notes.json` (version, date, title, tagged lines, optional pull request link), edited in the Admin. No invented stats, downloads or player counts.

## Direction contract

THESIS: The patch notes are the client's "what's new" window: the current version open as one big slot, the older ones folded season by season. It refuses the default changelog of a long markdown page with h2 per version and bullet lists.

OWN-WORLD: inherited: page banner with the coding pose, raised tray slots with a 2px seam border, Unbounded, Geist Mono for versions and dates, the FAQ's accordion rows, outline buttons on raised surfaces, the kit. New pieces: the version as the page's one Display-size number, tag chips per line (new: Online fill with the tattoo sparkle; changed: seam outline with a refresh icon; fixed: seam fill with a wrench), a per-row tally of tag icons with counts, the version link with an Online unread dot.

STORY: The visitor sees the current version and what it brought in one glance, scans older seasons by title, opens one, and can share a patch by its address (`#v2-9`).

FIRST VIEWPORT: Desktop 1440x900: the page banner; the current-patch window (from 1024px a 15rem column with the "current version" live tag, the date, "v2.12" at Display size and the patch title in Title Large, the GitHub outline button at its foot, beside the lines with their chips); then "season 2" in Title with its count and month range, and the first folded rows.

FORM: an extension of the home's player profile (inherits seed key 14c08ff6); no concept round. Lucas chose this composition over a version track and the coding pose (2026-10-22).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: pressing the sidebar's version link plays the patch chime (D5, A5, then F#5) and opens the screen, which clears the unread dot; rows open and close with toggle on and off and tick on hover; an address opens its row on arrival.

## States and ranges

- No patch yet: an empty slot with the chilling chibi and the empty line; no version link in the sidebar.
- Unread: an 8px Online dot after the version until the visitor opens the page (localStorage `imjustlucas.patch-seen`); never shown before hydration.
- Long titles wrap; on phones the folded row is the version chip beside the title, the date under it, the tally hidden.
- A season with only the current patch shows no section.
