# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack is the default bundler)
pnpm build      # Production build
pnpm lint       # ESLint CLI with flat config in eslint.config.mjs (runs in CI on every push)
pnpm test       # Vitest, runs every *.test.ts once (runs in CI on every push)
```

Tests use Vitest (`vitest.config.ts`, Node environment, `@/` alias resolved from `tsconfig.json`). They sit next to the module they cover as `*.test.ts` and exercise plain functions through their public interface; React components are not tested. The pre-commit hook exists but its commands are commented out.

## Architecture

Personal portfolio site built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS, and Shadcn/ui.

**Routing** — all pages live under `app/` following Next.js App Router conventions. The one list of Routes is `ROUTES` in `config/routes.ts`: each Route holds its path, menu label, page title, description and whether it is in the menu. The sidebar menu is generated from it (real `next/link` links; the active-Route rule is `lib/routes/is-active-route.ts`). Every page renders `<PageHeader route={ROUTES.x} />` and exports `generateMetadata = routeMetadata(ROUTES.x)` from `components/page-header`. Adding a page is one entry in `ROUTES`.

**Layout** — `app/layout.tsx` wraps everything in `ThemeProvider` (dark default) and `MobileMenuProvider`, then delegates to `app/ClientLayout.tsx`. `ClientLayout` renders the `Sidebar` on the left and a scrollable content panel on the right. The sidebar content is mounted once and only restyled between the desktop column and the mobile overlay, so there is a single Lanyard connection and a single set of menu sounds; mobile open state is managed through `contexts/menu-mobile.context.tsx`.

**Content config** — page-specific data is kept in co-located config files, not in the components themselves:
- `app/what/config/projects.ts` — project list
- `app/how/config/categories.ts` — tech stack categories
- `app/experiences/config/timeline.ts` — career timeline
- `app/videos/config/videos.ts` — video list

To add or update content on those pages, edit the relevant config file.

**Presence** — `components/presence/` uses the `react-use-lanyard` library to display real-time Discord presence in the sidebar. `select-presence.ts` is the plain selection rule (tested in `select-presence.test.ts`): it maps the live Lanyard status to playing (a game, which wins), listening (a Spotify track) or nothing, and builds the artwork URLs. The card is derived from the live status on every render, with no stored state. The Discord user ID is hardcoded in `Presence.tsx`.

**Admin** — `app/admin/` is the Owner's private space: French, server-rendered, `noindex`, out of the menu and outside Locale routing (so no `proxy` logic; the access check lives in the Admin itself). `app/admin/layout.tsx` is the Admin's own root layout and its gate: anyone but the signed-in Owner gets the sign-in or refusal screen. Sign-in is GitHub OAuth (scope `public_repo`, the token later used to commit content): `app/admin/auth/sign-in` redirects to GitHub, `app/admin/auth/callback` keeps the identity in an iron-session sealed cookie (no database; the token is kept for the Owner only). The Owner check is `lib/admin/owner-access.ts` behind the `AdminIdentitySource` interface: every Admin page calls `currentOwnerAccess()` and every Admin Server Action starts with `requireOwnerSession()` (both in `lib/admin/session.ts`), since Server Actions are public endpoints. Tests use a fake identity source (`owner-access.test.ts`) and a fake GitHub (`github-sign-in.test.ts`).

Admin environment variables (`.env.local` locally, Vercel Production); `scripts/wizards/admin-github-oauth.sh` creates the OAuth apps and sets them all:

| Variable | Value |
| --- | --- |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials; one app per environment, callback `<origin>/admin/auth/callback` |
| `SESSION_SECRET` | ≥ 32 characters, encrypts the session cookie; changing it signs everyone out |
| `OWNER_GITHUB_ID` | The Owner's numeric GitHub id (`gh api user -q .id`); unset means nobody gets in |
| `AUTH_REDIRECT_URI` | Optional, pins the callback URL (set on Production); otherwise derived from the request |

**3D scene** — `app/mdf-2025/` contains a Three.js/React Three Fiber scene celebrating a competition win. Uses `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`.

**UI components** — Shadcn/ui components live in `components/ui/`. Custom typography primitives (`TypographyH2`, `TypographyH3`, `TypographyH4`, `TypographyP`, `Bold`, etc.) are in `components/typography/index.tsx`; prefer these over raw HTML tags for text. They take `children` and an optional `className`; adjust styling through `className` rather than adding props.

**Types** — shared TypeScript types are in `types/` (`project.ts`). Lanyard types come from `react-use-lanyard`.

**Images** — remote image hosts are allowed through `images.remotePatterns` in `next.config.mjs` (`cdn.discordapp.com`, `media.discordapp.net`, `i.scdn.co`). Add new hosts there if needed; `images.domains` is deprecated.

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
