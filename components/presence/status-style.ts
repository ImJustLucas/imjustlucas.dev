import type { DiscordStatus } from "./select-presence";

/** Discord's own status vocabulary, in the client's status colours. */
export const STATUS_RING: {
  readonly [S in DiscordStatus | "connecting"]: string;
} = {
  online: "ring-online",
  idle: "ring-away",
  dnd: "ring-busy",
  offline: "ring-common",
  connecting: "ring-seam",
};

export const STATUS_DOT: {
  readonly [S in DiscordStatus | "connecting"]: string;
} = {
  online: "bg-online",
  idle: "bg-away",
  dnd: "bg-busy",
  offline: "bg-common",
  connecting: "bg-seam",
};
