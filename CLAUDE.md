# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack is the default bundler)
pnpm build      # Production build
pnpm lint       # ESLint CLI with flat config in eslint.config.mjs (runs in CI on every push)
pnpm test       # Vitest (`*.test.ts`, config in vitest.config.ts)
```

The pre-commit hook exists but its commands are commented out.

## Architecture

Personal portfolio site built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS, and Shadcn/ui.

**Routing** — every public page lives under `app/[locale]/` (Locales `en`, default, and `fr`, defined in `i18n/routing.ts`) and is statically generated for both. `app/[locale]/layout.tsx` is a root layout (there is no `app/layout.tsx`, as `next/root-params` needs the Locale segment to be the root), so the Admin path can add its own root layout beside it; shared fonts are in `app/fonts/index.ts`. `proxy.ts` (next-intl middleware) sends the root address to the Locale from the `NEXT_LOCALE` cookie, then the browser language, falling back to English; it skips `/admin`, `/api`, Next internals and files. Legacy unprefixed Route URLs redirect permanently (308) to English through `redirects()` in `next.config.ts`. Unknown URLs render `app/global-not-found.tsx`. Internal links use `Link`/`usePathname` from `@/i18n/navigation` (Locale-aware), never `next/link` with a bare path.

The one list of Routes is `ROUTES` in `config/routes.ts`: each Route holds its path, the key of its texts under `Routes` in the message dictionaries (`label`, `title`, `description`) and whether it is in the menu. The sidebar menu is generated from it (real links; the active-Route rule is `lib/routes/is-active-route.ts`, applied to the Locale-stripped path). Every page renders `<PageHeader route={ROUTES.x} />` and exports `generateMetadata = routeMetadata(ROUTES.x)` from `components/page-header`, which also declares the page's alternate-Locale URLs. The legacy redirects are derived from `ROUTES` too. Adding a page is one entry in `ROUTES` plus its texts in every dictionary.

**Interface strings** — one message dictionary per Locale in `messages/` (`en.json` is the reference; `global.d.ts` types keys from it, and `messages/messages.test.ts` checks every dictionary has the same keys). Server components use `getTranslations` (from `next-intl/server`), client components `useTranslations`; the Locale comes from the root param (`i18n/request.ts`), so pages need no `setRequestLocale`. Proper nouns (Project titles, Tech names, company names) stay untranslated.

**Layout** — `app/[locale]/layout.tsx` sets `<html lang>`, wraps everything in `NextIntlClientProvider`, `ThemeProvider` (dark default) and `MobileMenuProvider`, then delegates to `app/[locale]/ClientLayout.tsx`. `ClientLayout` renders the `Sidebar` on the left and a scrollable content panel on the right. The sidebar handles both desktop and mobile (slide-over) layouts; mobile open state is managed through `contexts/menu-mobile.context.tsx`.

**Content config** — page-specific data is kept in co-located config files, not in the components themselves:
- `app/[locale]/what/config/projects.ts` — project list
- `app/[locale]/how/config/categories.ts` — tech stack categories
- `app/[locale]/experiences/config/timeline.ts` — career timeline
- `app/[locale]/videos/config/videos.ts` — video list

To add or update content on those pages, edit the relevant config file.

**Presence** — `components/presence/` uses the `react-use-lanyard` library to display real-time Discord presence (currently playing game or Spotify track) in the sidebar. The Discord user ID is hardcoded in `Presence.tsx`.

**3D scene** — `app/[locale]/mdf-2025/` contains a Three.js/React Three Fiber scene celebrating a competition win. Uses `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`.

**UI components** — Shadcn/ui components live in `components/ui/`. Custom typography primitives (`TypographyH2`, `TypographyH3`, `TypographyH4`, `TypographyP`, `Bold`, etc.) are in `components/typography/index.tsx`; prefer these over raw HTML tags for text. They take `children` and an optional `className`; adjust styling through `className` rather than adding props.

**Types** — shared TypeScript types are in `types/` (`project.ts`, `presence.ts`).

**Images** — remote image hosts are allowed through `images.remotePatterns` in `next.config.ts` (`cdn.discordapp.com`, `i.scdn.co`). Add new hosts there if needed; `images.domains` is deprecated.

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
