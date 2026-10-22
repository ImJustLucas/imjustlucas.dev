import { describe, expect, it } from "vitest";

import { awaitsReply, readVisitPoke, type VisitPoke, waveView } from "./visit";

const HOUR = 60 * 60 * 1000;
const SENT_AT = Date.UTC(2026, 9, 22, 12);
const POKE: VisitPoke = {
  pokeId: "3f2b1c9e-8d7a-4b6c-9e5f-1a2b3c4d5e6f",
  emote: "surf",
  at: SENT_AT,
  wavedBack: false,
};

describe("readVisitPoke", () => {
  it("reads what the browser kept", () => {
    expect(readVisitPoke(JSON.stringify(POKE))).toEqual(POKE);
  });

  it("drops what it cannot trust", () => {
    expect(readVisitPoke(null)).toBeNull();
    expect(readVisitPoke("{not json")).toBeNull();
    expect(readVisitPoke(JSON.stringify("hello"))).toBeNull();
    expect(readVisitPoke(JSON.stringify({ ...POKE, at: "soon" }))).toBeNull();
    expect(
      readVisitPoke(JSON.stringify({ ...POKE, emote: "🖕", pokeId: 4 })),
    ).toEqual({ ...POKE, emote: null, pokeId: null });
  });
});

describe("waveView", () => {
  it("offers the emotes when the visitor has not waved", () => {
    expect(waveView(null, SENT_AT)).toEqual({ kind: "ready" });
  });

  it("holds the sent wave for the visitor's day", () => {
    expect(waveView(POKE, SENT_AT + 23 * HOUR)).toEqual({
      kind: "sent",
      emote: "surf",
      wavedBack: false,
    });
    expect(waveView({ ...POKE, wavedBack: true }, SENT_AT + HOUR)).toEqual({
      kind: "sent",
      emote: "surf",
      wavedBack: true,
    });
    expect(waveView(POKE, SENT_AT + 24 * HOUR)).toEqual({ kind: "ready" });
  });
});

describe("awaitsReply", () => {
  it("asks for a week, until Lucas waves back", () => {
    expect(awaitsReply(POKE, SENT_AT + 6 * 24 * HOUR)).toBe(true);
    expect(awaitsReply(POKE, SENT_AT + 7 * 24 * HOUR)).toBe(false);
    expect(awaitsReply({ ...POKE, wavedBack: true }, SENT_AT)).toBe(false);
  });

  it("never asks without a Poke the server kept", () => {
    expect(awaitsReply(null, SENT_AT)).toBe(false);
    expect(awaitsReply({ ...POKE, pokeId: null }, SENT_AT)).toBe(false);
  });
});
