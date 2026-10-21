import { describe, expect, it } from "vitest";

import { bannerPose, BOOP_POSES, boopPoses } from "./chibi";

describe("the banner's season", () => {
  it("waves in the usual banner pose outside December", () => {
    expect(bannerPose(false)).toBe("banner");
    expect(boopPoses(false)).toBe(BOOP_POSES);
  });

  it("wears the Christmas poses in December, in place of the usual banner", () => {
    expect(bannerPose(true)).toBe("christmas");
    expect(boopPoses(true)).toContain("christmas");
    expect(boopPoses(true)).toContain("santa");
    expect(boopPoses(true)).not.toContain("banner");
  });
});
