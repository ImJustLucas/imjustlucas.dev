# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The site has no single lead audience; all four are confirmed and served together:

- **Recruiters and hiring teams**, in France and abroad, deciding whether Lucas fits a role. They skim the home page, the Projects, the Experiences and the Resume.
- **Clients and partners**, who might commission work from Lucas or partner with Predi.GG. They want proof that he ships real products.
- **Developer peers and his community**, including his YouTube audience and people who know him online, who come for the person as much as the work.
- **Lucas himself.** It is his personal home on the web, not only a hiring funnel.

The **Owner** (Lucas) is also the only user of the private Admin, where he edits the content.

## Product Purpose

imjustlucas.dev presents who Lucas is, what he has built, how he builds it, his career, and the videos he publishes, in English and French. It stays current with little effort: the Owner edits content through the Admin, which commits it to the repository, and star counts and Videos refresh on their own from GitHub and YouTube.

Success means any of the four audiences leaves with an accurate, vivid picture of Lucas and an easy way to reach him (LinkedIn, the Resume, social links).

## Positioning

Three claims, held equally, with none leading:

- **A builder who ships**: founder-minded, with products in production (Predi.GG, which he co-founded, Qotum, Favikon, Bam Karaoke), not only side projects.
- **Recognised craft**: winner of MasterDevFrance 2025, a national competition for technical excellence in software development.
- **A creative personality**: a playful developer with a life behind the code, shown live through his Discord presence, his videos and the FAQ.

## Operating Context

- Public pages (Routes in `config/routes.ts`): me (home, with Resume download and FAQ), what i've done (Projects), how i do it (Techs by Tech category), my experiences (Experiences and diplomas), yt videos, contact, plus the MasterDevFrance 2025 page, reachable by URL but kept out of the menu.
- Every public page exists in both Locales (English default, French) and is statically generated; Projects and Videos regenerate daily.
- The sidebar menu sits beside a scrollable content panel; on mobile the sidebar becomes an overlay.
- The Admin (`/admin`) is French only, private, GitHub sign-in for the Owner alone, and works through forms: one save makes one commit on `main`.

## Capabilities and Constraints

- Content (Projects, Experiences, Techs, Tech categories, Profile) lives as JSON in `content/` and reaches pages only through the content catalog; the domain vocabulary is in `GLOSSARY.md`.
- **Locale parity**: every visible string of a public page exists in both Locales, and no page mixes languages. Proper nouns (Project titles, Tech names, company and school names) and Video titles stay untranslated.
- Star counts and Videos are never written by hand; when the source is down, the page shows the previous version, or the empty state on a fresh build.
- Live Discord presence through Lanyard: what Lucas is playing or listening to, derived on each render.
- Theme: light, dark and system, dark by default.
- Uploads through the Admin: Project images (PNG, JPEG, WebP, AVIF) and Resume PDFs, 4 MB maximum.
- **Open decision**: the Contact page still asks for a VIE starting September 2025, which is out of date. Whether to remove it or replace it with a current request is undecided.
- **Not binding**: the Contact note crediting phineas and antoinek as the design's inspiration, and the MDF 2025 Three.js scene, may change or go in later work.

## Brand Commitments

- Name and handle: **ImJustLucas** / imjustlucas, explained in the FAQ as "my reminder to keep it real and stay humble".
- **Voice (binding)**: casual and playful, first person. Greetings like "Yoooo", emojis in copy and content, lowercase menu labels ("what i've done", "how i do it", "yt videos"). Formal or corporate rewrites would break it.
- **Live Discord presence (binding)**: the presence card stays part of the site.
- Avatar: the chibi ImJustLucas head, `public/images/chibi-avatar-64x64.png`, used in the sidebar.

## Evidence on Hand

- Projects with images (`content/projects.json`, `public/images/projects/`), some open source with live GitHub star counts.
- Experiences (`content/experiences.json`) and three diplomas (Master's, Bachelor's, French Baccalaureate).
- Resume PDFs per Locale (`public/pdf/`).
- MasterDevFrance 2025 win, with its own page and the prize cheque image (`public/images/mdf-cheque.png`).
- Videos from the YouTube channel; the page has an empty state for when there are none.
- No testimonials, client quotes, press or metrics exist; future work must not invent any.

## Product Principles

1. **One person, four readers.** Every page should work for a recruiter skimming, a client checking proof, a peer browsing, and Lucas showing off his corner of the web, without a single funnel taking over.
2. **Proof over claims.** Shipped products, the MDF 2025 win, live star counts and real Videos carry the message; adjectives don't.
3. **Personality is the product.** The playful voice and live presence are what make this Lucas's site and not a template; keep them on equal footing with the work.
4. **Effortless to keep current.** Anything new must be editable through the Admin or sourced automatically, never hard-coded.
5. **Equal in both Locales.** French is a first-class reading, not a translation afterthought.
