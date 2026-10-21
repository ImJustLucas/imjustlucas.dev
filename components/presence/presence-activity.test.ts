import { describe, expect, it } from "vitest";

import { presenceActivity } from "./presence-activity";

describe("presenceActivity", () => {
  it("names the game, whatever the elapsed time or detail", () => {
    expect(
      presenceActivity({
        kind: "playing",
        name: "League of Legends",
        details: "Ranked",
        startedAt: 1,
      }),
    ).toBe(
      presenceActivity({
        kind: "playing",
        name: "League of Legends",
        details: "In lobby",
        startedAt: 2,
      }),
    );
  });

  it("changes when Lucas switches games", () => {
    expect(presenceActivity({ kind: "playing", name: "Valorant" })).not.toBe(
      presenceActivity({ kind: "playing", name: "League of Legends" }),
    );
  });

  it("stays the same when the Spotify track changes", () => {
    expect(
      presenceActivity({ kind: "listening", song: "One", artist: "A" }),
    ).toBe(presenceActivity({ kind: "listening", song: "Two", artist: "B" }));
  });

  it("changes with the status", () => {
    expect(presenceActivity({ kind: "status", status: "online" })).not.toBe(
      presenceActivity({ kind: "status", status: "idle" }),
    );
  });

  it("has nothing to announce while connecting", () => {
    expect(presenceActivity({ kind: "connecting" })).toBeNull();
  });
});
