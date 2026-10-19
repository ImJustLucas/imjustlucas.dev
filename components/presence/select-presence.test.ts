import type { Activity, LanyardData, Spotify } from "react-use-lanyard";

import { describe, expect, it } from "vitest";

import { selectPresence } from "./select-presence";

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
    const customStatus = game({ type: 4, name: "Custom Status" });

    expect(
      selectPresence(lanyardStatus({ activities: [customStatus] })),
    ).toEqual({ kind: "nothing" });
  });

  it("shows nothing when Lucas neither plays nor listens", () => {
    expect(selectPresence(lanyardStatus())).toEqual({ kind: "nothing" });
  });

  it("shows nothing before the live status has arrived", () => {
    expect(selectPresence(undefined)).toEqual({ kind: "nothing" });
  });

  it("drops the card as soon as the game ends", () => {
    expect(selectPresence(lanyardStatus({ activities: [game()] })).kind).toBe(
      "playing",
    );

    expect(selectPresence(lanyardStatus({ activities: [] }))).toEqual({
      kind: "nothing",
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
    ).toEqual({ kind: "nothing" });
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
      });
    });
  });
});
