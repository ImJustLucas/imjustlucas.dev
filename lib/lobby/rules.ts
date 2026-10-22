/**
 * The lobby (DESIGN.md, Friends panel): how many visitors are on the site
 * right now. Each open tab, while it is visible, sends a beat with an
 * anonymous id made in the browser (no IP, no cookie); a visitor stays in
 * the lobby until their last beat is `LOBBY_TTL_MS` old. Plain rules shared
 * by the browser and the server; the store is in `lobby.ts`.
 */

/** How often a visible tab beats. */
export const HEARTBEAT_MS = 30_000;

/** How long a beat keeps its visitor in the lobby: two beats, missed once. */
export const LOBBY_TTL_MS = 60_000;

/** Players in the lobby at once that unlock the "not alone" Trophy. */
export const CROWD = 5;

/** What a beat answers: everyone in the lobby, the sender included. */
export type LobbyBeat =
  | { readonly kind: "lobby"; readonly count: number }
  | { readonly kind: "refused" }
  | { readonly kind: "unavailable" };

/** What the friends panel shows of the lobby. */
export type LobbyView =
  | { readonly kind: "hidden" }
  | { readonly kind: "alone" }
  | { readonly kind: "players"; readonly count: number };

/** A visitor's id for the lobby: a random UUID, nothing else. */
export const isSessionId = (id: unknown): id is string =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);

/** Whether a beat found a crowd: `CROWD` players or more, the sender included. */
export const isCrowd = (beat: LobbyBeat): boolean =>
  beat.kind === "lobby" && beat.count >= CROWD;

/**
 * The lobby as the panel shows it: hidden while no beat has answered or when
 * the store is down, "just you" when the visitor is the only one (never 0:
 * the sender always counts), the number of players otherwise.
 */
export const lobbyView = (beat: LobbyBeat | undefined): LobbyView => {
  if (!beat || beat.kind !== "lobby") return { kind: "hidden" };
  return beat.count <= 1
    ? { kind: "alone" }
    : { kind: "players", count: beat.count };
};
