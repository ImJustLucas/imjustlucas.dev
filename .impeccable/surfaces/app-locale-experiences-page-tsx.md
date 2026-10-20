---
version: 1
slug: "app-locale-experiences-page-tsx"
primary_target: "app/[locale]/experiences/page.tsx"
related_targets: []
---

# Surface brief: Experiences (career path and diplomas)

Scope: `/[locale]/experiences` (Route `experiences`): the Experiences timeline and the diplomas. Visitor mode: **Experience**, with one Read duty: a recruiter scans who Lucas worked for, as what, when and under which contract in under 20 seconds. World: DESIGN.md, "The Player Profile", inherited whole; this is an extension, not a new direction. Fidelity: production, both Locales, both palettes, both modes, desktop and mobile. Build path: code-led.

## Job and audience

Recruiters and clients reading the career; peers who know Lucas reading the story (from a first internship to co-founding Predi.GG). Lucas asked for it to be "a bit more fun" without adding sections: timeline and diplomas only.

## Proof

Only `content/experiences.json` (company, role, contract type, link, description, period, emoji, in the Owner's order) and the three diplomas in the dictionaries. No levels, chapters, XP or invented stats; ongoing Experiences are the "current team" already shown on the home banner.

## Direction contract

THESIS: The career is the player's path in the client: a track of stops, each a company disc with its emoji, the ongoing ones lit as his current team, and the diplomas as three medals he earned. It refuses the shadcn default of a card with grey dots on a hairline and a three-column table.

OWN-WORLD: inherited: palette roles, raised tray slots, 16px corners, 2px seams, Unbounded titles, Geist body, Geist Mono periods, the kalimba tick on hover. New pieces: a 4px rounded seam-coloured track, 56px stop discs on the ground colour with a 2px seam ring (Online ring and breathing dot for ongoing stops), and round pressable medals on a ledge, a ground face with a dashed seam rim.

STORY: The visitor sees two current teams at the top (Predi.GG, Bam Karaoke), follows the path down to the first internship, opens a company in a new tab from its name, then reads three medals: Master's, Bachelor's, Baccalaureate.

FIRST VIEWPORT: Desktop 1440x900: the page banner (Headline "My experiences", the route description as its line, the coffee chibi on its stage disc at about 160px) then "Professional Experiences" and the first two stops: disc on the track at left, a raised slot to its right with the period in Data and a "current team" tag, the company as a Title link with an external arrow, the role, the contract type as a seam tag, the description in the muted ink.

FORM: an extension of the home's player profile (inherits seed key 14c08ff6); the path form chosen from Lucas's "more fun" note, no concept round (local extension of an established world).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: on arrival each stop pops on (320ms, Ease Pop) and the track segment under it draws down to the next (scaleY, 160ms, Ease In Out), stop by stop on a 160ms stagger; the track is lit Online between two current teams. Hovering a stop's slot ticks and tilts its emoji. The medals are coins on a ledge lettered with their level; hovering a slot (fine pointers) or pressing the coin turns it to Lucas's chibi head and the year it was minted. Reduced motion: everything static, the coin swaps faces without turning.

## States and ranges

- 1 to many Experiences; 0 to 3 ongoing. An Experience with no emoji shows a briefcase line icon in its disc.
- Company links open in a new tab (same policy as every external link), with a visible link style; the slot itself is not a link.
- French contract types and roles run longer; the slot wraps, the disc never shrinks.
- Mobile (390): the track runs at the left edge with 44px discs, slots full width beside it; medals stack in one column.

## Constraints

- No change to factual content or the Owner's order; diplomas stay in the dictionaries (moving them to `content/` is a separate content-model task).
- Strings in both Locales; reuse `Home.currentTeam` for the ongoing tag.
