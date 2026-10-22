import type { Activity, LanyardData, Spotify } from "react-use-lanyard";

import { activityImage } from "./activity-image";
import { codingActivity, isEditor } from "./coding-activity";

export type PresenceImage = { url: string; alt: string };

/** Lucas's Discord status, as Discord names it. */
export type DiscordStatus = LanyardData["discord_status"];

/** A line Lucas wrote himself, for the site or as his Discord status. */
export type PresenceMessage = {
  text: string;
  /** A Unicode emoji before the text. */
  emoji?: string;
  /** A custom Discord emoji before the text. */
  emojiImage?: PresenceImage;
};

/** What the friends panel shows, derived from the live Lanyard status. */
export type Presence =
  | {
      kind: "playing";
      name: string;
      details?: string;
      state?: string;
      artwork?: PresenceImage;
      badge?: PresenceImage;
      /** When the game started, in epoch milliseconds. */
      startedAt?: number;
    }
  | {
      kind: "coding";
      editor: string;
      language?: string;
      project?: string;
      artwork?: PresenceImage;
      badge?: PresenceImage;
      startedAt?: number;
    }
  | {
      kind: "watching";
      name: string;
      details?: string;
      state?: string;
      artwork?: PresenceImage;
      badge?: PresenceImage;
      startedAt?: number;
    }
  | {
      kind: "listening";
      song: string;
      artist: string;
      album?: string;
      artwork?: PresenceImage;
      /** The track on Spotify's web player. */
      url?: string;
      /** When the track started and ends, in epoch milliseconds. */
      startedAt?: number;
      endsAt?: number;
    }
  /** Neither playing nor listening: online, away (idle), busy (dnd), offline. */
  | { kind: "status"; status: DiscordStatus; message?: PresenceMessage }
  /** The live status has not arrived yet. */
  | { kind: "connecting" };

/** Where Lucas is on Discord right now. */
export type PresenceDevice = "desktop" | "mobile" | "web";

const PLAYING = 0;
const WATCHING = 3;
const CUSTOM_STATUS = 4;
/** The Lanyard KV key Lucas sets for the site (docs/presence.md). */
export const SITE_MESSAGE_KEY = "site_message";
const MESSAGE_MAX_LENGTH = 140;
const SPOTIFY_TRACK_ID = /^[A-Za-z0-9]{22}$/;

const playing = (game: Activity) => {
  const artwork = activityImage(
    game,
    game.assets?.large_image,
    game.assets?.large_text,
  );
  const badge = activityImage(
    game,
    game.assets?.small_image,
    game.assets?.small_text,
  );

  return {
    name: game.name,
    ...(game.details && { details: game.details }),
    ...(game.state && { state: game.state }),
    ...(artwork && { artwork }),
    ...(badge && { badge }),
    ...(game.timestamps?.start && { startedAt: game.timestamps.start }),
  };
};

const listening = (spotify: Spotify): Presence => ({
  kind: "listening",
  song: spotify.song,
  artist: spotify.artist,
  ...(spotify.album && { album: spotify.album }),
  ...(spotify.album_art_url && {
    artwork: { url: spotify.album_art_url, alt: spotify.album },
  }),
  ...(SPOTIFY_TRACK_ID.test(spotify.track_id ?? "") && {
    url: `https://open.spotify.com/track/${spotify.track_id}`,
  }),
  ...(spotify.timestamps?.start &&
    spotify.timestamps.end > spotify.timestamps.start && {
      startedAt: spotify.timestamps.start,
      endsAt: spotify.timestamps.end,
    }),
});

const oneLine = (text: string | undefined) =>
  text?.replace(/\s+/g, " ").trim().slice(0, MESSAGE_MAX_LENGTH) ?? "";

/**
 * Lucas's own line: the site message he set in Lanyard KV, otherwise his
 * Discord custom status. Plain text, on one line, never interpreted.
 */
export const selectMessage = (
  status: LanyardData,
): PresenceMessage | undefined => {
  const siteMessage = oneLine(status.kv?.[SITE_MESSAGE_KEY]);
  if (siteMessage) return { text: siteMessage };

  const custom = status.activities.find(
    (activity) => activity.type === CUSTOM_STATUS,
  );
  if (!custom) return undefined;
  const text = oneLine(custom.state);
  const emoji = custom.emoji;
  if (emoji?.id) {
    const extension = emoji.animated ? "gif" : "png";
    return {
      text,
      emojiImage: {
        url: `https://cdn.discordapp.com/emojis/${emoji.id}.${extension}`,
        alt: `:${emoji.name}:`,
      },
    };
  }
  if (!text && !emoji?.name) return undefined;
  return { text, ...(emoji?.name && { emoji: emoji.name }) };
};

/**
 * Picks what the friends panel shows: the game Lucas is playing, otherwise
 * the code he is writing, what he is watching, the track he is listening to
 * on Spotify, and last his Discord status with his own line. Before the
 * live status arrives it is connecting; once Lanyard is deemed unreachable,
 * he shows as offline, so the panel always shows a state.
 */
export const selectPresence = (
  status: LanyardData | undefined,
  { unreachable = false }: { unreachable?: boolean } = {},
): Presence => {
  if (!status) {
    return unreachable
      ? { kind: "status", status: "offline" }
      : { kind: "connecting" };
  }

  const game = status.activities.find(
    (activity) => activity.type === PLAYING && !isEditor(activity),
  );
  if (game) return { kind: "playing", ...playing(game) };

  const editor = status.activities.find(isEditor);
  if (editor) return codingActivity(editor);

  const show = status.activities.find((activity) => activity.type === WATCHING);
  if (show) return { kind: "watching", ...playing(show) };

  if (status.listening_to_spotify && status.spotify) {
    return listening(status.spotify);
  }

  const message = selectMessage(status);
  return {
    kind: "status",
    status: status.discord_status,
    ...(message && { message }),
  };
};

/** The status ring's colour: his Discord status, or none while connecting. */
export const presenceStatus = (
  status: LanyardData | undefined,
  { unreachable = false }: { unreachable?: boolean } = {},
): DiscordStatus | "connecting" =>
  status?.discord_status ?? (unreachable ? "offline" : "connecting");

/**
 * The device Lucas is on while he is not offline: his computer first, then
 * his phone, then a browser.
 */
export const presenceDevice = (
  status: LanyardData | undefined,
): PresenceDevice | undefined => {
  if (!status || status.discord_status === "offline") return undefined;
  if (status.active_on_discord_desktop) return "desktop";
  if (status.active_on_discord_mobile) return "mobile";
  if (status.active_on_discord_web) return "web";
  return undefined;
};
