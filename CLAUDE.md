# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack is the default bundler)
pnpm build      # Production build
pnpm lint       # ESLint CLI with flat config in eslint.config.mjs (runs in CI on every push)
pnpm test       # Vitest, runs every *.test.ts once (runs in CI on every push)
```

Tests use Vitest (`vitest.config.ts`, Node environment, `@/` alias resolved from `tsconfig.json`, `server-only` aliased to a no-op). They sit next to the module they cover as `*.test.ts` and exercise plain functions, or Effect services through `@effect/vitest` (`it.effect`), through their public interface; React components are not tested. The pre-commit hook exists but its commands are commented out.

## Architecture

Personal portfolio site built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS, and Shadcn/ui.

**Routing** — every public page lives under `app/[locale]/` (Locales `en`, default, and `fr`, defined in `i18n/routing.ts`) and is statically generated for both. `app/[locale]/layout.tsx` is a root layout (there is no `app/layout.tsx`, as `next/root-params` needs the Locale segment to be the root), so the Admin path can add its own root layout beside it; shared fonts are in `app/fonts/index.ts`. `proxy.ts` (next-intl middleware) sends the root address to the Locale from the `NEXT_LOCALE` cookie, then the browser language, falling back to English; it skips `/admin`, `/api`, Next internals and files. Legacy unprefixed Route URLs redirect permanently (308) to English through `redirects()` in `next.config.ts`. Unknown URLs render `app/global-not-found.tsx`. Internal links use `Link`/`usePathname` from `@/i18n/navigation` (Locale-aware), never `next/link` with a bare path.

The one list of Routes is `ROUTES` in `config/routes.ts`: each Route holds its path, the key of its texts under `Routes` in the message dictionaries (`label`, `title`, `description`) and whether it is in the menu. The sidebar menu is generated from it (real links; the active-Route rule is `lib/routes/is-active-route.ts`, applied to the Locale-stripped path). Every page renders `<PageHeader route={ROUTES.x} />` and exports `generateMetadata = routeMetadata(ROUTES.x)` from `components/page-header`, which also declares the page's alternate-Locale URLs. The legacy redirects are derived from `ROUTES` too. Adding a page is one entry in `ROUTES` plus its texts in every dictionary.

**Interface strings** — one message dictionary per Locale in `messages/` (`en.json` is the reference; `global.d.ts` types keys from it, and `messages/messages.test.ts` checks every dictionary has the same keys). Server components use `getTranslations` (from `next-intl/server`), client components `useTranslations`; the Locale comes from the root param (`i18n/request.ts`), so pages need no `setRequestLocale`. Proper nouns (Project titles, Tech names, company names) stay untranslated.

**Layout** — `app/[locale]/layout.tsx` sets `<html lang>`, wraps everything in `NextIntlClientProvider`, `ThemeProvider` (dark default) and `MobileMenuProvider`, then delegates to `app/[locale]/ClientLayout.tsx`. `ClientLayout` renders the `Sidebar` on the left and a scrollable content panel on the right. The sidebar content is mounted once and only restyled between the desktop column and the mobile overlay, so there is a single Lanyard connection and a single set of menu sounds; mobile open state is managed through `contexts/menu-mobile.context.tsx`.

**Content** — Techs, Tech categories, Projects and Experiences live as JSON documents in `content/` (`techs.json`, `tech-categories.json`, `projects.json`, `experiences.json`); edit them by hand or through the Admin (Techs and Tech categories so far). Pages obtain content only through the content catalog in `lib/content/` (Effect v4, server only, see ADR-0002):

- `schema.ts` — Effect Schemas for every document (Localized text with non-empty `en` and `fr`, Tech, Tech category, Project, Experience) and `Content`, which adds the cross-document rules (a Tech is defined once, every referenced Tech exists). `DOCUMENT_PATHS` maps each kind to its file.
- `period.ts` — the `Period` schema (start `YYYY` or `YYYY-MM`; end the same or `"ongoing"`; end not before start) and the ordering by start, most recent first, ongoing first on equal starts (a year counts as its January). Shared by every kind that has a Period.
- `format-period.ts` — `formatPeriod(period, locale)`, the plain Period formatting function (month names per Locale, "Today" / "Aujourd'hui"); no Effect import, so components may use it. Tested in `format-period.test.ts`.
- `repository.ts` — the `ContentRepository` port (`head`, `read`, `commit` with optimistic revision); adapters `repository-local-filesystem.ts` (build time, read-only), `repository-github.ts` (the Admin: Git Data API with the Owner's token, one commit per save on `main`, text or binary files, fast-forward only so a moved `main` is a `ContentConflict`; tested against a fake GitHub `fetch`) and `repository-in-memory.ts` (tests; `makeInMemoryRepository` also lists the commits made).
- `catalog.ts` — the `ContentCatalog` service: decodes and validates all documents, then returns ready-to-render data (`techCategories` with resolved Techs; `projects` ordered by Period, with resolved Techs, a `repository` only for open-source Projects and no zero star count; `experiences` ordered by Period; `videos` most recent first, with only the latest marked `isNew` while under 30 days old, read with Effect `Clock`). Invalid content fails with `ContentInvalid`, naming file and location, which fails the build. Tested in `catalog.test.ts` and `catalog-videos.test.ts`; `content.test.ts` checks that `content/` itself is valid.
- `youtube-channel.ts` — the `YouTubeChannel` source, consumed only by the catalog: `layer` reads the channel's public Atom feed (no API key; any failure is `VideosUnavailable`), `layerTest` serves fixed Videos per channel. The channel identifier is `YOUTUBE_CHANNEL_ID` in `catalog.ts` until the Profile holds it.
- `server.ts` — what pages call (`getTechCategories()`, `getProjects()`, `getExperiences()`, `getVideos()`): plain async functions over a `ManagedRuntime`, so React code never imports Effect. `types.ts` re-exports the content types for components (type-only).

Localized text is returned with both Locales; pages pick `en` until Locales exist. A Tech is rendered only by `components/tech/TechBadge.tsx` (its `#rrggbb` colour, text colour from `lib/text-color-on.ts`).

An Experience's contract type is an identifier (`entrepreneurship`, `permanent`, `work-study`, `internship`); its label is an interface string under `Experiences.contractTypes` in the message dictionaries.

Videos are never written by hand. The Videos page has `revalidate = 86400`: it is regenerated on every deploy and then once a day. `getVideos()` rejects when the feed fails at runtime, so Next keeps serving the previous page; during `next build` (`NEXT_PHASE`) it returns no Videos instead, so the page shows its empty state and the build does not fail.

**Presence** — `components/presence/` uses the `react-use-lanyard` library to display real-time Discord presence in the sidebar. `select-presence.ts` is the plain selection rule (tested in `select-presence.test.ts`): it maps the live Lanyard status to playing (a game, which wins), listening (a Spotify track) or nothing, and builds the artwork URLs. The card is derived from the live status on every render, with no stored state. The Discord user ID is hardcoded in `Presence.tsx`.

**Admin** — `app/admin/` is the Owner's private space: French, server-rendered, `noindex`, out of the menu and outside Locale routing (so no `proxy` logic; the access check lives in the Admin itself). `app/admin/layout.tsx` is the Admin's own root layout and its gate: anyone but the signed-in Owner gets the sign-in or refusal screen. Sign-in is GitHub OAuth (scope `public_repo`, the token later used to commit content): `app/admin/auth/sign-in` redirects to GitHub, `app/admin/auth/callback` keeps the identity in an iron-session sealed cookie (no database; the token is kept for the Owner only). The Owner check is `lib/admin/owner-access.ts` behind the `AdminIdentitySource` interface: every Admin page calls `currentOwnerAccess()` and every Admin Server Action checks the Owner itself (`requireOwnerSession()` in `lib/admin/session.ts`, or `AdminAccess` for content actions, below), since Server Actions are public endpoints. Tests use a fake identity source (`owner-access.test.ts`) and a fake GitHub (`github-sign-in.test.ts`).

Content editing follows one pattern, to copy for every editor. `lib/admin/admin-action.ts` holds `AdminAccess` (the signed-in Owner's content repository, or `NotOwner`) and `saveContent(revision, edit)`: read the content through the catalog's `loadContent`, apply the edit, validate the whole result with the `Content` schema (issues inside the edited entry become French field errors keyed by input path, e.g. `name.fr`, `techs.1`; any other issue refuses the save), then commit only the changed documents on top of the revision the editor was opened at. Every action returns an `AdminActionResult` (`lib/admin/action-result.ts`, plain data): `saved`, `invalid`, `refused`, `conflict`, `not-owner` or `failed`. Actions per kind live in `lib/admin/<kind>.ts` (e.g. `techs.ts`: Techs, whose identifier is fixed once created, and Tech categories, addressed by position), with an `open…Editor` that reads the revision first, then the content; they are tested in `lib/admin/<kind>.test.ts` against an in-memory repository and a fake identity. `lib/admin/server.ts` (server only) runs them over the session and the GitHub repository (`CONTENT_REPOSITORY` in `lib/admin/config.ts`); it is all `app/admin/` imports, so no React code imports Effect. Each editor page (`app/admin/<kind>/page.tsx`) has a `"use server"` `actions.ts` that reads the form and calls `refresh()` after a save; its forms use `AdminForm`, `AdminField` and `LocalizedField` from `app/admin/admin-form.tsx`, and the "live in about a minute" notice comes from `AdminNoticeProvider` in the Admin layout.

Admin environment variables (`.env.local` locally, Vercel Production); `scripts/wizards/admin-github-oauth.sh` creates the OAuth apps and sets them all:

| Variable | Value |
| --- | --- |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials; one app per environment, callback `<origin>/admin/auth/callback` |
| `SESSION_SECRET` | ≥ 32 characters, encrypts the session cookie; changing it signs everyone out |
| `OWNER_GITHUB_ID` | The Owner's numeric GitHub id (`gh api user -q .id`); unset means nobody gets in |
| `AUTH_REDIRECT_URI` | Optional, pins the callback URL (set on Production); otherwise derived from the request |

**3D scene** — `app/[locale]/mdf-2025/` contains a Three.js/React Three Fiber scene celebrating a competition win. Uses `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`.

**UI components** — Shadcn/ui components live in `components/ui/`. Custom typography primitives (`TypographyH2`, `TypographyH3`, `TypographyH4`, `TypographyP`, `Bold`, etc.) are in `components/typography/index.tsx`; prefer these over raw HTML tags for text. They take `children` and an optional `className`; adjust styling through `className` rather than adding props.

**Types** — content types for components come from `lib/content/types.ts`; Lanyard types come from `react-use-lanyard`.

**Images** — remote image hosts are allowed through `images.remotePatterns` in `next.config.ts` (`cdn.discordapp.com`, `media.discordapp.net`, `i.scdn.co`, and `*.ytimg.com/vi/**` for Video thumbnails). Add new hosts there if needed; `images.domains` is deprecated.

## Code conventions

- Path alias `@/` maps to the project root.
- Imports are auto-sorted by `eslint-plugin-simple-import-sort` in groups: CSS → react/next → external packages → `@/` aliases → relative. Run `pnpm lint` to catch violations.
- Prettier enforces double quotes, 2-space indent, trailing commas, semicolons, 80-char line width.
- `"use client"` is only added when a component uses browser APIs, hooks, or event handlers — server components are the default.

## Agent skills

### Issue tracker

Issues and specs are tracked as GitHub Issues on `ImJustLucas/imjustlucas.dev`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
