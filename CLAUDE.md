# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server with Turbopack
pnpm build      # Production build
pnpm lint       # ESLint check (runs in CI on every push)
```

There are no tests in this project. The pre-commit hook exists but its commands are commented out.

## Architecture

Personal portfolio site built with Next.js 15 (App Router), React 19 RC, Tailwind CSS, and Shadcn/ui.

**Routing** — all pages live under `app/` following Next.js App Router conventions. The canonical route list is in `config/ROUTES.ts`; use it when adding navigation links.

**Layout** — `app/layout.tsx` wraps everything in `ThemeProvider` (dark default) and `MobileMenuProvider`, then delegates to `app/ClientLayout.tsx`. `ClientLayout` renders the `Sidebar` on the left and a scrollable content panel on the right. The sidebar handles both desktop and mobile (slide-over) layouts; mobile open state is managed through `contexts/menu-mobile.context.tsx`.

**Content config** — page-specific data is kept in co-located config files, not in the components themselves:
- `app/what/config/projects.ts` — project list
- `app/how/config/categories.ts` — tech stack categories
- `app/experiences/config/timeline.ts` — career timeline
- `app/videos/config/videos.ts` — video list

To add or update content on those pages, edit the relevant config file.

**Presence** — `components/presence/` uses the `react-use-lanyard` library to display real-time Discord presence (currently playing game or Spotify track) in the sidebar. The Discord user ID is hardcoded in `Presence.tsx`.

**3D scene** — `app/mdf-2025/` contains a Three.js/React Three Fiber scene celebrating a competition win. Uses `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`.

**UI components** — Shadcn/ui components live in `components/ui/`. Custom typography primitives (`TypographyH2`, `TypographyH3`, `TypographyH4`, `TypographyP`, `Bold`, etc.) are in `components/typography/index.tsx`; prefer these over raw HTML tags for text.

**Types** — shared TypeScript types are in `types/` (`project.ts`, `presence.ts`).

**Images** — external image domains are whitelisted in `next.config.mjs` (`cdn.discordapp.com`, `i.scdn.co`). Add new domains there if needed.

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
