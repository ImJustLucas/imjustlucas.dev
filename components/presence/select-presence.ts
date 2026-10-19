import type { Activity, LanyardData, Spotify } from "react-use-lanyard";

export type PresenceImage = { url: string; alt: string };

/** What the Presence card shows, derived from the live Lanyard status. */
export type Presence =
  | {
      kind: "playing";
      name: string;
      details?: string;
      state?: string;
      artwork?: PresenceImage;
      badge?: PresenceImage;
    }
  | {
      kind: "listening";
      song: string;
      artist: string;
      artwork?: PresenceImage;
    }
  | { kind: "nothing" };

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
 * Picks what the Presence card shows: the game Lucas is playing, otherwise
 * the track he is listening to on Spotify, otherwise nothing.
 */
export const selectPresence = (status: LanyardData | undefined): Presence => {
  const game = status?.activities.find((activity) => activity.type === PLAYING);
  if (game) return playing(game);

  if (status?.listening_to_spotify && status.spotify) {
    return listening(status.spotify);
  }

  return { kind: "nothing" };
};
