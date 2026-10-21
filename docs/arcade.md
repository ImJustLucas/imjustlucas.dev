# Arcade

Read before touching `app/[locale]/arcade/`, `components/arcade/`, `lib/arcade/`, the leaderboards or their Upstash store.

## Cabinets

The Arcade is the game library: one Cabinet per Hobby (`lib/arcade/cabinets.ts`), a cabinet `playable` or `soon`. The shelf's playable tiles open their cabinet, kept in the address as `?cabinet=<id>` (none for the first).

| Cabinet | Rules | Screen | The game |
| --- | --- | --- | --- |
| Ollie | `lib/arcade/ollie.ts` | `components/arcade/ollie/` | a skate runner down a Paris street: jump the furniture, a held press flies higher |
| Surf | `lib/arcade/surf.ts` | `components/arcade/surf/` | Flappy Bird on a surfboard: each press pops Lucas off the swell (again in the air to climb), through the gap between a rock or beacon below and a jetty piling or gulls above; one point per gate |

Each game's rules are a plain, seeded module, tested beside it (`ollie.test.ts`, `surf.test.ts`): physics, collisions, scoring and the world laid out from the seed, advanced in fixed steps of 1/120s (`advance`, a frame counting for 0.25s at most), so it plays the same at any frame rate, with `steps`, the frame's `events`, and a replay from a seed and its inputs (`replayOllie`, `replaySurf`) for the leaderboard. Surf's gates always stay within reach: a gap's floor moves at most `MAX_SHIFT` from the last one, and the gap narrows from `START_GAP` to `MIN_GAP`. What the games share is in `lib/arcade/run.ts` (the seeded generator, the stored best).

A screen only feeds its rules the presses and frames, plays its events as the sound kit's cues and draws it on a canvas, in its own palette (DESIGN.md, the game screens); `ArcadeFloor` loads each screen with `next/dynamic` (`ssr: false`), so a game costs nothing to the other pages. The parts every cabinet shares are in `components/arcade/`: the marquee, the cards over the screen, the first-name strip and the deck (`CabinetParts.tsx`), and the runs, the leaderboard and the visitor's best in their `localStorage` (`use-board-run.ts`, `imjustlucas:arcade:<game>:best`).

Sounds come from the kit (`lib/sound/kit.ts`), through the global switch: `hop` for Ollie's jump and Surf's pop, `pickup` for a sparkle or a gate passed, `milestone` every 100 points (Ollie) or every 10 gates (Surf, instead of that gate's `pickup`), `miss` on the crash, `unlock` on a new best; Surf needed no cue of its own.

Adding a game: its rules module with its replay, its screen under `SCREENS` in `ArcadeFloor` (built from `CabinetParts` and `useBoardRun`), its entry in `CABINETS`, its texts under `Arcade.cabinets.<id>` in both dictionaries (`name`, `tagline`, `poseAlt`, `game`, `hint`, `hintTouch`, `started`, `empty`), and, for a leaderboard, its id in `LEADERBOARD_GAMES` (`lib/arcade/board.ts`) with its rules in `REPLAY` (`lib/arcade/leaderboard.ts`) and its name in the Admin's `GAME_NAMES`.

## Leaderboards

Each game has a top 10, every player's best kept once under the first name they chose (DESIGN.md, Arcade).

- **The player** (`components/arcade/use-player.ts`): an id made in the visitor's browser (`crypto.randomUUID`) and, once given, their first name, both in `localStorage` (`imjustlucas:arcade:player`). The name is asked the first time a run would make the board (`wouldRank` in `lib/arcade/board.ts`), then reused. It must pass `parseName` (`lib/arcade/player-name.ts`, plain, checked as typed and again on the server): 1 to 16 characters, letters of any script, digits, spaces, `'`, `.` and `-`, and not one of a short list of insults.
- **A run** is handed out by the server before it is played (`startRun`): a seed, kept in the store with the time it was handed out. The screen records every press (and, in Ollie, every release) of the button with the step it landed on (`OllieInput`, `SurfInput`, one shape), and a run good enough for the board is sent back as its run id, the player's id and name, and those inputs (`submitRun`).
- **The score is never taken from the browser.** `submitRun` takes the run out of the store (once: a second send is `expired`), replays it from its seed and inputs with that game's own rules (`REPLAY`: `replayOllie` or `replaySurf`; Surf skips releases), refuses inputs out of order or a run that never crashes (`refused`), refuses a run sent faster than the time its steps take (`refused`), then keeps the replayed score if it beats the player's best. A bot can still play well, but it cannot claim a score its presses did not earn.
- **Limits**: each visitor (by IP, `x-forwarded-for`) may start 60 runs and send 20 results per 10 minutes (`LIMITS`); open runs expire after 3 hours.
- **Removing a player**: the Owner takes a name off a board from the Admin's Arcade page (`app/admin/arcade/`), which checks the Owner itself.

The rules are Effect code (ADR-0002) in `lib/arcade/leaderboard.ts`, over the `Scores` service. Adapters: Upstash Redis through its REST API (`leaderboard-upstash.ts`, plain `fetch`, no client library) and in memory for tests (`leaderboard-in-memory.ts`; `leaderboard.test.ts` plays real runs against it with the test clock). `lib/arcade/server.ts` (server only) is the only place that runs them; it returns plain data from `lib/arcade/board.ts`, and when Upstash cannot be reached it logs and answers `unavailable`: the game still plays, the board says it is resting, nothing is sent. The public Server Actions are `app/[locale]/arcade/actions.ts`.

Upstash keys: `arcade:run:<id>` (an open run, 3 hours), `arcade:<game>:scores` (sorted set of player ids by best score, `ZADD GT`), `arcade:<game>:names` (hash of player id to name), `arcade:limit:<key>:<window>` (rate limit counters).

## Environment variables

The store is Upstash for Redis from the Vercel Marketplace (`imjustlucas-arcade`, connected to every environment of the `imjustlucas-dev` project). Development uses the same database as Production, so test entries must be removed afterwards.

| Variable | Value |
| --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Set by the integration (`vercel env pull` for `.env.local`); `UPSTASH_REDIS_REST_URL` / `_TOKEN` are read too. Unset: the leaderboards are `unavailable` |
