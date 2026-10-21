import type { Presence } from "./select-presence";

/**
 * What Lucas is doing, as screen readers hear it change: the game he plays,
 * that he listens to Spotify, or his status. Never the elapsed time or the
 * track, which change on their own; null while connecting.
 */
export const presenceActivity = (presence: Presence): string | null => {
  switch (presence.kind) {
    case "playing":
      return `playing:${presence.name}`;
    case "listening":
      return "listening";
    case "status":
      return `status:${presence.status}`;
    case "connecting":
      return null;
  }
};
