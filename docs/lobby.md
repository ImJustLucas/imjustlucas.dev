# Lobby

Read before touching `components/lobby/`, `lib/lobby/`, or the line under the friends panel's heading that says how many visitors are on the site.

## What it shows

The Lobby is everyone on the site right now, the visitor included: "5 players in the lobby", or "just you in the lobby" when they are alone (never 0). One total, not broken down by page; no live cursors (Lucas's choice, 2026-10-22). The line sits under the friends panel's heading (DESIGN.md, Friends panel); it hides while the first beat is on its way (its row is kept, so the presence card does not jump) and disappears when the store cannot be reached.

## How it counts

| Rule | Where |
| --- | --- |
| The beat's period (`HEARTBEAT_MS`, 30 s), how long a beat counts (`LOBBY_TTL_MS`, 60 s: one missed beat is forgiven), the id's shape, what the panel shows of an answer (`lobbyView`) | `lib/lobby/rules.ts`, plain, shared by the browser and the server |
| A beat: record the visitor now, forget everyone last seen `LOBBY_TTL_MS` ago or earlier, count who is left | `lib/lobby/lobby.ts`, Effect (ADR-0002), over the `LobbyStore` service |
| When to beat: once on load, then every 30 s while the tab is visible (Page Visibility API), never while it is hidden; a tab shown again waits out the rest of its period | `components/lobby/use-lobby.ts` |

- **Anonymous**: a visitor is a random UUID made in the browser and kept in `sessionStorage` (`imjustlucas:lobby:session`, so a reload is not a second visitor; in memory when storage is blocked). No IP, no cookie, nothing else is sent or kept, so no consent banner is needed. Each tab counts as one player; a duplicated tab shares its id.
- **One request**: the beat's answer is the count. The Server Action `lobbyBeatAction` (`app/[locale]/lobby-actions.ts`) calls `beatLobby` (`lib/lobby/server.ts`, the only place the Effect code runs), which answers `lobby` with the count, `refused` for an id that is not a UUID, or `unavailable` (logged) when Upstash cannot be reached.
- **Trophy**: a beat that counts `CROWD` players or more (5, the visitor included; `isCrowd`) unlocks the visitor's secret, quiet Trophy "not alone" (docs/trophies.md).
- **Tests**: `lobby.test.ts` runs beats against the in-memory store (`lobby-in-memory.ts`) with the test clock; `rules.test.ts` covers the view and the id.

## Store

Upstash Redis, the Arcade's database (docs/arcade.md, its environment variables; unset, the line hides), through the shared REST client `lib/upstash.ts`. One key, `lobby:online`: a sorted set of session ids scored by their last beat in milliseconds. Each beat is one round trip of three commands in a pipeline (`lobby-upstash.ts`): `ZREMRANGEBYSCORE lobby:online -inf <now - 60 s>`, `ZADD lobby:online <now> <id>`, `ZCARD lobby:online`. Expired visitors are removed by the next beat, so the set never holds more than a minute of visitors.

**Budget.** Upstash's free plan allows 500,000 commands a month, shared with the Arcade. A visible tab costs 3 commands per beat, two beats a minute: 6 commands per minute on the site. A visit of 2 minutes is about 5 beats, 15 commands, so the lobby alone fits about 33,000 such visits a month (some 80,000 visitor-minutes). Hidden tabs cost nothing. Beyond the free plan, pay-as-you-go is $0.20 per 100,000 commands.

**Limits.** The action is public and not rate limited (a limit would cost two more commands per beat): a script sending random ids can inflate the count for a minute and spend commands. If that happens, add a per-IP limit like the Arcade's `allow`.
