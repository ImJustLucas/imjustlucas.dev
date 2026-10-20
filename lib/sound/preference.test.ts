import { describe, expect, it } from "vitest";

import {
  readStoredSound,
  resolveSoundState,
  SOUND_STORAGE_KEY,
  writeStoredSound,
} from "./preference";

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

describe("the sound preference", () => {
  it("is on by default", () => {
    expect(resolveSoundState(null, false)).toEqual({
      enabled: true,
      reason: "default",
    });
  });

  it("is off by default under reduced motion", () => {
    expect(resolveSoundState(null, true)).toEqual({
      enabled: false,
      reason: "reduced-motion",
    });
  });

  it("follows the visitor's choice over reduced motion", () => {
    expect(resolveSoundState("on", true)).toEqual({
      enabled: true,
      reason: "chosen",
    });
    expect(resolveSoundState("off", false)).toEqual({
      enabled: false,
      reason: "chosen",
    });
  });

  it("stores the choice and reads it back", () => {
    const storage = memoryStorage();
    writeStoredSound(() => storage, "off");
    expect(storage.values.get(SOUND_STORAGE_KEY)).toBe("off");
    expect(readStoredSound(() => storage)).toBe("off");
  });

  it("ignores an unknown stored value", () => {
    const storage = memoryStorage({ [SOUND_STORAGE_KEY]: "loud" });
    expect(readStoredSound(() => storage)).toBeNull();
  });

  it("keeps working when storage is unavailable", () => {
    expect(readStoredSound(refusing)).toBeNull();
    expect(() => writeStoredSound(refusing, "on")).not.toThrow();
    const throwingStorage = {
      getItem: refusing,
      setItem: refusing,
    };
    expect(readStoredSound(() => throwingStorage)).toBeNull();
    expect(() => writeStoredSound(() => throwingStorage, "on")).not.toThrow();
  });
});
