# Presence

Read before touching `components/presence/`, what the friends panel shows, or the chibi poses that follow Lucas's activity.

## Source

One Lanyard WebSocket per client (`PresenceProvider`, account from the Profile's `discordUserId`), shared through `usePresence()`: the derived `presence`, the ring's `status` and the `device`. Everything shown is derived on each render by plain modules with their tests: nothing is stored, nothing goes through the server.

| Rule | Module |
| --- | --- |
| What the card shows: a game, else his editor, else a show, else Spotify, else his status with his own line | `select-presence.ts` |
| An editor's rich presence read as coding: editor, language, project | `coding-activity.ts` |
| The chibi pose of the activity (banner and contact) | `activity-pose.ts` |
| The track's progress | `track-progress.ts` |
| What screen readers hear change | `presence-activity.ts` |

## Lucas's own line

When Lucas is neither playing, coding, watching nor listening, the card's second line is his own, if he set one, instead of the stock line of his status:

1. **The site message**, the Lanyard KV key `site_message`: a channel only the site reads, shown even offline. To set it, send `.apikey` to the Lanyard bot in a DM (Lucas must be in the Lanyard Discord server) to link a key once, then `.set site_message <text>` to write it and `.del site_message` to clear it, from any device; it reaches open pages within a second. The key can also be written over Lanyard's REST API (`PUT https://api.lanyard.rest/v1/users/<id>/kv/site_message` with the key in `Authorization`); never put that key in this repository.
2. **His Discord custom status** (an activity of type 4), with its emoji, otherwise. His Discord friends see the same text.

Both are plain text on one line, at most 140 characters, never parsed as a link or markup.

## Coding

An activity whose name is a known editor (`EDITORS` in `coding-activity.ts`: VS Code, Cursor, Zed, Neovim, the JetBrains IDEs…) is coding, never a game. The card shows the editor, the language (vscord's "Editing a TypeScript file" caption, or a bare language name) and the project (a workspace line, "In imjustlucas.dev", "Project: …"). Lucas chose (2026-10-22) to show the project publicly; the file name, the line and any other free text the editor sends are never kept. To keep a project private, set the editor extension not to send its workspace (vscord's details text, or its per-workspace ignore list).

## Device

`presenceDevice`: his computer first, then his phone, then a browser, from Lanyard's `active_on_discord_*`; none offline.
