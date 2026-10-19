import { describe, expect, it } from "vitest";

import { pageGenerationOf } from "./external-source";

describe("pageGenerationOf", () => {
  it("is a cold build during next build", () => {
    expect(
      pageGenerationOf({
        NEXT_PHASE: "phase-production-build",
        NODE_ENV: "production",
      }),
    ).toBe("cold-build");
  });

  it("is a revalidation on the production server", () => {
    expect(pageGenerationOf({ NODE_ENV: "production" })).toBe("revalidation");
    expect(
      pageGenerationOf({
        NEXT_PHASE: "phase-production-server",
        NODE_ENV: "production",
      }),
    ).toBe("revalidation");
  });

  it("is a cold build in development, where no earlier page exists", () => {
    expect(
      pageGenerationOf({
        NEXT_PHASE: "phase-development-server",
        NODE_ENV: "development",
      }),
    ).toBe("cold-build");
  });
});
