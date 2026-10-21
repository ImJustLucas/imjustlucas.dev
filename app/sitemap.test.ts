import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes";
import projects from "@/content/projects.json";

import robots from "./robots";
import sitemap from "./sitemap";

describe("the sitemap", async () => {
  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);

  it("lists every Route and every Project's page in every Locale, on the served host", () => {
    expect(entries).toHaveLength(
      (Object.keys(ROUTES).length + projects.length) * 2,
    );
    expect(urls).toContain("https://www.imjustlucas.dev/fr/what/predi-gg");
    expect(urls).toContain("https://www.imjustlucas.dev/en");
    expect(urls).toContain("https://www.imjustlucas.dev/fr/what");
  });

  it("never lists the Admin", () => {
    expect(urls.filter((url) => url.includes("/admin"))).toEqual([]);
  });

  it("gives each URL its alternates in every Locale", () => {
    const what = entries.find(
      (entry) => entry.url === "https://www.imjustlucas.dev/fr/what",
    );
    expect(what?.alternates?.languages).toEqual({
      en: "https://www.imjustlucas.dev/en/what",
      fr: "https://www.imjustlucas.dev/fr/what",
      "x-default": "https://www.imjustlucas.dev/en/what",
    });
  });
});

describe("robots.txt", () => {
  it("keeps crawlers out of the Admin and points to the sitemap", () => {
    const rules = robots();
    expect(rules.rules).toMatchObject({ disallow: ["/admin", "/api"] });
    expect(rules.sitemap).toBe("https://www.imjustlucas.dev/sitemap.xml");
  });
});
