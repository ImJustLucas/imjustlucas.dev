import { hasRemoteMatch } from "next/dist/shared/lib/match-remote-pattern";
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";

import { describe, expect, it } from "vitest";

import nextConfig from "./next.config";

const visit = (path: string) =>
  unstable_getResponseFromNextConfig({
    url: `https://imjustlucas.dev${path}`,
    nextConfig,
  });

describe("legacy unprefixed URLs", () => {
  it.each([
    ["/what", "/en/what"],
    ["/how", "/en/how"],
    ["/experiences", "/en/experiences"],
    ["/videos", "/en/videos"],
    ["/contact", "/en/contact"],
    ["/mdf-2025", "/en/mdf-2025"],
  ])("redirect %s permanently to %s", async (legacy, english) => {
    const response = await visit(legacy);
    expect(response.status).toBe(308);
    expect(getRedirectUrl(response)).toBe(`https://imjustlucas.dev${english}`);
  });

  it("keep their sub-path", async () => {
    const response = await visit("/what/predi-gg");
    expect(getRedirectUrl(response)).toBe(
      "https://imjustlucas.dev/en/what/predi-gg",
    );
  });
});

describe("remote images", () => {
  const allowed = (url: string) =>
    hasRemoteMatch([], nextConfig.images?.remotePatterns ?? [], new URL(url));

  it.each([
    "https://i.ytimg.com/vi/y02_MMDQw5g/hqdefault.jpg",
    "https://i1.ytimg.com/vi/xzs5jgJWWVU/hqdefault.jpg",
    "https://i2.ytimg.com/vi/y02_MMDQw5g/hqdefault.jpg",
    "https://i3.ytimg.com/vi/b4s_RjjXRzc/hqdefault.jpg",
  ])("allow the YouTube thumbnail %s", (url) => {
    expect(allowed(url)).toBe(true);
  });

  it("allow nothing else on the YouTube image hosts", () => {
    expect(allowed("https://i.ytimg.com/an/channel-art.jpg")).toBe(false);
    expect(allowed("http://i.ytimg.com/vi/y02_MMDQw5g/hqdefault.jpg")).toBe(
      false,
    );
  });
});

describe("URLs left to Locale routing", () => {
  it.each(["/", "/en/what", "/fr/contact", "/pdf/cv-lucas.pdf"])(
    "%s is not redirected by the config",
    async (path) => {
      const response = await visit(path);
      expect(getRedirectUrl(response)).toBeNull();
    },
  );
});
