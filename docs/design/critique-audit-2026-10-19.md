# imjustlucas.dev: Impeccable critique and audit

**Date:** 2026-10-19
**Branch:** `spec/4-content-admin-locales` at `b7c1179`
**Method:** dual-agent. Assessment A (design review) and Assessment B (detector and browser overlay) ran as two isolated sub-agents. A finished before any detector output reached the synthesis. The parent session then did the code-level audit and its own browser checks.
**Scope:** every public page under `app/[locale]/` in en and fr (`/`, `/what`, `/how`, `/experiences`, `/videos`, `/contact`, `/mdf-2025`, the 404), plus the sidebar, cards, presence and typography primitives. `app/admin` was not reviewed.
**How it was looked at:** a production build (`pnpm build && pnpm start`) on localhost:3100, viewed at 1440, 1280, 1024 and 375 px, in dark and light themes.
**Read-only:** no repo file was changed. The detector's live server created a temporary `.impeccable/live/` folder; it was removed, and `git status` is clean. The critique snapshot was not saved to `.impeccable/critique/` because the brief is read-only.
**Mode:** Experience (a portfolio). Heuristics 7 and 10 are scored n/a.

> Context: there is no PRODUCT.md and no DESIGN.md yet (Lucas will run `/impeccable init`). Product context comes from CLAUDE.md, GLOSSARY.md, `content/`, `messages/` and the session brief. This report is input for choosing a direction. It does **not** propose one.

---

## Part 1: Critique (UX and design)

### Design health score (Nielsen)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | The active-route dot works. Presence has no "live" or "now" label and disappears when idle. Video thumbnails show as black boxes until they load. |
| 2 | Match with the real world | 2 | The menu says "me / what i've done / how i do it / yt videos": charming, but a recruiter has to translate it into "Projects" and "Stack". The VIE request targets September 2025, and it is now October 2026. |
| 3 | User control and freedom | 2 | `select-none` on the whole app blocks copying any text. Escape does not close the mobile menu. The Locale switch keeps you on the equivalent page, which is good. |
| 4 | Consistency and standards | 2 | Title casing varies: "Who am i?", "What i've done ?" (French space before `?` in English), "youtube videos". Project cards come out at different widths. Experience rows are links with no link styling and open in the same tab, while every other external link opens a new one. |
| 5 | Error prevention | 3 | A static site with little to get wrong. External links do not say they open a new tab. |
| 6 | Recognition rather than recall | 3 | Navigation is persistent and labelled, with a clear active state. The footer has 6 icon-only controls. |
| 7 | Flexibility and efficiency | n/a | A portfolio has no expert paths. |
| 8 | Aesthetic and minimalist design | 2 | Minimal, but generic. At 1440 px about a third of the width sits empty on /what, /how and Home. Home spends its space on FAQ trivia instead of the work. |
| 9 | Error recovery | 3 | The 404 is localized and links home. It is plain text, with no personality and no suggestions. |
| 10 | Help and documentation | n/a | Not applicable to a portfolio. |
| **Total** | | **19/32 (59%)** | **Acceptable.** Significant improvements are needed. Heuristics 7 and 10 are n/a. |

### Design specificity verdict

**What the design review found:** the site could belong to almost any developer. It is shadcn's default zinc theme with no changes (`styles/globals.css:16-69`), arranged as a sidebar, cards and an accordion. Even the intended typeface never shows: `body { font-family: Arial, Helvetica, sans-serif }` (`styles/globals.css:5-7`) wins. The Geist variables are declared in `app/[locale]/layout.tsx:55`, but nothing uses them, because `tailwind.config.ts` defines no `fontFamily`. In the browser, the body and every heading compute to Arial.

The only authored touches are:
- the "Yoooo" intro
- the `>` terminal prompt in the brand
- the chibi avatar in the bottom-right corner
- the menu click sound
- the Discord/Spotify presence card, which is usually invisible
- the 3D MDF 2025 trophy page, which nothing links to
- the Videos page, the only place where Lucas's face, colour and life show up

The Contact page says outright that the design is not his ("largely inspired by phineas & antoinek").

**What the detector found:**
- **CLI scan:** `impeccable detect` over `app/[locale]` and `components` (37 .tsx files) returned **0 findings**. Every real issue only appears at runtime.
- **Browser overlay:** injected on /en, /en/what, /en/experiences, /fr/how and /en/contact. It found three real issues:
  1. **overused-font, "Arial 100% of text"** on every page. This confirms the design review.
  2. **Low contrast on the Tech badges:** 5 on /en/what and 14 on /fr/how, from 2.1:1 to 4.0:1. The design review had praised these badges as the only system colour and missed that they fail contrast.
  3. **Skipped heading levels** on every page: the invisible h1, then the sidebar's h3 "> ImJustLucas", then the page's h2. Home also goes from h2 straight to h4.
- **False positives:**
  - cramped-padding on the FAQ accordion: the trigger has 16 px of vertical padding.
  - nested-cards on Badges: a Badge pill is not a card.
  - cramped-padding on the ProjectCard footer (likely false).
- **Overlay:** none is visible to Lucas now. The overlay was injected into a hidden pane, and the live server is stopped.

### Overall impression

The architecture is clean and the content is real, but the shell is a template, and everything personal is buried. The warm "Yoooo, I'm Lucas!" sits in a grey Arial frame. The two strongest moments are a 3D trophy nobody can find and the Videos page. The menu ends on the weakest, most dated page, Contact.

**Biggest opportunity:** the personality already exists in the content (esports, karaoke, extreme sports, sound, live presence, a game-like trophy). The shell simply does not express it.

### What's working

1. **Solid content and routing architecture.** There is one `ROUTES` list, with real `<a>` links and `aria-current`. The Locale switch keeps you on the same page, the 404 is localized, and fr is at full parity: French copy did not overflow anywhere at 375 px. Whatever direction is chosen, it can re-skin this without re-plumbing.
2. **Real personal building blocks already exist.** The live Discord/Spotify presence (`components/presence/`), the menu click sound, the chibi avatar, and the R3F cheque scene with coin and impact sounds.
3. **The Techs already carry colour.** Each Tech has its own colour in `content/techs.json`, and the badge computes its text colour. The mechanism is right; only its threshold is wrong (see the audit).

### Priority issues

1. **[P1] The site has no visual identity of its own.**
   - **Where:**
     - Arial override: `styles/globals.css:5-7`.
     - Geist loaded and preloaded, but unused: `app/fonts/index.ts`, with no `fontFamily` in `tailwind.config.ts`.
     - Stock zinc tokens: `globals.css:16-69`.
     - No accent colour: `--primary` is near-white in dark mode and near-black in light mode.
   - **Why it matters:** for a portfolio, the look is the product. Today nothing visual says "Lucas", which is exactly the gap he wants to close.
   - **Fix:**
     - Wire a real typeface into `fontFamily.sans/mono` and delete the Arial rule.
     - Add a token layer (accent, surfaces, display face) that the future direction can theme, instead of reusing shadcn's neutral defaults.
   - **Commands:** `/impeccable typeset`, then `/impeccable colorize`, then `/impeccable bolder` once a direction is chosen.

2. **[P1] The Projects page undersells the work.**
   - **Where:** `/what`, and `components/projects/ProjectCard.tsx:30`.
   - **Content:**
     - There are 5 Projects, and 2 of them are boilerplates.
     - Predi.GG has `techs: []`, and its copy ("Predict, compete, and win") never says esports, although its own screenshot says "Prédire. Vibrer. Gagner. sur l'esport".
     - Qotum has no link.
     - Home never shows a Project.
   - **Layout:** cards have a fixed `h-[500px]` and `max-w-sm` inside a `flex-wrap`. That gives ragged widths (339 vs 384 px), and an empty right third at 1440 px.
   - **Fix:**
     - Feature one lead Project, with role and outcome.
     - Use an even grid.
     - Give each card one line for "what it is / my role / result".
     - Surface Projects on Home.
   - **Commands:** `/impeccable layout`, then `/impeccable clarify`.

3. **[P1] Stale copy, and copy that undermines Lucas.**
   - **Where:** `messages/en.json` and `messages/fr.json` under `Contact`, and `content/profile.json`.
   - **Problems:**
     - The VIE request targets September 2025.
     - "The design is not mine basically".
     - LinkedIn DMs are the only contact channel.
     - The EN Resume is dated 2025-05-28, while the FR one is dated 2025-10-07.
     - The /how intro is stock copy ("I leverage cutting-edge technologies…").
   - **Why it matters:** a recruiter reads this as "abandoned".
   - **Fix:**
     - Rewrite Contact as a confident close: what he is open to now, the channels, a CTA.
     - Move the credit to a quiet footer note.
     - Align the two Resumes.
   - **Command:** `/impeccable clarify`.

4. **[P2] Accessibility and semantics gaps.** These are detailed in the audit. In short:
   - Tech badge contrast fails.
   - `select-none` everywhere.
   - No `<main>` landmark.
   - An invisible h1, and headings out of order.
   - Experience rows are whole-block links.
   - `cursor-pointer` on things that do nothing.
   - The mobile menu is not modal.
   - **Commands:** `/impeccable harden`, then `/impeccable audit`.

5. **[P2] The best moments are hidden.**
   - **Where:**
     - MDF 2025 is unreachable: `config/routes.ts:33` sets `inMenu: false`, no page links to it, and Experiences does not mention it.
     - Presence renders `null` whenever Lucas is idle (`components/presence/Presence.tsx:21`).
   - **Why it matters:** the peak-end rule is broken. The peak cannot be reached, and the end of the menu (Contact) is the low point.
   - **Fix:**
     - Link MDF from Home and Experiences as a trophy moment.
     - Give Presence an idle state with a label.
   - **Commands:** `/impeccable delight`, then `/impeccable layout`.

### Cognitive load: 4 of 8 checks fail (moderate)

1. **Single focus:** Home gives equal weight to the intro, "Creative Mindset", the Resume and the FAQ. Nothing points to the work.
2. **Visual hierarchy:** every page title is the same h2 (`components/page-header/index.tsx:13`). The only h1 is invisible. Headings and body share one weight range of Arial.
3. **At most 4 options per decision point:** a visitor faces 6 menu items, 6 icon-only footer controls and the avatar, so 13 targets.
4. **Working memory:** the clever menu labels have to be translated in the head.

### Emotional journey

- **Entry:** warm copy inside a cold shell.
- **Valleys:**
  - /how is stock copy.
  - /what has thin Projects.
  - /contact is a disclaimer, a stale VIE request and a list of destinations.
- **Peaks:**
  - /videos: faces, ski footage, colour.
  - /mdf-2025: a national win as a clickable 3D cheque with coin sounds. It is orphaned.

### Persona red flags

- **Jordan (recruiter, first visit):**
  - Nothing above the fold says the role or what Lucas is open to.
  - The menu says "what i've done", not "Projects".
  - The Contact page asks for a 2025 VIE.
  - The Resume is 17 months old.
  - The MDF 2025 national win is invisible.
- **Sam (screen reader or keyboard):**
  - No `<main>` and no skip link.
  - The first heading is an invisible h1, followed by an h3 brand above the h2.
  - Each Experience entry is announced as one huge link.
  - Escape does nothing in the mobile menu, and the page behind it stays focusable (it is only blurred).
  - Focus on menu items is a background tint only (`focus:outline-none`).
- **Casey (mobile, 375 px):**
  - The top of the page shows no name or brand, only a 36 px ghost hamburger floating over the title.
  - The fixed chibi avatar overlaps the last FAQ row and the diploma badges.
  - "2023 - 2025" wraps inside a badge.
  - Each Project card is a 500 px-tall block.
  - Card buttons are 32 px tall.
- **The 30-second skimmer (recruiter or fellow dev):** they get a name, a city and "high-quality websites", plus FAQ trivia. They never see:
  - a featured Project
  - the current roles (Bam Karaoke, and co-founder of Predi.GG)
  - the MDF win
  - any GitHub signal beyond "37 stars" on a boilerplate

### Minor observations

- Card images are site screenshots with baked-in frames, and they clash in light mode. Two of them show the chibi head cropped at the top.
- The WIP badge is a hard-coded `bg-yellow-400` (`ProjectCard.tsx:56`), the only colour outside the system.
- The 404 has no voice: "Page not found", plus a text link.
- In light mode, the content panel (`#fafafa`) on the page (`#fff`) is barely distinguishable.

### Questions to consider

1. If a visitor remembers one thing after 10 seconds, should it be "dev in Paris" or "the dev who skates, surfs, sings karaoke and builds esports prediction apps"?
2. Why is the national competition win the hardest page on the site to find?
3. Do "me / what / how" earn their cleverness, or should the personality live somewhere other than vague labels?
4. Is the dark, sober shell a deliberate stance, or just what shadcn shipped with? Would anything be lost by dropping it?
5. Should "more Projects" mean more cards, or fewer, deeper stories, given that 2 of the 5 are boilerplates?

---

## Part 2: Audit (technical quality)

### Audit health score

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | 19 Tech badges fail AA contrast, `select-none` is global, there is no `<main>`, and the mobile menu is not a modal. |
| 2 | Performance | 3 | Static pages and next/image are good. Two Geist fonts are preloaded and never used. The MDF scene runs shadows and bloom with no DPR cap and no reduced-motion path. |
| 3 | Responsive design | 3 | Works on mobile with no French overflow. Touch targets are 32–36 px, cards have a fixed height, and the 3D stage is a fixed 600 px. |
| 4 | Theming | 2 | Stock shadcn tokens with no accent. A text token is used as a surface. Colours are hard-coded (WIP badge, MDF gradient, scrollbar). Font tokens are not wired. |
| 5 | Implementation integrity | 2 | The Arial override, an SEO h1 hidden with `opacity-0`, dead classes, Separators used as spacers, and diplomas living outside `content/`. |
| **Total** | | **12/20** | **Acceptable.** Significant work is needed. |

### Implementation integrity verdict: **fail, but cheaply fixable**

The plumbing is coherent: Routes, the content catalog and next-intl. The visual layer is not a system. The declared type tokens are never applied, the colour tokens are untouched shadcn defaults, a few colours are hard-coded around them, and there is styling that does nothing (`group-hover` without a `group`, scrollbar CSS on an element that never scrolls). The detector's CLI scan was clean. The three real problems it found at runtime (Arial, badge contrast, heading order) all come from that drift.

### Executive summary

- **Score:** 12/20 (Acceptable).
- **Issues:** 0 P0, 4 P1, 10 P2, 5 P3.
- **Top issues:**
  1. Tech badge contrast: 19 badges at 2.1–4.0:1.
  2. The global `select-none`.
  3. Geist is never applied, and Arial ships instead.
  4. The mobile menu is not a modal: no Escape, no focus containment, the page behind stays interactive.
- **Next steps:**
  - Fix the four P1s. Each is small.
  - Settle the token and type foundation during `/impeccable init`, before any re-skin.

### Findings by severity

#### P1: Major

1. **Tech badge text fails WCAG AA contrast.**
   - **Location:** `lib/text-color-on.ts:14`, used by `components/tech/TechBadge.tsx:15`.
   - **Category:** Accessibility.
   - **Impact:** 14 px semibold badge text is hard to read on most Tech colours. Measured ratios:

     | Tech colour | Ratio |
     |---|---|
     | Elysia #38bdf8 | 2.1:1 |
     | Zod, MongoDB #22c55e | 2.3:1 |
     | React #60a5fa | 2.5:1 |
     | Git, Claude #f97316 | 2.8:1 |
     | Node.js #16a34a | 3.3:1 |
     | Styled Components #ec4899 | 3.5:1 |
     | Claude Code #ea580c | 3.6:1 |
     | TypeScript, Docker, Gemini #3b82f6 | 3.7:1 |
     | NestJS, Tanstack #ef4444 | 3.8:1 |
     | Shadcn/ui #a855f7 | 4.0:1 |

   - **Standard:** WCAG 1.4.3 (AA).
   - **Cause:** text switches to black only when luminance is above 0.5. The point where black and white give equal contrast is about 0.18.
   - **Recommendation:** pick whichever of black or white has the higher contrast ratio, rather than using a luminance threshold. Add a unit test next to the module, which is the repo's convention.
   - **Command:** `/impeccable harden`.

2. **`select-none` on the whole app.**
   - **Location:** `app/[locale]/ClientLayout.tsx:15`.
   - **Category:** Accessibility, implementation.
   - **Impact:** visitors cannot copy his name, a Project name, a company or an error. Anyone who copies text into a translator or note-taker is blocked.
   - **Recommendation:** remove it. If needed, scope it to the menu buttons only.
   - **Command:** `/impeccable harden`.

3. **The intended typeface is never applied.**
   - **Location:** `styles/globals.css:5-7` (`body { font-family: Arial… }`), `tailwind.config.ts` (no `fontFamily`), `app/fonts/index.ts`.
   - **Category:** Implementation integrity, performance, theming.
   - **Impact:**
     - Everything renders in Arial.
     - `GeistVF.woff` and `GeistMonoVF.woff` are still preloaded on every page, which wastes bytes and preload priority.
   - **Recommendation:** wire `fontFamily.sans = ["var(--font-geist-sans)", …]`, or the typeface the future direction picks. Delete the Arial rule. Drop the mono preload if mono is not used above the fold.
   - **Command:** `/impeccable typeset`.

4. **The mobile menu is not a modal.**
   - **Location:** `components/sidebar/Sidebar.tsx:27-50`, `app/[locale]/ClientLayout.tsx:18`.
   - **Category:** Accessibility.
   - **Impact:** the browser check confirmed the menu stays open after Escape. The page behind it is only blurred: it stays in the tab order and the accessibility tree. There is no `role="dialog"` or `aria-modal`, no focus move into the menu and no focus return. The toggle has `aria-expanded` but no `aria-controls`.
   - **Standard:** WCAG 2.4.3 (focus order) and 2.1.1 (keyboard).
   - **Recommendation:** use a Sheet or Dialog primitive (Radix is already a dependency), or add Escape handling, `inert` on the content and focus management.
   - **Command:** `/impeccable harden`.

#### P2: Minor

5. **No `<main>` landmark and no skip link.**
   - **Location:** `ClientLayout.tsx:17`. The content wrapper is a `div`.
   - **Category:** Accessibility.
   - **Impact:** a keyboard user has to tab through 6 menu items before reaching any content.
   - **Standard:** WCAG 1.3.1 and 2.4.1.
   - **Recommendation:** make the content wrapper `<main>` and add a "Skip to content" link.
   - **Command:** `/impeccable harden`.

6. **The heading outline is broken.**
   - **Location:**
     - An invisible SEO h1 "ImJustLucas": `app/[locale]/layout.tsx:66`, `absolute top-96 opacity-0`.
     - The sidebar brand is an h3: `components/sidebar/Sidebar.tsx:58`.
     - Page titles are h2: `components/page-header/index.tsx:13`.
     - Home jumps from h2 to h4: `app/[locale]/page.tsx:39` and `:58`.
     - The FAQ triggers are h3 under that h4.
   - **Category:** Accessibility, implementation.
   - **Impact:** screen-reader heading navigation gets a phantom h1 and a disordered tree. Hiding text with `opacity-0` is also a fragile SEO trick.
   - **Recommendation:** make each page title a visible h1, and make the brand a non-heading.
   - **Command:** `/impeccable harden`.

7. **Experience entries are whole-block links with no affordance.**
   - **Location:** `app/[locale]/experiences/page.tsx:46`.
   - **Category:** Accessibility, consistency.
   - **Impact:**
     - Each link's accessible name is the period, company, role, contract type and description all at once.
     - Nothing visual says the entry is a link.
     - These links open in the same tab, while every other external link opens a new one.
   - **Recommendation:** make the company name the link, give it a visible link style, and use the same `target` policy as the other external links.
   - **Command:** `/impeccable clarify`.

8. **False affordances.**
   - **Location:**
     - `cursor-pointer` on the avatar wrapper: `layout.tsx:69`.
     - `cursor-pointer` on the presence cards: `components/presence/PresenceActivity.tsx:18`, `PresenceListening.tsx:20`.
   - **Category:** Accessibility, consistency.
   - **Impact:** these elements look clickable but nothing happens when you click them.
   - **Recommendation:** remove the pointer, or make them real controls.
   - **Command:** `/impeccable polish`.

9. **Weak or mouse-triggered focus indicators.**
   - **Location:**
     - Menu items use `focus:outline-none` plus a `bg-primary/20` tint: `components/sidebar/menu/MenuItem.tsx:28`. Because it uses `:focus` rather than `:focus-visible`, the tint also shows after a mouse click, and the focused item looks almost the same as the active one.
     - Outline buttons get only a 1 px ring.
   - **Category:** Accessibility.
   - **Standard:** WCAG 2.4.7, and 2.4.11 (2.2).
   - **Recommendation:** use a `focus-visible` ring with at least a 2 px offset ring in the accent colour.
   - **Command:** `/impeccable harden`.

10. **Touch targets are under 44 px.**
    - **Location, measured at 375 px:**
      - hamburger: 36×36
      - ProjectCard GitHub and "open" buttons: 32 px tall
      - footer social, Locale and theme buttons: 36×36
    - **Category:** Responsive.
    - **Standard:** WCAG 2.5.8 (24 px minimum) passes. The 44 px platform guideline does not.
    - **Recommendation:** at least 44 px hit areas on touch devices.
    - **Command:** `/impeccable adapt`.

11. **The Project grid is rigid.**
    - **Location:** `ProjectCard.tsx:30` (`max-w-sm h-[500px]`), and the `flex-wrap` at `app/[locale]/what/page.tsx:21`.
    - **Category:** Responsive.
    - **Impact:** card widths are uneven, a third of the page is empty at 1440 px, and a long description is clipped while a short one leaves a hole.
    - **Recommendation:** an auto-fill grid with intrinsic card height.
    - **Command:** `/impeccable layout`.

12. **The MDF 2025 scene has no performance or motion guardrails.**
    - **Location:**
      - `app/[locale]/mdf-2025/components/master-dev-scene.tsx:390`: `<Canvas shadows>` with no `dpr` cap and continuous `frameloop`, plus Bloom and Vignette post-processing.
      - `app/[locale]/mdf-2025/page.tsx:17`: a fixed `h-[600px]` stage.
    - **Category:** Performance, accessibility.
    - **Impact:**
      - It renders at full device pixel ratio with post-processing every frame, which is heavy on laptops and phones.
      - There is no `prefers-reduced-motion` path anywhere in the codebase.
      - The canvas has no text alternative.
      - Coin and impact sounds play with no mute control.
      - drei's `Environment preset` fetches an HDRI from a third-party CDN at runtime.
      - The 600 px stage is taller than most phone viewports.
    - **Recommendation:**
      - Set `dpr={[1, 2]}`.
      - Use `frameloop="demand"` once the scene settles.
      - Add a reduced-motion still.
      - Add an `aria-label` or visible caption, and a sound toggle.
      - Self-host the HDRI.
      - Size the stage with `min(600px, 70dvh)`.
    - **Command:** `/impeccable optimize`.
    - **Verification note:** the pane was hidden, so the canvas did not render here (it stayed at 300×150). Check the scene itself in a foreground browser.

13. **Token misuse, and light-mode surfaces that barely separate.**
    - **Location:** `ClientLayout.tsx:18` uses `bg-primary-foreground`, a text token, as the content surface.
    - **Category:** Theming.
    - **Impact:** any re-theme of `primary` silently changes the page background. In light mode the panel (#fafafa) on the page (#fff) barely separates.
    - **Recommendation:** add `--surface` and `--surface-raised` tokens.
    - **Command:** `/impeccable colorize`.

14. **A React hydration error (#418) on every page.** *(to verify)*
    - **Location:** seen in the browser pane console on /en/what and /en/mdf-2025.
    - **Category:** Implementation integrity.
    - **Impact:** React throws away the server HTML for part of the tree and re-renders it on the client. That can cause a flash and extra work.
    - **Likely suspects:** the theme or `<html>` attributes, or locale-formatted dates. Note that `app/[locale]/page.tsx:52` formats `resume.lastUpdated` with `new Date()`. The pane may itself be a factor.
    - **Recommendation:** reproduce in a normal browser with `pnpm dev` to get the unminified message.
    - **Command:** `/impeccable harden`.

#### P3: Polish

15. **Hard-coded colours outside the tokens.**
    - `ProjectCard.tsx:56`: WIP badge `bg-yellow-400 text-black`.
    - `mdf-2025/page.tsx:17`: gradient `from-blue-800 via-indigo-600 to-purple-500`.
    - `globals.css:81-91`: scrollbar `#f3f4f6` / `#6b7280`. This is dead code anyway: the body never scrolls, only the inner panel does.
    - **Command:** `/impeccable colorize`.

16. **Dead or misleading styling.**
    - `ProjectCard.tsx:48,80,102`: `group-hover:*` classes with no `group` parent.
    - `ProjectCard.tsx:38`: `transition-transform` with no transform.
    - `app/[locale]/page.tsx:37,42,56`: `<Separator className="my-8 h-0">` used as an invisible spacer, which still exposes `role="separator"`.
    - **Command:** `/impeccable polish`.

17. **Diplomas are hard-coded in the component.**
    - **Location:** `components/diplomas/AllDiplomas.tsx:15`.
    - **Impact:** this breaks the project's rule that content lives in `content/` and is edited through the Admin.
    - **Command:** none from Impeccable. It is a content-model task.

18. **Image alt text repeats the adjacent title.**
    - **Location:** `ProjectCard.tsx:35`, `VideoCard.tsx:21`.
    - **Recommendation:** use an empty alt, or describe the screenshot.
    - **Command:** `/impeccable polish`.

19. **The menu click sound has no opt-out.**
    - **Location:** `MenuItem.tsx:17`. It plays on every navigation.
    - **Impact:** fine as personality, but there is no global mute, which matters even more if sound becomes part of the identity.
    - **Command:** `/impeccable delight`, to be designed together with any music direction.

### Patterns and systemic issues

- **Declared but not applied:** the font variables, the `group-hover` classes and the scrollbar styles all describe a system that the rendered page does not use.
- **Personality as one-offs:** sound, presence, the avatar and the 3D scene are each isolated, with no shared tokens, no shared motion language and no sound toggle.
- **Accessibility handled per component:** good `sr-only` labels on icon buttons and the Locale switch, but no page-level structure (landmarks, outline, modal behaviour).

### Positive findings

- Icon-only buttons have `sr-only` labels. The Locale switch sets `hrefLang` and `lang`. Menu items use `aria-current="page"`.
- Every public page is statically generated, and `next/image` is used with `sizes` everywhere.
- The site is fully translated, and the French copy fits at 375 px.
- The badge text colour is already computed, so fixing contrast is a one-function change.
- There is no horizontal overflow at 375 px in the pane's own measurement (Assessment A measured 4 px; treat it as a minor check).

### Recommended actions (audit)

1. **[P1] `/impeccable harden`:** badge contrast in `lib/text-color-on.ts`, remove the global `select-none`, make the mobile menu a modal, add `<main>` and a skip link, fix the heading outline, use `focus-visible` rings.
2. **[P1] `/impeccable typeset`:** wire the font tokens and delete the Arial rule. Ideally do this together with the direction work.
3. **[P2] `/impeccable layout`:** the Projects grid, and Home hierarchy that points to the work.
4. **[P2] `/impeccable optimize`:** MDF scene DPR, frameloop, reduced motion, HDRI, stage height.
5. **[P2] `/impeccable adapt`:** 44 px touch targets, the avatar overlapping content on mobile.
6. **[P2/P3] `/impeccable colorize`:** surface tokens, and bring the hard-coded colours into the system.
7. **`/impeccable polish`:** dead classes, false affordances, alt text.

---

## Part 3: Opportunities for a more personal, colourful identity

These are observations only. No direction is chosen; that is for `/impeccable init`, `/grill-with-docs` and the prototypes. Each item points to something that already exists in the content or code.

### Music

- **The Spotify card already exists** (`components/presence/PresenceListening.tsx`) but disappears when nothing is playing. It could become a permanent "now / last played" fixture. Album artwork is also a natural source of colour.
- **Bam Karaoke** is the current job (🎤 in `content/experiences.json`), and the site never highlights it.
- **Sound is already part of the site's language:** the menu click and the MDF coin and impact sounds. A coherent sound kit (with a global toggle) could become a signature, not a gimmick.

### Skate and surf

- **Tricks / The Tricks Network** ("a social network for extreme sports 🤙") appears both as a Project and as an Experience. That is real credibility for the theme, not decoration.
- **The 🤙 and the ski vlog on /videos** are the only places where board culture shows. Possible territories to explore: board graphics, sticker-bombed textures, wave or board motion in transitions, photo-led layouts.
- **The 404 and empty states have no voice**, so they are low-risk places to try a tone ("wiped out", "flat spell").

### League of Legends and esports

- **Predi.GG** is an esports prediction product that Lucas co-founded ("Prédire. Vibrer. Gagner. sur l'esport", and a `.GG` domain). The card copy hides all of that.
- **The Discord "playing" card** (`PresenceActivity.tsx`) already shows game artwork and state live. It could carry the in-game identity: champion, role, rank.
- **The MDF trophy and its coin mechanic** already behave like a game reward: an achievement or loot moment that could be linked from Home and Experiences.
- **Possible territories:** HUD or client-UI framing, rank-tier colour ramps, achievement unlocks for milestones.

### Colour and system levers, whatever the direction

- **Each Tech already has its own colour** in `content/techs.json`. A colourful identity can grow from data that already exists instead of being painted on. Fix the badge contrast first.
- **The visual layer is easy to replace:** the token layer (`globals.css`, `tailwind.config.ts`) is a single file pair, and the type tokens are unused today. Replacing them all at once costs little.
- **There is no accent colour today.** Any direction needs one primary accent and a surface ramp, plus a decision about whether light mode stays.
- **The chibi avatar** is fixed, shows a pointer and does nothing. It is a ready mascot or easter-egg spot, as long as it stops covering content on mobile.
- **The FAQ** ("Coffee or tea?") could hold real hobbies: skate spot, home break, main champion, current loop.
- **The Videos page** is the only place his life is visible. Photos and video stills of skate, surf and ski could feed the whole site's imagery.
- **"More Projects":** Predi.GG, Bam Karaoke and Tricks are stronger stories than the two boilerplates. A "featured" flag in `content/projects.json` would let the Admin control what leads.

### Tensions to decide during the direction work

- **Colourful vs readable:** high-saturation palettes will multiply the badge-contrast problem unless contrast is computed in the system.
- **Four interests vs one identity:** music, skate, surf and LoL could become one composite world, a primary world with the others as accents, or per-section themes. Each has very different costs.
- **Personality vs a recruiter's 30 seconds:** whatever direction wins, role, current work and the MDF win must stay above the fold.

---

## Questions for Lucas

The critique asks these directly. Since this was a background session, they are listed here for the next design discussion.

1. **Priority:** what should come first?
   - (a) The foundations: font, tokens, accessibility P1s. These are cheap and help any direction.
   - (b) The Projects and Home hierarchy.
   - (c) Going straight to direction prototypes.
2. **Tone:** which way should the personality lean?
   - (a) A dark base with one loud signature colour.
   - (b) A fully colourful, playful world (board or sticker culture).
   - (c) Game-UI and HUD energy (LoL or esports).
3. **Scope of "more Projects":**
   - (a) Add more cards.
   - (b) Fewer, deeper case studies (Predi.GG, Bam Karaoke, Tricks), with the boilerplates demoted.
   - (c) Both, using a "featured" tier.
4. **Off-limits:** should anything stay as it is?
   - the sidebar layout
   - the menu labels "me / what / how"
   - dark-by-default
   - the 3D MDF page
