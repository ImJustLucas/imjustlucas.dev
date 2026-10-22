# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm lint       # ESLint (eslint.config.mjs)
pnpm test       # Vitest, every *.test.ts once
```

The pre-commit hook (Husky, installed by `pnpm install`) runs `pnpm lint` and `pnpm test`; CI runs lint, test and build on every push. Vercel deploys `main` only (`git.deploymentEnabled` in `vercel.json`): pull requests get no preview deployment, so check a change locally with `next dev` or `next build && next start`.

Tests sit next to the module they cover as `*.test.ts` (`vitest.config.ts`: Node environment, `@/` alias, `server-only` aliased to a no-op) and go through public interfaces: plain functions, or Effect services with `@effect/vitest`. React components are not tested.

## Architecture

Personal portfolio site: Next.js 16 (App Router), React 19, Tailwind CSS, Shadcn/ui, next-intl, and Effect v4 on the server only (ADR-0002). Domain terms are in `GLOSSARY.md`; decisions in `docs/adr/`.

- **Routing, Locales and interface strings** — every public page lives under `app/[locale]/` (`en`, `fr`) and needs its entry in `ROUTES` (`config/routes.ts`). See `docs/routing.md` before adding a page, a link, a redirect or visible text.
- **Content** — Projects, Experiences, Techs, Achievements, Hobbies and the Profile are JSON documents in `content/`, read by pages only through `lib/content/server.ts`; stars, the Level (from GitHub Contributions, `GITHUB_TOKEN`) and Videos come from GitHub and YouTube. See `docs/content.md` before touching content, the catalog or revalidation.
- **Search** — the site's address (`config/site.ts`, the `www` host), page metadata, structured data, sitemap, `robots.txt` and the link preview image. See `docs/seo.md` before touching any of them.
- **Admin** — `app/admin/` is the Owner's private space (GitHub sign-in, saves committed to the content branch). See `docs/admin.md` before touching the Admin, its pattern for editors, or its environment variables.
- **Presence** — `components/presence/` shows the Owner's live Discord activity (game, coding, show, Spotify, status with his own line from Lanyard KV) and drives the live chibi poses; the rules are plain modules there. See `docs/presence.md` before touching it.
- **Lobby** — `components/lobby/` is the line under the friends panel's heading counting the visitors on the site right now: an anonymous heartbeat from each visible tab, counted on Upstash Redis; the rules are plain modules in `lib/lobby/`. See `docs/lobby.md` before touching it.
- **Quick menu** — `components/quick-menu/` is the ⌘K / "/" command window over the client, its own chunk loaded on first use; the commands, their search in both Locales and the secrets are the plain `lib/quick-menu/commands.ts` (the Konami code `lib/quick-menu/konami.ts`). See DESIGN.md, Quick menu.
- **Arcade** — `app/[locale]/arcade/` is the game library, one Cabinet per Hobby, with a top 10 per game on Upstash Redis; the server replays every run it ranks. See `docs/arcade.md` before touching a game, the leaderboards or their store.
- **3D scene** — `app/[locale]/mdf-2025/` is a React Three Fiber scene celebrating a competition win.
- **UI** — Shadcn/ui components in `components/ui/`; text goes through the primitives of `components/typography/index.tsx`, styled with `className`.
- **Images** — remote hosts are allowed in `images.remotePatterns` (`next.config.ts`).

## Code conventions

- Path alias `@/` maps to the project root.
- `"use client"` only on components that use browser APIs, hooks or event handlers; server components are the default.
- Every pull request a visitor can notice adds its Patch to `content/patch-notes.json` in the same pull request (next free version, link to the pull request); internal-only changes add none. See "Patch notes" in `docs/content.md`.

## Agent skills

### Issue tracker

Issues and specs are tracked as GitHub Issues on `ImJustLucas/imjustlucas.dev`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
