/**
 * The chibi art (DESIGN.md, Shapes; `docs/design/chibi-poses.md`):
 * transparent WebP poses in `public/images/chibi/`. A pose has one or two
 * frames, alternated in steps, and some poses have a night outfit, worn by
 * Lucas's time in Paris; a pose with no night art wears its day one.
 */

export type ChibiPose =
  | "banner"
  | "chilling"
  | "sleeping"
  | "goodbye"
  | "trophy"
  | "surf"
  | "skate"
  | "lol"
  | "coding"
  | "coffee"
  | "series"
  | "music"
  | "football"
  | "tennis"
  | "ollie"
  | "christmas"
  | "santa";

type ChibiArt = {
  readonly day: ReadonlyArray<string>;
  readonly night?: ReadonlyArray<string>;
};

const art = (...names: ReadonlyArray<string>) =>
  names.map((name) => `/images/chibi/${name}.webp`);

const CHIBI: { readonly [P in ChibiPose]: ChibiArt } = {
  banner: { day: art("banner-day") },
  chilling: { day: art("chilling") },
  sleeping: { day: art("sleeping") },
  goodbye: { day: art("goodbye") },
  trophy: { day: art("trophy") },
  surf: { day: art("surf") },
  skate: { day: art("skate") },
  lol: { day: art("lol-day"), night: art("lol-night") },
  coding: { day: art("coding") },
  coffee: { day: art("coffee") },
  series: { day: art("series") },
  music: { day: art("music-a", "music-b") },
  football: { day: art("football") },
  tennis: { day: art("tennis") },
  ollie: { day: art("skate-ollie") },
  christmas: { day: art("banner-noel") },
  santa: { day: art("santa") },
};

/** Intrinsic size of every pose file (square). */
export const CHIBI_SIZE = 1024;

/** The frames of a pose, in the night outfit when it has one. */
export const chibiFrames = (
  pose: ChibiPose,
  night = false,
): ReadonlyArray<string> => (night && CHIBI[pose].night) || CHIBI[pose].day;

/** The poses the banner chibi can swap to when it is booped. */
export const BOOP_POSES: ReadonlyArray<ChibiPose> = [
  "banner",
  "surf",
  "skate",
  "lol",
  "coding",
  "coffee",
  "series",
  "music",
  "football",
  "tennis",
];

/**
 * The banner's resting pose: in December, by Lucas's time in Paris, he
 * waves in his Christmas hat.
 */
export const bannerPose = (december: boolean): ChibiPose =>
  december ? "christmas" : "banner";

/** The boop poses of the season: in December the Christmas ones join in. */
export const boopPoses = (december: boolean): ReadonlyArray<ChibiPose> =>
  december
    ? [
        "christmas",
        "santa",
        ...BOOP_POSES.filter((pose) => pose !== bannerPose(false)),
      ]
    : BOOP_POSES;
