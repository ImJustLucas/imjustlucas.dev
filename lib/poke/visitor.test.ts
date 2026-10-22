import { describe, expect, it } from "vitest";

import { clientAddress, visitorKey } from "./visitor";

describe("visitorKey", () => {
  it("is the same for the same address and secret", () => {
    expect(visitorKey("203.0.113.7", "s3cret")).toBe(
      visitorKey("203.0.113.7", "s3cret"),
    );
  });

  it("never contains the address", () => {
    const key = visitorKey("203.0.113.7", "s3cret");
    expect(key).not.toContain("203");
    expect(key).toMatch(/^[\w-]{22}$/);
  });

  it("tells addresses apart, and changes with the secret", () => {
    expect(visitorKey("203.0.113.7", "s3cret")).not.toBe(
      visitorKey("203.0.113.8", "s3cret"),
    );
    expect(visitorKey("203.0.113.7", "s3cret")).not.toBe(
      visitorKey("203.0.113.7", "other"),
    );
  });
});

describe("clientAddress", () => {
  it("takes the first address the proxy reports", () => {
    expect(clientAddress("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7");
  });

  it("falls back when there is none", () => {
    expect(clientAddress(null)).toBe("local");
    expect(clientAddress(" ")).toBe("local");
  });
});
