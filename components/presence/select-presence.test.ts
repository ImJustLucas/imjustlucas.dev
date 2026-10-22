import type { Activity, LanyardData, Spotify } from "react-use-lanyard";

import { describe, expect, it } from "vitest";

import {
  presenceDevice,
  presenceStatus,
  selectPresence,
} from "./select-presence";

const lanyardStatus = (overrides: Partial<LanyardData> = {}): LanyardData => ({
  listening_to_spotify: false,
  discord_user: {
    username: "imjustlucas",
    global_name: "Lucas",
    public_flags: 0,
    id: "127063570616811520",
    discriminator: "0",
    bot: false,
    avatar: "avatar",
  },
  discord_status: "online",
  activities: [],
  active_on_discord_web: false,
  active_on_discord_mobile: false,
  active_on_discord_desktop: true,
  ...overrides,
});

const game = (overrides: Partial<Activity> = {}): Activity => ({
  type: 0,
  id: "game",
  name: "Valorant",
  details: "Competitive",
  state: "In a match",
  created_at: 0,
  application_id: "700136079562375258",
  assets: {
    large_image: "1111",
    large_text: "Ascent",
    small_image: "2222",
    small_text: "Diamond",
  },
  ...overrides,
});

const track = (overrides: Partial<Spotify> = {}): Spotify => ({
  track_id: "track",
  timestamps: { start: 0, end: 1 },
  song: "Midnight City",
  artist: "M83",
  album: "Hurry Up, We're Dreaming",
  album_art_url: "https://i.scdn.co/image/ab67616d0000b273",
  ...overrides,
});

describe("selectPresence", () => {
  it("shows the game Lucas is playing", () => {
    expect(selectPresence(lanyardStatus({ activities: [game()] }))).toEqual({
      kind: "playing",
      name: "Valorant",
      details: "Competitive",
      state: "In a match",
      artwork: {
        url: "https://cdn.discordapp.com/app-assets/700136079562375258/1111.png",
        alt: "Ascent",
      },
      badge: {
        url: "https://cdn.discordapp.com/app-assets/700136079562375258/2222.png",
        alt: "Diamond",
      },
    });
  });

  it("shows the track Lucas is listening to on Spotify", () => {
    expect(
      selectPresence(
        lanyardStatus({ listening_to_spotify: true, spotify: track() }),
      ),
    ).toEqual({
      kind: "listening",
      song: "Midnight City",
      artist: "M83",
      album: "Hurry Up, We're Dreaming",
      artwork: {
        url: "https://i.scdn.co/image/ab67616d0000b273",
        alt: "Hurry Up, We're Dreaming",
      },
    });
  });

  it("shows the game over the track when Lucas plays while listening", () => {
    const presence = selectPresence(
      lanyardStatus({
        activities: [game()],
        listening_to_spotify: true,
        spotify: track(),
      }),
    );

    expect(presence).toMatchObject({ kind: "playing", name: "Valorant" });
  });

  it("ignores activities that are not games", () => {
    const stream = game({ type: 1, name: "Twitch" });

    expect(selectPresence(lanyardStatus({ activities: [stream] }))).toEqual({
      kind: "status",
      status: "online",
    });
  });

  it("shows his status when Lucas neither plays nor listens", () => {
    expect(selectPresence(lanyardStatus())).toEqual({
      kind: "status",
      status: "online",
    });
    for (const status of ["idle", "dnd", "offline"] as const) {
      expect(selectPresence(lanyardStatus({ discord_status: status }))).toEqual(
        { kind: "status", status },
      );
    }
  });

  it("is connecting before the live status has arrived", () => {
    expect(selectPresence(undefined)).toEqual({ kind: "connecting" });
    expect(presenceStatus(undefined)).toBe("connecting");
  });

  it("shows Lucas offline when Lanyard is unreachable", () => {
    expect(selectPresence(undefined, { unreachable: true })).toEqual({
      kind: "status",
      status: "offline",
    });
    expect(presenceStatus(undefined, { unreachable: true })).toBe("offline");
  });

  it("colours the status ring with his Discord status", () => {
    expect(presenceStatus(lanyardStatus({ discord_status: "dnd" }))).toBe(
      "dnd",
    );
  });

  it("gives the time the game started, for the elapsed time", () => {
    const presence = selectPresence(
      lanyardStatus({
        activities: [game({ timestamps: { start: 1000, end: 2000 } })],
      }),
    );

    expect(presence).toMatchObject({ kind: "playing", startedAt: 1000 });
  });

  it("drops the card as soon as the game ends", () => {
    expect(selectPresence(lanyardStatus({ activities: [game()] })).kind).toBe(
      "playing",
    );

    expect(selectPresence(lanyardStatus({ activities: [] }))).toEqual({
      kind: "status",
      status: "online",
    });
  });

  it("falls back to the track when the game ends during a song", () => {
    const listening = { listening_to_spotify: true, spotify: track() };

    expect(
      selectPresence(lanyardStatus({ ...listening, activities: [game()] }))
        .kind,
    ).toBe("playing");

    expect(selectPresence(lanyardStatus(listening)).kind).toBe("listening");
  });

  it("drops the card as soon as the song ends", () => {
    expect(
      selectPresence(
        lanyardStatus({ listening_to_spotify: false, spotify: track() }),
      ),
    ).toEqual({ kind: "status", status: "online" });
  });

  describe("missing artwork", () => {
    it("shows a game without artwork when Discord sends no assets", () => {
      const presence = selectPresence(
        lanyardStatus({ activities: [game({ assets: undefined })] }),
      );

      expect(presence).toMatchObject({ kind: "playing", name: "Valorant" });
      expect(presence).not.toHaveProperty("artwork");
      expect(presence).not.toHaveProperty("badge");
    });

    it("shows no artwork when the game has no application to host it", () => {
      const presence = selectPresence(
        lanyardStatus({ activities: [game({ application_id: undefined })] }),
      );

      expect(presence).not.toHaveProperty("artwork");
      expect(presence).not.toHaveProperty("badge");
    });

    it("shows the large artwork alone when the small image is missing", () => {
      const assets = { large_image: "1111", large_text: "Ascent" };
      const presence = selectPresence(
        lanyardStatus({
          activities: [game({ assets: assets as Activity["assets"] })],
        }),
      );

      expect(presence).toMatchObject({
        artwork: {
          url: "https://cdn.discordapp.com/app-assets/700136079562375258/1111.png",
        },
      });
      expect(presence).not.toHaveProperty("badge");
    });

    it("falls back to the game name when an image has no caption", () => {
      const assets = { large_image: "1111" };
      const presence = selectPresence(
        lanyardStatus({
          activities: [game({ assets: assets as Activity["assets"] })],
        }),
      );

      expect(presence).toMatchObject({ artwork: { alt: "Valorant" } });
    });

    it("loads externally hosted game artwork through the Discord media proxy", () => {
      const presence = selectPresence(
        lanyardStatus({
          activities: [
            game({
              assets: {
                large_image: "mp:external/abc/https/example.com/cover.png",
                large_text: "Cover",
                small_image: "mp:external/def/https/example.com/rank.png",
                small_text: "Rank",
              },
            }),
          ],
        }),
      );

      expect(presence).toMatchObject({
        artwork: {
          url: "https://media.discordapp.net/external/abc/https/example.com/cover.png",
        },
        badge: {
          url: "https://media.discordapp.net/external/def/https/example.com/rank.png",
        },
      });
    });

    it("shows a track without artwork when Spotify sends no album art", () => {
      const presence = selectPresence(
        lanyardStatus({
          listening_to_spotify: true,
          spotify: track({ album_art_url: "" }),
        }),
      );

      expect(presence).toEqual({
        kind: "listening",
        song: "Midnight City",
        artist: "M83",
        album: "Hurry Up, We're Dreaming",
      });
    });
  });

  describe("Spotify", () => {
    const spotifyId = "48fW6fCNnOvfpBBYwGdRib";

    it("links the track on Spotify and gives its start and end", () => {
      const presence = selectPresence(
        lanyardStatus({
          listening_to_spotify: true,
          spotify: track({
            track_id: spotifyId,
            timestamps: { start: 1000, end: 240_000 },
          }),
        }),
      );

      expect(presence).toMatchObject({
        kind: "listening",
        url: `https://open.spotify.com/track/${spotifyId}`,
        startedAt: 1000,
        endsAt: 240_000,
      });
    });

    it("never links anything that is not a Spotify track id", () => {
      const presence = selectPresence(
        lanyardStatus({
          listening_to_spotify: true,
          spotify: track({ track_id: "../../evil.example/x" }),
        }),
      );

      expect(presence).not.toHaveProperty("url");
    });

    it("shows no progress when the timestamps make no sense", () => {
      const presence = selectPresence(
        lanyardStatus({
          listening_to_spotify: true,
          spotify: track({ timestamps: { start: 5000, end: 5000 } }),
        }),
      );

      expect(presence).not.toHaveProperty("startedAt");
      expect(presence).not.toHaveProperty("endsAt");
    });
  });

  describe("coding", () => {
    const vscode = (overrides: Partial<Activity> = {}): Activity =>
      game({
        name: "Visual Studio Code",
        application_id: "383226320970055681",
        details: "In imjustlucas.dev - 0 problems found",
        state: "Working on select-presence.ts:42:7",
        timestamps: { start: 1000, end: 0 },
        assets: {
          large_image: "mp:external/lang/https/example.com/typescript.png",
          large_text: "Editing a TypeScript file",
          small_image: "mp:external/editor/https/example.com/vscode.png",
          small_text: "Visual Studio Code",
        },
        ...overrides,
      });

    it("shows Lucas coding, not playing, at his editor", () => {
      expect(selectPresence(lanyardStatus({ activities: [vscode()] }))).toEqual(
        {
          kind: "coding",
          editor: "Visual Studio Code",
          language: "TypeScript",
          project: "imjustlucas.dev",
          artwork: {
            url: "https://media.discordapp.net/external/lang/https/example.com/typescript.png",
            alt: "TypeScript",
          },
          badge: {
            url: "https://media.discordapp.net/external/editor/https/example.com/vscode.png",
            alt: "Visual Studio Code",
          },
          startedAt: 1000,
        },
      );
    });

    it("never keeps the file he is editing", () => {
      const presence = selectPresence(
        lanyardStatus({ activities: [vscode()] }),
      );

      expect(JSON.stringify(presence)).not.toContain("select-presence");
    });

    it("reads a bare language caption, as the JetBrains plugins send it", () => {
      const webstorm = vscode({
        name: "WebStorm",
        details: "Editing page.tsx",
        state: "Project: imjustlucas.dev",
        assets: {
          large_image: "tsx",
          large_text: "TypeScript JSX",
          small_image: "webstorm",
          small_text: "WebStorm",
        },
      });

      expect(
        selectPresence(lanyardStatus({ activities: [webstorm] })),
      ).toMatchObject({
        kind: "coding",
        editor: "WebStorm",
        language: "TypeScript JSX",
        project: "imjustlucas.dev",
      });
    });

    it("drops a caption that names a file, the editor or idling", () => {
      for (const caption of [
        "Editing page.tsx",
        "README.md",
        "Visual Studio Code",
        "Idling",
      ]) {
        const presence = selectPresence(
          lanyardStatus({
            activities: [
              vscode({
                assets: {
                  large_image: "x",
                  large_text: caption,
                  small_image: "y",
                  small_text: "Visual Studio Code",
                },
              }),
            ],
          }),
        );

        expect(presence).toMatchObject({ kind: "coding" });
        expect(presence).not.toHaveProperty("language");
      }
    });

    it("shows no project when the editor names none", () => {
      const presence = selectPresence(
        lanyardStatus({
          activities: [vscode({ details: "Idling", state: undefined })],
        }),
      );

      expect(presence).not.toHaveProperty("project");
    });

    it("shows a game over his editor", () => {
      expect(
        selectPresence(lanyardStatus({ activities: [vscode(), game()] })),
      ).toMatchObject({ kind: "playing", name: "Valorant" });
    });

    it("shows his editor over the track he codes to", () => {
      expect(
        selectPresence(
          lanyardStatus({
            activities: [vscode()],
            listening_to_spotify: true,
            spotify: track(),
          }),
        ),
      ).toMatchObject({ kind: "coding" });
    });
  });

  it("shows what Lucas is watching", () => {
    const show = game({ type: 3, name: "Crunchyroll", details: "Frieren" });

    expect(selectPresence(lanyardStatus({ activities: [show] }))).toMatchObject(
      { kind: "watching", name: "Crunchyroll", details: "Frieren" },
    );
  });

  describe("his own line", () => {
    const customStatus = (overrides: Partial<Activity> = {}): Activity => ({
      type: 4,
      id: "custom",
      name: "Custom Status",
      state: "shipping the presence card",
      created_at: 0,
      ...overrides,
    });

    it("shows his Discord custom status with its emoji", () => {
      expect(
        selectPresence(
          lanyardStatus({
            activities: [customStatus({ emoji: { name: "🚀" } })],
          }),
        ),
      ).toEqual({
        kind: "status",
        status: "online",
        message: { text: "shipping the presence card", emoji: "🚀" },
      });
    });

    it("draws a custom Discord emoji from Discord's CDN", () => {
      const presence = selectPresence(
        lanyardStatus({
          activities: [
            customStatus({
              emoji: { name: "pepe", id: "123456", animated: true },
            }),
          ],
        }),
      );

      expect(presence).toMatchObject({
        message: {
          emojiImage: {
            url: "https://cdn.discordapp.com/emojis/123456.gif",
            alt: ":pepe:",
          },
        },
      });
    });

    it("prefers the site message he set in Lanyard KV, even offline", () => {
      expect(
        selectPresence(
          lanyardStatus({
            discord_status: "offline",
            kv: { site_message: "  back   monday 🏄 " },
            activities: [customStatus()],
          }),
        ),
      ).toEqual({
        kind: "status",
        status: "offline",
        message: { text: "back monday 🏄" },
      });
    });

    it("falls back to his custom status when the site message is empty", () => {
      expect(
        selectPresence(
          lanyardStatus({
            kv: { site_message: "   " },
            activities: [customStatus()],
          }),
        ),
      ).toMatchObject({ message: { text: "shipping the presence card" } });
    });

    it("keeps his line to one short line", () => {
      const presence = selectPresence(
        lanyardStatus({ kv: { site_message: "a".repeat(500) } }),
      );

      expect(presence).toMatchObject({ message: { text: "a".repeat(140) } });
    });
  });

  describe("presenceDevice", () => {
    it("names his computer first, then his phone, then a browser", () => {
      expect(presenceDevice(lanyardStatus())).toBe("desktop");
      expect(
        presenceDevice(
          lanyardStatus({
            active_on_discord_desktop: false,
            active_on_discord_mobile: true,
            active_on_discord_web: true,
          }),
        ),
      ).toBe("mobile");
      expect(
        presenceDevice(
          lanyardStatus({
            active_on_discord_desktop: false,
            active_on_discord_web: true,
          }),
        ),
      ).toBe("web");
    });

    it("names none offline or while connecting", () => {
      expect(
        presenceDevice(lanyardStatus({ discord_status: "offline" })),
      ).toBeUndefined();
      expect(presenceDevice(undefined)).toBeUndefined();
    });
  });
});
