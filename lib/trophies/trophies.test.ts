import { describe, expect, it } from "vitest";

import { MENU_ROUTES } from "@/config/routes";
import { SECRET_WORDS } from "@/lib/quick-menu/commands";

import {
  countTrophyStepIn,
  EMPTY_PROGRESS,
  markAnnouncedIn,
  parseProgress,
  readStoredProgress,
  TALLIES,
  toAnnounce,
  TROPHIES,
  TROPHY_STORAGE_KEY,
  trophyById,
  trophyCount,
  type TrophyProgress,
  unlockedCount,
  unlockTrophyIn,
  writeStoredProgress,
} from "./trophies";

const MONDAY = new Date("2026-10-19T10:00:00.000Z");
const TUESDAY = new Date("2026-10-20T10:00:00.000Z");

const memoryStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    values,
  };
};

const refusing = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

/** Every Trophy unlocked but the one for all others. */
const allButPlatinum = (): TrophyProgress => {
  let progress = EMPTY_PROGRESS;
  for (const trophy of TROPHIES) {
    if (trophy.tally) {
      for (const step of TALLIES[trophy.tally.of]) {
        progress = countTrophyStepIn(progress, trophy.tally.of, step, MONDAY);
      }
    } else if (!trophy.everyOther) {
      progress = unlockTrophyIn(progress, trophy.id, MONDAY);
    }
  }
  return progress;
};

describe("the trophies", () => {
  it("have unique ids and one Trophy for all the others", () => {
    const ids = TROPHIES.map((trophy) => trophy.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TROPHIES.filter((trophy) => trophy.everyOther)).toHaveLength(1);
  });

  it("count the quick menu's secrets and the menu's tabs", () => {
    expect([...TALLIES.secrets].sort()).toEqual(
      Object.keys(SECRET_WORDS).sort(),
    );
    expect(TALLIES.tabs).toEqual(MENU_ROUTES.map((route) => route.path));
  });

  it("start locked", () => {
    expect(unlockedCount(EMPTY_PROGRESS)).toBe(0);
    expect(trophyCount(EMPTY_PROGRESS, trophyById("painter"))).toEqual({
      done: 0,
      goal: 5,
    });
  });
});

describe("unlocking a trophy", () => {
  it("keeps the day it was unlocked", () => {
    const progress = unlockTrophyIn(EMPTY_PROGRESS, "ollie", MONDAY);
    expect(progress.unlocked.ollie).toBe(MONDAY.toISOString());
    expect(unlockedCount(progress)).toBe(1);
  });

  it("happens once: unlocking again changes nothing", () => {
    const once = unlockTrophyIn(EMPTY_PROGRESS, "ollie", MONDAY);
    expect(unlockTrophyIn(once, "ollie", TUESDAY)).toBe(once);
  });

  it("leaves a Trophy built on a Tally or on all others to its rule", () => {
    expect(unlockTrophyIn(EMPTY_PROGRESS, "painter", MONDAY)).toBe(
      EMPTY_PROGRESS,
    );
    expect(unlockTrophyIn(EMPTY_PROGRESS, "platinum", MONDAY)).toBe(
      EMPTY_PROGRESS,
    );
  });
});

describe("counting a tally's steps", () => {
  it("counts each step once and unlocks when every step is counted", () => {
    let progress = EMPTY_PROGRESS;
    for (const palette of ["electric", "plum", "plum", "khaki", "sakura"]) {
      progress = countTrophyStepIn(
        progress,
        "palettes",
        palette as "plum",
        MONDAY,
      );
    }
    expect(trophyCount(progress, trophyById("painter"))).toEqual({
      done: 4,
      goal: 5,
    });
    expect(progress.unlocked.painter).toBeUndefined();

    progress = countTrophyStepIn(progress, "palettes", "surf", TUESDAY);
    expect(progress.unlocked.painter).toBe(TUESDAY.toISOString());
  });

  it("returns the same progress for a step already counted", () => {
    const once = countTrophyStepIn(EMPTY_PROGRESS, "modes", "dark", MONDAY);
    expect(countTrophyStepIn(once, "modes", "dark", TUESDAY)).toBe(once);
  });

  it("ignores a step the tally does not know", () => {
    expect(countTrophyStepIn(EMPTY_PROGRESS, "tabs", "/nowhere", MONDAY)).toBe(
      EMPTY_PROGRESS,
    );
  });

  it("unlocks the first secret on one secret, the hunter on all six", () => {
    let progress = countTrophyStepIn(EMPTY_PROGRESS, "secrets", "gg", MONDAY);
    expect(progress.unlocked.firstSecret).toBe(MONDAY.toISOString());
    expect(progress.unlocked.secretHunter).toBeUndefined();
    expect(trophyCount(progress, trophyById("secretHunter"))).toEqual({
      done: 1,
      goal: 6,
    });

    for (const secret of TALLIES.secrets) {
      progress = countTrophyStepIn(progress, "secrets", secret, TUESDAY);
    }
    expect(progress.unlocked.firstSecret).toBe(MONDAY.toISOString());
    expect(progress.unlocked.secretHunter).toBe(TUESDAY.toISOString());
  });
});

describe("the trophy for all others", () => {
  it("counts the others unlocked", () => {
    const progress = unlockTrophyIn(EMPTY_PROGRESS, "lost", MONDAY);
    expect(trophyCount(progress, trophyById("platinum"))).toEqual({
      done: 1,
      goal: TROPHIES.length - 1,
    });
  });

  it("unlocks with the last of the others", () => {
    const progress = allButPlatinum();
    expect(progress.unlocked.platinum).toBe(MONDAY.toISOString());
    expect(unlockedCount(progress)).toBe(TROPHIES.length);
  });
});

describe("announcing unlocks", () => {
  it("lists the unlocked Trophies not yet announced, oldest first", () => {
    let progress = unlockTrophyIn(EMPTY_PROGRESS, "surf", TUESDAY);
    progress = unlockTrophyIn(progress, "lost", MONDAY);
    expect(toAnnounce(progress)).toEqual(["lost", "surf"]);

    progress = markAnnouncedIn(progress, "lost");
    expect(toAnnounce(progress)).toEqual(["surf"]);
    expect(markAnnouncedIn(progress, "lost")).toBe(progress);
  });
});

describe("the stored progress", () => {
  it("reads back what was stored", () => {
    const storage = memoryStorage();
    const progress = markAnnouncedIn(
      countTrophyStepIn(
        unlockTrophyIn(EMPTY_PROGRESS, "ollie", MONDAY),
        "tabs",
        "/arcade",
        MONDAY,
      ),
      "ollie",
    );
    writeStoredProgress(() => storage, progress);
    expect(storage.values.has(TROPHY_STORAGE_KEY)).toBe(true);
    expect(readStoredProgress(() => storage)).toEqual(progress);
  });

  it("is empty without storage, and storing never throws", () => {
    expect(readStoredProgress(refusing)).toBe(EMPTY_PROGRESS);
    expect(() =>
      writeStoredProgress(
        refusing,
        unlockTrophyIn(EMPTY_PROGRESS, "ollie", MONDAY),
      ),
    ).not.toThrow();
  });

  it("is empty when what is stored is not progress", () => {
    for (const raw of [null, "", "{", "[]", "42", JSON.stringify("text")]) {
      expect(parseProgress(raw)).toBe(EMPTY_PROGRESS);
    }
  });

  it("drops unknown trophies, tallies, steps and bad dates", () => {
    const raw = JSON.stringify({
      unlocked: {
        ollie: MONDAY.toISOString(),
        retired: MONDAY.toISOString(),
        surf: "not a date",
      },
      announced: ["ollie", "ollie", "surf", "retired"],
      tallies: {
        palettes: ["plum", "neon", "plum"],
        moods: ["happy"],
        tabs: "/arcade",
      },
    });
    expect(parseProgress(raw)).toEqual({
      unlocked: { ollie: MONDAY.toISOString() },
      announced: ["ollie"],
      tallies: { palettes: ["plum"] },
    });
  });
});
