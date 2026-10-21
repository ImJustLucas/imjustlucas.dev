---
version: 1
slug: "app-admin-layout-tsx"
primary_target: "app/admin/layout.tsx"
related_targets: ["app/admin/page.tsx","app/admin/admin-form.tsx","app/admin/admin-screens.tsx"]
---

# Surface brief: the Admin, the client's admin screen

Scope: `app/admin/` (layout, sign-in and refusal screens, home, the six editors and their shared fields). Visitor mode: **Operate**: the Owner edits content quickly and without mistakes; expression comes second. World: DESIGN.md, "The Player Profile", inherited whole, in a calmer tone (no sound, no foil, no chibi in the editors). French only, `noindex`, out of the menu. Build path: code-led (no image generation in this run). Behaviour (Server Actions, `publish`, results, field errors, uploads) is unchanged.

## Job and audience

The Owner alone, a few times a month, on desktop or phone: fix a Project's Techs, upload a new Resume, add an Experience, reorder a Hobby. He needs to find the entry, change it, publish it, and trust what happened (published, refused, conflict).

## Direction contract

THESIS: The Admin is one more screen of the game client: the same frame, sidebar and panel, with the six editors as tabs. It refuses the stacked shadcn forms and the bullet list of links it replaces, and the generic SaaS dashboard.

OWN-WORLD: the sparkle frame, a ground sidebar with a player card and tabs whose action fill slides, a rounded ground panel; raised entry rows with the tray that open on their form, 2px seam inputs on the ground, ledge buttons, rarity and Tech chips drawn as on the site, Unbounded titles, Geist labels, Geist Mono data.

STORY: the Owner lands on the home, sees what needs doing (a stale Resume, a Project without Techs) and the size of each collection, jumps to the editor, opens one entry, edits, publishes, and reads a clear notice.

FIRST VIEWPORT: Desktop 1440x900. Left, the 320px sidebar: player card "ImJustLucas" with "admin" and the login, seven tabs (Accueil, Projects, Experiences, Techs, Achievements, Hobbies, Profile: the public menu's order first, the entries edited most often on top), and at the bottom the theme menu, "Voir le site" and the sign-out icon button. From 768 to 1023px the sidebar is 272px with a compact player card. Right, the panel: a compact banner (Headline, one muted line, the entry count in Data, "Ajouter" as an outline button), then the entries as closed rows (name, rarity tag, period, warning tags), the open row holding its grouped form with a footer pinned to the panel's bottom where "Publier" takes the action fill once the form has changes.

FORM: "the client's admin screen", position 1 on the ordered list (lead dealt to position 4, user chose position 1). Seed key: 016a6be0.

Signature interaction: an entry row opens in place on its form; while the form has unpublished changes the row says so; publishing shows the "Publié" notice pinned at the top of the panel, and the row stays open after the save.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

1. Structure: the client's admin screen (chosen by Lucas on 2026-10-21 over the quest board and the inventory with inspector).
2. Alerts on the home: a Resume older than six months or older than the newest Experience's start; a Project with no Tech. Two Resumes stale for the same reason are one item.
3. Techs stay always-open short rows (two fields each); every other editor, Hobbies included, uses rows that open in place (finish review, 2026-10-21).
4. The "Publié" notice takes its own room at the top of the panel, names what went live, and goes at the next page (finish review, 2026-10-21).
