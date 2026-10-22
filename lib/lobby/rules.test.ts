import { describe, expect, it } from "vitest";

import { isSessionId, lobbyView } from "./rules";

describe("lobbyView", () => {
  it("hides the counter until a beat answers, and when the store is down", () => {
    expect(lobbyView(undefined)).toEqual({ kind: "hidden" });
    expect(lobbyView({ kind: "unavailable" })).toEqual({ kind: "hidden" });
    expect(lobbyView({ kind: "refused" })).toEqual({ kind: "hidden" });
  });

  it("says just you when the visitor is alone, never zero", () => {
    expect(lobbyView({ kind: "lobby", count: 1 })).toEqual({ kind: "alone" });
    expect(lobbyView({ kind: "lobby", count: 0 })).toEqual({ kind: "alone" });
  });

  it("counts the players otherwise, the visitor included", () => {
    expect(lobbyView({ kind: "lobby", count: 3 })).toEqual({
      kind: "players",
      count: 3,
    });
  });
});

describe("isSessionId", () => {
  it("takes a random UUID and nothing else", () => {
    expect(isSessionId(crypto.randomUUID())).toBe(true);
    expect(isSessionId("3F2B1C9E-8D7A-4B6C-9E5F-1A2B3C4D5E6F")).toBe(false);
    expect(isSessionId("1.2.3.4")).toBe(false);
    expect(isSessionId({})).toBe(false);
  });
});
