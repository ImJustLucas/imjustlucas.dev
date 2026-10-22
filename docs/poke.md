# Pokes (the wave at Lucas)

Read before touching `components/poke/`, `lib/poke/`, the wave buttons, the Admin's Coucous page or the Discord webhook.

## What it does

A visitor presses an emote (DESIGN.md, Wave) on the contact screen, under the friends panel or through the quick menu ("wave at me on Discord"), and Lucas gets a message in a private channel of his Discord server: the emote, the page the visitor was on, its language and, from Vercel's geo headers, their approximate city and country. The message links to the Poke's row on the Admin's Coucous page (`/admin/pokes#poke-<id>`), where Lucas waves back; the visitor sees "Lucas waved back!" on their next visit.

Visitors never type anything: the emote comes from a fixed set (`lib/poke/emotes.ts`) and the page must be one the site serves (`pokePage` in `lib/poke/message.ts`, from `ROUTES` and the Project slugs), so there is nothing to moderate. The city is decoded and kept only if it reads as a name, so it can carry no markup; the message pings nobody (`allowed_mentions` empty).

## Rules and limits

The rules are Effect code (ADR-0002) in `lib/poke/poke.ts`, over two services: `PokeStore` (Upstash, `poke-upstash.ts`; in memory for tests, `poke-in-memory.ts`) and `PokeNotifier` (the webhook, `poke-discord.ts`, plain `fetch`). `lib/poke/server.ts` (server only) is the only place that runs them and returns plain data (`result.ts`); the public Server Actions are `app/[locale]/poke-actions.ts`, and the Admin's is `app/admin/pokes/actions.ts`, which checks the Owner itself.

- **Limits** (`lib/poke/limits.ts`): each visitor waves once per 24 hours, counted from their wave, and the whole site sends at most 20 Pokes an hour. The visitor's day is taken first and given back when the hour is full or Discord does not answer, so they can try again.
- **Visitors are known by a keyed hash** of their IP address (`visitorKey` in `lib/poke/visitor.ts`, HMAC-SHA256 keyed with the webhook's address, a secret only the server holds): no raw address is ever stored, and the hash expires with their day.
- **Bots:** the emote forms carry a honeypot field no person sees; a submission that fills it is told it worked and nothing is sent. Next refuses a Server Action whose Origin is not the site's. The limits bound the rest: at worst 20 messages an hour reach Lucas. Vercel BotID was not added, as it needs a new dependency for a feature these limits already bound.
- **What is kept**, for a week: the Poke's id, emote, page, Locale and time (`poke:sent:<id>`), whether Lucas waved back (`poke:waved:<id>`) and the newest ids (`poke:recent`). The city and country only travel in the Discord message. Limit keys: `poke:limit:visitor:<hash>` (24 hours) and `poke:limit:hour:<n>` (one hour).
- **The visitor's browser** keeps its own Poke in `localStorage` (`imjustlucas:poke`, read by `lib/poke/visit.ts`): the buttons show it for the visitor's day, and on each load, while Lucas has not answered and the Poke is less than a week old, the site asks once whether he waved back.
- **Fail soft:** when Upstash or Discord cannot be reached, nothing is sent, the server logs it, and the keys say so calmly under them; the page never breaks.

A wave that goes out unlocks the visitor's `waved` Trophy (docs/trophies.md). `PokeProvider` (`components/poke/`) holds the visitor's wave for the whole client (the contact screen, the friends panel and the quick menu share it), plays the notes and shows the toasts. The Locale layout passes it `pokeEnabled()`: the wave is shown only when the webhook and Upstash are both set, read at build time like the rest of the static pages, so setting the variable takes a redeploy.

## Setting it up

1. In Discord, on Lucas's server, create a private text channel (e.g. `#coucous`), visible only to him.
2. Channel settings (the gear) → **Integrations** → **Webhooks** → **New Webhook**: name it `imjustlucas.dev`, pick the channel, then **Copy Webhook URL** (`https://discord.com/api/webhooks/<id>/<token>`). The URL is a secret: anyone holding it can post in the channel.
3. On Vercel, project `imjustlucas-dev` → Settings → Environment Variables: add `DISCORD_POKE_WEBHOOK_URL` with that URL for **Production** (and Preview, to try it on a pull request's deployment), marked Sensitive. Then redeploy.
4. Upstash is already connected (docs/arcade.md). To rotate the webhook, delete it in Discord, create a new one and replace the variable; the visitors' days reset, nothing else.

## Environment variables

| Variable | Value |
| --- | --- |
| `DISCORD_POKE_WEBHOOK_URL` | The webhook of Lucas's private channel; never sent to the browser. Unset: the wave is hidden everywhere and the Admin's Coucous page says so |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | The Arcade's Upstash store, shared (docs/arcade.md). Unset: the wave is hidden |

Locally the webhook can be left unset (no wave), or set to a test channel's webhook in `.env.local`; development shares Production's Upstash database, so test Pokes show in the Admin for a week.
