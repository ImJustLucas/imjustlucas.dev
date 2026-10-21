import { describe, expect, it } from "vitest";

import { isPlayerId, NAME_MAX_LENGTH, parseName } from "./player-name";

describe("a player's name", () => {
  it("is tidied: trimmed, with single spaces", () => {
    expect(parseName("  Léa  ")).toEqual({ ok: true, name: "Léa" });
    expect(parseName("Jean   Pierre")).toEqual({
      ok: true,
      name: "Jean Pierre",
    });
  });

  it("takes accents, other scripts, apostrophes and hyphens", () => {
    for (const name of ["Zoé", "Anne-Sophie", "D'Artagnan", "Ömer", "ユキ"]) {
      expect(parseName(name).ok).toBe(true);
    }
  });

  it("refuses an empty or too long name", () => {
    expect(parseName("   ")).toEqual({ ok: false, problem: "empty" });
    expect(parseName("a".repeat(NAME_MAX_LENGTH + 1))).toEqual({
      ok: false,
      problem: "too-long",
    });
    expect(parseName("a".repeat(NAME_MAX_LENGTH)).ok).toBe(true);
  });

  it("refuses markup, links and symbols", () => {
    for (const name of ["<b>x</b>", "a@b.fr", "-Léa", "https://x.y", "💩"]) {
      expect(parseName(name)).toEqual({ ok: false, problem: "characters" });
    }
  });

  it("refuses the obvious insults, however they are written", () => {
    expect(parseName("FDP")).toEqual({ ok: false, problem: "blocked" });
    expect(parseName("Connard")).toEqual({ ok: false, problem: "blocked" });
    expect(parseName("le salopé")).toEqual({ ok: false, problem: "blocked" });
  });

  it("keeps real names that only contain a short blocked word", () => {
    expect(parseName("Dickson").ok).toBe(true);
    expect(parseName("Pdro").ok).toBe(true);
  });
});

describe("a player id", () => {
  it("is a lowercase UUID", () => {
    expect(isPlayerId("3f2b1c9e-8d7a-4b6c-9e5f-1a2b3c4d5e6f")).toBe(true);
    expect(isPlayerId("not-an-id")).toBe(false);
  });
});
