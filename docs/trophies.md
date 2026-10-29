# Trophies

Read before adding a Trophy, unlocking one from a feature, or touching the trophies page, its toast or the count at the sidebar's foot.

A Trophy is the visitor's, never Lucas's (his are Achievements, `GLOSSARY.md`): something they unlock by exploring the site. Progress lives in the visitor's browser only; there is no server, no account and nothing to sync. Another browser starts from zero, and the trophies page says so.

## The module

`lib/trophies/trophies.ts` is plain data and the unlock rules, tested by `trophies.test.ts`:

- `TROPHIES`: every Trophy in page order (commonest first), each with an `id`, a `rarity` (the Achievement rarities, drawn the same way) and optionally `secret` (shown as "???" with its hint until unlocked), `quiet` (unlocked by something the visitor did not do, like Lucas coming online: its toast plays no cue, as presence never plays a sound), `tally` (unlocks once `needs` steps of a Tally are counted, all by default) or `everyOther` (platinum).
- `TALLIES`: the steps a Tally counts, each once, over any number of visits: `tabs` (the menu's paths), `palettes`, `locales`, `modes` (resolved, so system counts as what it shows) and `secrets` (the quick menu's, written out so the module stays out of the quick menu's chunk; a test keeps both lists equal).
- `unlockTrophyIn`, `countTrophyStepIn`, `markAnnouncedIn`: pure updates that return the same progress when nothing changed. A Trophy built on a Tally or on every other one unlocks by its rule only; platinum unlocks with the last of the others.
- Storage: `localStorage` under `imjustlucas.trophies.v1`, `{ unlocked: { id: ISO date }, announced: [id], tallies: { tally: [step] } }`, read and written inside try/catch (private windows, blocked site data). `parseProgress` drops anything unknown (a retired Trophy, a step no Tally has, a bad date) rather than throwing. A new shape takes a new key (`v2`), and old progress is then simply not read.

## The client API

`components/trophies/trophy-store.ts`, usable from any client code (event handlers, effects), no provider needed:

```ts
import { countTrophyStep, unlockTrophy } from "@/components/trophies/trophy-store";

unlockTrophy("coinRain"); // once; later calls do nothing
countTrophyStep("palettes", "plum"); // once per step
const progress = useTrophies(); // empty on the server and the first render
```

Call them where the thing happens, as one line beside the code that already reacts to it (keeping each call a single line keeps merges painless). A server component with no event of its own renders `<UnlockTrophy id="lost" />` (`components/trophies/UnlockTrophy.tsx`), as the 404 slot does.

`components/trophies/TrophyLayer.tsx`, mounted once in `ClientLayout`, counts what the client itself sees: the tab of every path visited, a Project page (`inspector`), the patch notes (`whatsNew`), the Locale, the resolved mode and the palette shown, and Lucas online on Discord (`seenOnline`). It then announces every unlocked Trophy not yet announced, oldest first, one toast at a time: the first 900ms after the unlock (so the cue that earned it sounds first), the next of a burst 300ms after the last left. A Trophy is marked announced when its toast shows, so an unlock just before a full page load (a Locale switch) is announced on the next page.

Where each Trophy unlocks:

| Trophy | Where |
| --- | --- |
| inspector, whatsNew, tour, bilingual, dayNight, painter, seenOnline | `TrophyLayer` |
| ollie, surf | a finished run, `useBoardRun` (`components/arcade/use-board-run.ts`), with the game's id |
| top10 | a run landing on the Leaderboard, same file |
| combo | a x5 combo in Ollie (`components/arcade/ollie/OllieGame.tsx`) |
| friendRequest | the add-friend button on Contact (`components/contact/FriendRequest.tsx`) |
| waved | a Poke that went out to Lucas's Discord (`components/poke/PokeProvider.tsx`, docs/poke.md) |
| coinRain | a coin thrown on MasterDevFrance 2025 (`master-dev-scene.tsx`) |
| radio, rainyDay | a radio track actually playing, the second with the rain on (`components/radio/RadioProvider.tsx`) |
| firstSecret, secretHunter | a quick menu secret, `countTrophyStep("secrets", …)` in `QuickMenuLayer` and, for the Konami code, `QuickMenuProvider` |
| lost | the 404 slot (`components/not-found/NotFoundSlot.tsx`) |
| platinum | the last of the others |

## Adding a Trophy

1. Add its id to `TrophyId` and its entry to `TROPHIES`, in its rarity's place (or a step to a `TALLIES` list).
2. Its texts under `Trophies.items.<id>` in every dictionary: `name` and `how` (lowercase, Lucas's voice, saying what to do), plus `hint` for a secret one.
3. Its line icon in `components/trophies/trophy-icons.ts`.
4. The one-line `unlockTrophy("<id>")` where it happens, and its row in the table above.
5. The test of `TROPHIES` keeps ids unique; add a test when the rule is new (a new Tally, a new `needs`). Platinum's goal follows the list on its own, and so does the "x/17" count.

Removing a Trophy is the reverse; stored progress for it is dropped on the next read. A Trophy is never invented for something Lucas did: those are Achievements in `content/achievements.json`.

## The screens

The trophies page (`app/[locale]/trophies/page.tsx`, Route `trophies`, out of the menu, docs/routing.md) is static: `TrophyCabinet` fills it in on the client. The count at the sidebar's foot (`components/sidebar/TrophyCount.tsx`) links to it, beside the version link, and the quick menu lists it with the other pages. Their design is in DESIGN.md (Trophies, Sound kit, Motion).
