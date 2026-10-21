---
version: 1
slug: "app-locale-what-slug-page-tsx"
primary_target: "app/[locale]/what/[slug]/page.tsx"
related_targets: ["app/[locale]/what/@modal/(.)[slug]/page.tsx", "components/projects/ProjectInspect.tsx", "components/projects/ProjectWindow.tsx"]
---

# Surface brief: a Project's inspect screen

Scope: `/[locale]/what/[slug]`, one page per Project (statically generated, indexable), and the same content as a window over the inventory when a card is pressed on `/what` (intercepting route). Visitor mode: **Experience**: the item leads. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, every palette, both modes, desktop and mobile. Build path: code-led; layout chosen by the Owner among four sketches (A, "inspect screen").

## Proof

Only the Project's own fields: title, description, screenshot and gallery, Period, WIP, Rarity, Techs, links, live star count, and the optional page texts the Owner writes in the Admin (role, context, what I built, outcome). Nothing invented: no metric, quote or outcome the content does not hold.

## Direction contract

THESIS: the inspect screen a game client opens when you press an item in your inventory: the item in its rarity frame, its picture big on the left, its stats beside it, its lore below. It refuses a blog-post case study and a generic modal with a hero image.

OWN-WORLD: inherited item card frame (2px rarity frame, 4px top band, tray, 16px corners), Unbounded title, Geist Mono Period, rarity and WIP tags, Tech chips, ledge buttons, the coding chibi on its stage disc as the item's holder. New pieces: the viewer (a 16:9 screen with a strip of 10px-corner thumbnails, the chosen one ringed in the action ink) and the lore (sections of reading text under a seam).

STORY: a recruiter or peer presses a card, sees the item open over the inventory, reads what it is and who Lucas was on it, flips through screenshots, follows the site or GitHub, closes with Escape or back and lands where they were in the loadout. A shared link opens the same screen as a page with a way back to the inventory.

FIRST VIEWPORT: desktop: the window centred over the dimmed inventory (1080px max), viewer left (about 3/5), stats right: title + tags, description, holder row (chibi + role), loadout, actions; lore under the fold. Mobile: a sheet sliding up (Ease Drawer, 260ms) under a 12px gap from the top, same content stacked: viewer, stats, lore.

## States and ranges

- Today's Projects: no page texts, at most one image: the screen is viewer + stats; no empty lore headings.
- No image: the viewer shows the card's placeholder (icon + "no screenshot yet").
- Gallery 1..8 images: thumbnails wrap; one image: no strip.
- Long texts: paragraphs split on blank lines, 65ch.
- No links: no actions row. Stars only when GitHub gave some.
- Reduced motion: the window and sheet fade only.
