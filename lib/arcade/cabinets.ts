import type { ChibiPose } from "@/lib/chibi";

/**
 * The Arcade's cabinets, one per hobby, in shelf order. A playable cabinet
 * has its game in `components/arcade/`; a cabinet that is `soon` stands on the
 * shelf as a silhouette until its game and poses exist. Adding a game is an
 * entry here, its texts under `Arcade.cabinets` in every dictionary, and its
 * screen in `ArcadeFloor`.
 */
export type Cabinet = {
  readonly id: CabinetId;
  /** The pose on the cabinet's tile. */
  readonly pose: ChibiPose;
  readonly status: "playable" | "soon";
};

export type CabinetId = "ollie" | "surf";

export const CABINETS: ReadonlyArray<Cabinet> = [
  { id: "ollie", pose: "skate", status: "playable" },
  { id: "surf", pose: "surf", status: "playable" },
];

/**
 * Opens a cabinet on the Arcade floor already on screen (the quick menu's
 * "play" commands): a window event whose `detail` is the `CabinetId`.
 */
export const ARCADE_OPEN_EVENT = "arcade:open";
