import { describe, expect, it } from "vitest";

import { activityPose } from "./activity-pose";

describe("activityPose", () => {
  it("strikes the pose of what Lucas is doing", () => {
    expect(activityPose({ kind: "playing", name: "League of Legends" })).toBe(
      "lol",
    );
    expect(activityPose({ kind: "coding", editor: "Cursor" })).toBe("coding");
    expect(activityPose({ kind: "watching", name: "Crunchyroll" })).toBe(
      "series",
    );
    expect(
      activityPose({ kind: "listening", song: "RACAILLE", artist: "Ino" }),
    ).toBe("music");
  });

  it("goes for a coffee away, codes busy and sleeps offline", () => {
    expect(activityPose({ kind: "status", status: "idle" })).toBe("coffee");
    expect(activityPose({ kind: "status", status: "dnd" })).toBe("coding");
    expect(activityPose({ kind: "status", status: "offline" })).toBe(
      "sleeping",
    );
  });

  it("leaves the place its own pose online with nothing on, or connecting", () => {
    expect(activityPose({ kind: "status", status: "online" })).toBeNull();
    expect(activityPose({ kind: "connecting" })).toBeNull();
  });
});
