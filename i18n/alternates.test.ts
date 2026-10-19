import { describe, expect, it } from "vitest";

import { localeAlternates } from "@/i18n/alternates";

describe("localeAlternates", () => {
  it("declares the page in every Locale, English being the default", () => {
    expect(localeAlternates("/what", "fr")).toEqual({
      canonical: "/fr/what",
      languages: {
        en: "/en/what",
        fr: "/fr/what",
        "x-default": "/en/what",
      },
    });
  });

  it("uses the current Locale as the canonical URL", () => {
    expect(localeAlternates("/what", "en").canonical).toBe("/en/what");
  });

  it("maps the root Route to the bare Locale prefix", () => {
    expect(localeAlternates("/", "fr")).toEqual({
      canonical: "/fr",
      languages: { en: "/en", fr: "/fr", "x-default": "/en" },
    });
  });
});
