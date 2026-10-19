import { describe, expect, it } from "vitest";

import { isActiveRoute } from "@/lib/routes/is-active-route";

describe("isActiveRoute", () => {
  it("is active on the Route's exact page", () => {
    expect(isActiveRoute("/what", "/what")).toBe(true);
  });

  it("is active on a sub-path of the Route", () => {
    expect(isActiveRoute("/what", "/what/predi-gg")).toBe(true);
    expect(isActiveRoute("/what", "/what/")).toBe(true);
  });

  it("is not active on a path that only starts with the same letters", () => {
    expect(isActiveRoute("/what", "/whatever")).toBe(false);
  });

  it("is not active on another Route's page", () => {
    expect(isActiveRoute("/what", "/how")).toBe(false);
  });

  it("is active on the root only for the root Route", () => {
    expect(isActiveRoute("/", "/")).toBe(true);
    expect(isActiveRoute("/what", "/")).toBe(false);
  });

  it("keeps the root Route inactive on every other page", () => {
    expect(isActiveRoute("/", "/what")).toBe(false);
    expect(isActiveRoute("/", "/what/predi-gg")).toBe(false);
  });
});
