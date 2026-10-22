import type { ChibiPose } from "@/lib/chibi";

import type { DiscordStatus, Presence } from "./select-presence";

/** The poses Lucas strikes live, each with its own description. */
export type ActivityPose = Extract<
  ChibiPose,
  "lol" | "coding" | "series" | "music" | "coffee" | "sleeping"
>;

const STATUS_POSE: { readonly [S in DiscordStatus]: ActivityPose | null } = {
  online: null,
  idle: "coffee",
  dnd: "coding",
  offline: "sleeping",
};

/**
 * The chibi pose of what Lucas is doing right now: his LoL pose at a game,
 * coding at his editor, series in front of a show, music on Spotify, a
 * coffee while away, coding again when busy (in the zone), asleep offline.
 * Null when online with nothing on, or while connecting: the place keeps
 * its own pose.
 */
export const activityPose = (presence: Presence): ActivityPose | null => {
  switch (presence.kind) {
    case "playing":
      return "lol";
    case "coding":
      return "coding";
    case "watching":
      return "series";
    case "listening":
      return "music";
    case "status":
      return STATUS_POSE[presence.status];
    case "connecting":
      return null;
  }
};
