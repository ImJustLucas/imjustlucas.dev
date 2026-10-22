import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_PREFS,
  firstTrack,
  formatTime,
  gainOf,
  initialRadio,
  isOn,
  mediaMetadata,
  nextTrack,
  parseRadioPrefs,
  RADIO_STORAGE_KEY,
  type RadioEvent,
  radioReducer,
  type RadioState,
  rainSounds,
  readRadioPrefs,
  writeRadioPrefs,
} from "./radio";
import { TRACKS } from "./tracks";

const COUNT = 3;
const off: RadioState = initialRadio(DEFAULT_PREFS, COUNT, 0);
const run = (state: RadioState, ...events: RadioEvent[]) =>
  events.reduce((s, event) => radioReducer(COUNT, s, event), state);

describe("the track list", () => {
  it("has unique ids and a file for every track", () => {
    expect(new Set(TRACKS.map((t) => t.id)).size).toBe(TRACKS.length);
    for (const track of TRACKS) {
      expect(existsSync(join(process.cwd(), "public", track.src))).toBe(true);
      expect(track.duration).toBeGreaterThan(0);
      expect(track.source).toMatch(/^https:\/\/freemusicarchive\.org\//);
    }
  });
});

describe("the radio's transitions", () => {
  it("starts off, and only a press starts it", () => {
    expect(off.status).toBe("off");
    expect(isOn(off)).toBe(false);
    expect(run(off, { type: "play" }).status).toBe("loading");
    expect(run(off, { type: "play" }, { type: "started" }).status).toBe(
      "playing",
    );
  });

  it("ignores a late start once paused", () => {
    expect(
      run(off, { type: "play" }, { type: "pause" }, { type: "started" }).status,
    ).toBe("paused");
  });

  it("pauses on pause, on the site's mute and when a track fails", () => {
    const playing = run(off, { type: "play" }, { type: "started" });
    for (const type of ["pause", "mute", "failed"] as const) {
      expect(run(playing, { type }).status).toBe("paused");
    }
    expect(run(off, { type: "mute" }).status).toBe("off");
  });

  it("moves to the next track, looping, and keeps playing", () => {
    const playing = run(off, { type: "play" }, { type: "started" });
    const next = run(playing, { type: "next" });
    expect(next).toMatchObject({ track: 1, status: "loading" });
    expect(
      run(playing, { type: "next" }, { type: "next" }, { type: "next" }),
    ).toMatchObject({ track: 0 });
    expect(run(playing, { type: "ended" })).toMatchObject({
      track: 1,
      status: "loading",
    });
  });

  it("only moves on when paused or off", () => {
    expect(run(off, { type: "next" })).toMatchObject({
      track: 1,
      status: "off",
    });
    const paused = run(off, { type: "play" }, { type: "pause" });
    expect(run(paused, { type: "next" }).status).toBe("paused");
  });

  it("clamps the volumes and flips the rain", () => {
    expect(run(off, { type: "volume", value: 2 }).volume).toBe(1);
    expect(run(off, { type: "rainVolume", value: -1 }).rainVolume).toBe(0);
    expect(run(off, { type: "volume", value: Number.NaN }).volume).toBe(0);
    expect(run(off, { type: "rain" }).rain).toBe(true);
  });

  it("restores stored preferences only while off", () => {
    const prefs = { volume: 0.2, rain: true, rainVolume: 0.9 };
    expect(run(off, { type: "restore", prefs, track: 2 })).toMatchObject({
      ...prefs,
      track: 2,
    });
    const playing = run(off, { type: "play" });
    expect(run(playing, { type: "restore", prefs, track: 2 })).toBe(playing);
  });

  it("sounds the rain only while the radio plays", () => {
    const rainy = run(off, { type: "rain" });
    expect(rainSounds(rainy)).toBe(false);
    expect(rainSounds(run(rainy, { type: "play" }))).toBe(true);
    expect(rainSounds(run(rainy, { type: "play" }, { type: "pause" }))).toBe(
      false,
    );
  });
});

describe("track order", () => {
  it("loops", () => {
    expect(nextTrack(0, 3)).toBe(1);
    expect(nextTrack(2, 3)).toBe(0);
    expect(nextTrack(0, 0)).toBe(0);
  });

  it("picks the first track from a random number", () => {
    expect(firstTrack(9, 0)).toBe(0);
    expect(firstTrack(9, 0.5)).toBe(4);
    expect(firstTrack(9, 0.9999999)).toBe(8);
    expect(firstTrack(9, 1)).toBe(8);
    expect(firstTrack(0, 0.5)).toBe(0);
  });
});

describe("gainOf", () => {
  it("squares the slider under the maximum", () => {
    expect(gainOf(0, 0.7)).toBe(0);
    expect(gainOf(1, 0.7)).toBeCloseTo(0.7);
    expect(gainOf(0.5, 1)).toBeCloseTo(0.25);
    expect(gainOf(3, 1)).toBe(1);
  });
});

describe("formatTime", () => {
  it("writes m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65.9)).toBe("1:05");
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(-3)).toBe("0:00");
  });
});

describe("mediaMetadata", () => {
  it("names the track, the artist and the album with the artwork", () => {
    expect(mediaMetadata(TRACKS[0], "cosy radio", "/a.webp")).toEqual({
      title: TRACKS[0].title,
      artist: "HoliznaCC0",
      album: "cosy radio",
      artwork: [{ src: "/a.webp", sizes: "1024x1024", type: "image/webp" }],
    });
  });
});

describe("stored preferences", () => {
  it("parses known values and keeps defaults otherwise", () => {
    expect(parseRadioPrefs(null)).toEqual(DEFAULT_PREFS);
    expect(parseRadioPrefs("not json")).toEqual(DEFAULT_PREFS);
    expect(parseRadioPrefs("42")).toEqual(DEFAULT_PREFS);
    expect(
      parseRadioPrefs(JSON.stringify({ volume: 0.2, rain: true, x: 1 })),
    ).toEqual({ volume: 0.2, rain: true, rainVolume: 0.5 });
    expect(parseRadioPrefs(JSON.stringify({ volume: 9, rain: "yes" }))).toEqual(
      { volume: 1, rain: false, rainVolume: 0.5 },
    );
  });

  it("round-trips through storage", () => {
    const store = new Map<string, string>();
    const storage = () => ({
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    });
    const prefs = { volume: 0.3, rain: true, rainVolume: 0.8 };
    writeRadioPrefs(storage, prefs);
    expect(store.has(RADIO_STORAGE_KEY)).toBe(true);
    expect(readRadioPrefs(storage)).toEqual(prefs);
  });

  it("survives storage that refuses", () => {
    const refusing = () => {
      throw new Error("blocked");
    };
    expect(readRadioPrefs(refusing)).toEqual(DEFAULT_PREFS);
    expect(() => writeRadioPrefs(refusing, DEFAULT_PREFS)).not.toThrow();
  });
});
