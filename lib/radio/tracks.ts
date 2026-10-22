/**
 * The radio's tracks (DESIGN.md, Radio): lofi by HoliznaCC0, from the album
 * "Public Domain Lofi" on the Free Music Archive, each track's page checked
 * on 2026-10-22 as CC0 1.0 Universal (no credit required; the radio names
 * the artist anyway). Re-encoded to AAC at 96 kb/s in `public/radio/`.
 * Never add a track whose licence has not been checked the same way.
 */

export type Track = {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly src: string;
  /** Seconds. */
  readonly duration: number;
  /** The track's page, where its licence is shown. */
  readonly source: string;
};

export const RADIO_LICENCE =
  "https://creativecommons.org/publicdomain/zero/1.0/";

const ALBUM =
  "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi";

const track = (
  id: string,
  title: string,
  duration: number,
  handle: string,
): Track => ({
  id,
  title,
  artist: "HoliznaCC0",
  src: `/radio/${id}.m4a`,
  duration,
  source: `${ALBUM}/${handle}/`,
});

export const TRACKS: ReadonlyArray<Track> = [
  track("tokyo-sunset", "Tokyo Sunset", 139, "tokyo-sunset-lofi-peaceful-soft"),
  track(
    "ease-into-night",
    "Ease into Night",
    152,
    "ease-into-night-lofi-relax-chill",
  ),
  track("bubbles", "Bubbles", 148, "bubbles-lofi-bright-relaxed"),
  track("calm-currents", "Calm Currents", 148, "calm-currents-lofi-relax-calm"),
  track("lucid", "Lucid", 145, "lucid-lofi-dreamy-chill"),
  track("doodles", "Doodles", 138, "doodles-lofi-happy-mp3"),
  track("moon-unit", "Moon Unit", 172, "moon-unit-lofi-reflection-dreamy"),
  track("birds", "Birds", 170, "birds-lofi-chill"),
  track(
    "one-night-in-france",
    "One Night In France",
    195,
    "one-night-in-france-lofi-nostalgic-chill",
  ),
];
