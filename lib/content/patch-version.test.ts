import { describe, expect, it } from "vitest";

import {
  byVersionNewestFirst,
  nextVersion,
  PATCH_VERSION,
  seasonOf,
} from "./patch-version";

describe("PATCH_VERSION", () => {
  it.each(["1.0", "2.4", "2.12", "2.4.1", "10.0.3"])("accepts %s", (version) =>
    expect(PATCH_VERSION.test(version)).toBe(true),
  );

  it.each(["2", "v2.4", "2.04", "02.4", "2.4.", "2.4.1.0", "2.x", ""])(
    "rejects %s",
    (version) => expect(PATCH_VERSION.test(version)).toBe(false),
  );
});

describe("byVersionNewestFirst", () => {
  it("orders by season, then patch, then hotfix, numerically", () => {
    expect(
      ["1.2", "2.10", "2.4.1", "2.9", "2.4", "1.10", "2.0"].sort(
        byVersionNewestFirst,
      ),
    ).toEqual(["2.10", "2.9", "2.4.1", "2.4", "2.0", "1.10", "1.2"]);
  });
});

describe("seasonOf", () => {
  it("is the first number", () => {
    expect(seasonOf("2.4.1")).toBe(2);
    expect(seasonOf("1.0")).toBe(1);
  });
});

describe("nextVersion", () => {
  it("is the next patch of the latest version's season", () => {
    expect(nextVersion("2.4")).toBe("2.5");
    expect(nextVersion("2.9")).toBe("2.10");
    expect(nextVersion("2.4.1")).toBe("2.5");
  });

  it("starts at 1.0 with no version, or one it cannot read", () => {
    expect(nextVersion(undefined)).toBe("1.0");
    expect(nextVersion("v2")).toBe("1.0");
  });
});
