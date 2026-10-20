import type { Activity, LanyardData, Spotify } from "react-use-lanyard";

export type PresenceImage = { url: string; alt: string };

/** Lucas's Discord status, as Discord names it. */
export type DiscordStatus = LanyardData["discord_status"];

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
      kind: "listening";
      song: string;
      artist: string;
      artwork?: PresenceImage;
    }
  /** Neither playing nor listening: online, away (idle), busy (dnd), offline. */
  | { kind: "status"; status: DiscordStatus }
  /** The live status has not arrived yet. */
  | { kind: "connecting" };

const PLAYING = 0;
const MEDIA_PROXY_PREFIX = "mp:";

const gameImageUrl = (game: Activity, image: string | undefined) => {
  if (!image) return undefined;
  if (image.startsWith(MEDIA_PROXY_PREFIX)) {
    return `https://media.discordapp.net/${image.slice(MEDIA_PROXY_PREFIX.length)}`;
  }
  if (!game.application_id) return undefined;
  return `https://cdn.discordapp.com/app-assets/${game.application_id}/${image}.png`;
};

const gameImage = (
  game: Activity,
  image: string | undefined,
  caption: string | undefined,
): PresenceImage | undefined => {
  const url = gameImageUrl(game, image);
  return url ? { url, alt: caption || game.name } : undefined;
};

const playing = (game: Activity): Presence => {
  const artwork = gameImage(
    game,
    game.assets?.large_image,
    game.assets?.large_text,
  );
  const badge = gameImage(
    game,
    game.assets?.small_image,
    game.assets?.small_text,
  );

  return {
    kind: "playing",
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
  ...(spotify.album_art_url && {
    artwork: { url: spotify.album_art_url, alt: spotify.album },
  }),
});

/**
 * Picks what the friends panel shows: the game Lucas is playing, otherwise
 * the track he is listening to on Spotify, otherwise his Discord status.
 * Before the live status arrives it is connecting; once Lanyard is deemed
 * unreachable, he shows as offline, so the panel always shows a state.
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

  const game = status.activities.find((activity) => activity.type === PLAYING);
  if (game) return playing(game);

  if (status.listening_to_spotify && status.spotify) {
    return listening(status.spotify);
  }

  return { kind: "status", status: status.discord_status };
};

/** The status ring's colour: his Discord status, or none while connecting. */
export const presenceStatus = (
  status: LanyardData | undefined,
  { unreachable = false }: { unreachable?: boolean } = {},
): DiscordStatus | "connecting" =>
  status?.discord_status ?? (unreachable ? "offline" : "connecting");
