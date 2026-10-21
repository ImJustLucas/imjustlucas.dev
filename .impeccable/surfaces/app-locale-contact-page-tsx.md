---
version: 1
slug: "app-locale-contact-page-tsx"
primary_target: "app/[locale]/contact/page.tsx"
related_targets: ["components/presence/FriendsPanel.tsx"]
---

# Surface brief: contact, the add-friend screen

Scope: the contact route (`/[locale]/contact`, Route `contact`). Visitor mode: **Persuade**: the visitor came to reach Lucas and should leave having sent a DM or added him. World: DESIGN.md, "The Player Profile", inherited whole. Fidelity: production, both Locales, every palette, both modes, desktop and mobile. Build path: code-led (no image generation in this run).

## Job and audience

A recruiter, a client or a peer who wants to write to Lucas. They need to know the way to reach him (LinkedIn DMs), that he answers, and whether he is around right now.

## Outcome and proof

- One primary action: a LinkedIn DM. Secondary: adding him on Discord (his profile, `discord.com/users/<discordUserId>`). Then the other platforms: GitHub, YouTube, Instagram, all from the Profile.
- Proof is live and real: the Discord status ring and line, and what he is playing or listening to, from the shared presence. Nothing invented: no reply-time number, no form, no email (the Profile has none).
- The promise stays the one he already makes: he replies as fast as he can.

## Direction contract

THESIS: Contact is the client's add-friend screen: one player you send a request to, live status and all. It refuses the category default of a contact form, a mailto or a row of icon links under a paragraph.

OWN-WORLD: DESIGN.md as is: navy (or the visitor's palette) ground, a raised slot with a 2px seam border and the tray, the chibi on its ground stage disc ringed in the live status colour, Unbounded titles, Geist labels, Geist Mono data, ledge buttons, one Play button per screen, the kit's notes on every press.

STORY: The visitor sees Lucas's card and whether he is online, reads that a LinkedIn DM is the way and that he answers fast, sends the request (or adds him on Discord), and can follow him on GitHub, YouTube or Instagram.

FIRST VIEWPORT: Desktop 1440x900. The page title "Contact me" in Headline, then one wide request slot (seam border, tray). Left, the full-body waving chibi (banner pose, about 220px) on its stage disc inside a 4px status-coloured ring, a status tag under it. Right: "ImJustLucas" in Title Large with the role line, then the Play button "Send me a DM on LinkedIn" with "I'll reply as fast as I can" in muted Data beside it, and the outline "Add on Discord" button. A seam rule, then "also on" with GitHub, YouTube and Instagram as outline ledge buttons. Below the slot, "right now": the live presence card, wide, in every state at the friends panel's fixed height (its playful line or the activity), so the status is said once, by the tag.

FORM: the add-friend request screen named by Lucas in his request (precisely specified, so no concept roll; seed key: none).

Signature interaction: pressing the Play button plays the confirm chord and, while LinkedIn opens in a new tab, the button turns into a "request sent" state (check icon, its label announced politely) for 2.4 seconds, then returns. Under reduced motion the swap is instant.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisions

1. Discord: the live presence plus a link to his Discord profile (asked 2026-10-20).
2. Copy: keep the current promise, a LinkedIn DM and a reply as fast as he can (asked 2026-10-20). New French strings use "tu", like the loadout's.
3. The finish review (2026-10-20) moved the playful status line into "right now" and dropped the card's own status line, so the status shows once on the screen (plus the sidebar).
