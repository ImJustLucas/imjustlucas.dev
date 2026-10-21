# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm lint       # ESLint (eslint.config.mjs)
pnpm test       # Vitest, every *.test.ts once
```

The pre-commit hook (Husky, installed by `pnpm install`) runs `pnpm lint` and `pnpm test`; CI runs lint, test and build on every push.

Tests sit next to the module they cover as `*.test.ts` (`vitest.config.ts`: Node environment, `@/` alias, `server-only` aliased to a no-op) and go through public interfaces: plain functions, or Effect services with `@effect/vitest`. React components are not tested.

## Architecture

Personal portfolio site: Next.js 16 (App Router), React 19, Tailwind CSS, Shadcn/ui, next-intl, and Effect v4 on the server only (ADR-0002). Domain terms are in `GLOSSARY.md`; decisions in `docs/adr/`.

- **Routing, Locales and interface strings** — every public page lives under `app/[locale]/` (`en`, `fr`) and needs its entry in `ROUTES` (`config/routes.ts`). See `docs/routing.md` before adding a page, a link, a redirect or visible text.
- **Content** — Projects, Experiences, Techs, Achievements, Hobbies and the Profile are JSON documents in `content/`, read by pages only through `lib/content/server.ts`; stars and Videos come from GitHub and YouTube. See `docs/content.md` before touching content, the catalog or revalidation.
- **Search** — the site's address (`config/site.ts`, the `www` host), page metadata, structured data, sitemap, `robots.txt` and the link preview image. See `docs/seo.md` before touching any of them.
- **Admin** — `app/admin/` is the Owner's private space (GitHub sign-in, saves committed to the content branch). See `docs/admin.md` before touching the Admin, its pattern for editors, or its environment variables.
- **Presence** — `components/presence/` shows the Owner's live Discord activity; the selection rule is the plain `select-presence.ts`.
- **Arcade** — `app/[locale]/arcade/` is the game library, one Cabinet per Hobby (`lib/arcade/cabinets.ts`). Each game's rules are a plain tested module in `lib/arcade/`; its canvas screen in `components/arcade/` only draws them and loads with `next/dynamic` (`ssr: false`).
- **3D scene** — `app/[locale]/mdf-2025/` is a React Three Fiber scene celebrating a competition win.
- **UI** — Shadcn/ui components in `components/ui/`; text goes through the primitives of `components/typography/index.tsx`, styled with `className`.
- **Images** — remote hosts are allowed in `images.remotePatterns` (`next.config.ts`).

## Code conventions

- Path alias `@/` maps to the project root.
- `"use client"` only on components that use browser APIs, hooks or event handlers; server components are the default.

## Agent skills

### Issue tracker

Issues and specs are tracked as GitHub Issues on `ImJustLucas/imjustlucas.dev`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
