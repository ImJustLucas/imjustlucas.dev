import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("keeps a type role beside a text colour", () => {
    expect(cn("text-tag", "text-ink")).toBe("text-tag text-ink");
    expect(cn("text-label text-ink-muted")).toBe("text-label text-ink-muted");
  });

  it("lets a later font size replace a type role", () => {
    expect(cn("text-title", "text-[1.375rem]")).toBe("text-[1.375rem]");
    expect(cn("text-tag", "text-label")).toBe("text-label");
  });
});
