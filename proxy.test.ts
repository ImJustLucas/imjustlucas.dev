import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";

import { describe, expect, it } from "vitest";

import proxy, { config } from "./proxy";

function visit(path: string, acceptLanguage?: string) {
  const headers = new Headers();
  if (acceptLanguage) headers.set("accept-language", acceptLanguage);
  return proxy(new NextRequest(`https://imjustlucas.dev${path}`, { headers }));
}

describe("root address", () => {
  it("sends a French browser to the French Locale", async () => {
    const response = await visit("/", "fr-FR,fr;q=0.9,en;q=0.8");
    expect(response.headers.get("location")).toBe("https://imjustlucas.dev/fr");
  });

  it("sends an English browser to the English Locale", async () => {
    const response = await visit("/", "en-US,en;q=0.9");
    expect(response.headers.get("location")).toBe("https://imjustlucas.dev/en");
  });

  it("falls back to English for any other browser language", async () => {
    const response = await visit("/", "de-DE,de;q=0.9");
    expect(response.headers.get("location")).toBe("https://imjustlucas.dev/en");
  });

  it("falls back to English when the browser sends no language", async () => {
    const response = await visit("/");
    expect(response.headers.get("location")).toBe("https://imjustlucas.dev/en");
  });

  it("is a temporary redirect, as it depends on the browser", async () => {
    const response = await visit("/", "fr");
    expect(response.status).toBe(307);
  });
});

describe("Locale-prefixed pages", () => {
  it("are served as they are", async () => {
    const response = await visit("/fr/what", "en");
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("Locale routing scope", () => {
  const isLocaleRouted = (url: string) =>
    unstable_doesMiddlewareMatch({ config, url });

  it("covers the root address and public pages", () => {
    expect(isLocaleRouted("/")).toBe(true);
    expect(isLocaleRouted("/en/what")).toBe(true);
    expect(isLocaleRouted("/fr")).toBe(true);
  });

  it("leaves the Admin out", () => {
    expect(isLocaleRouted("/admin")).toBe(false);
    expect(isLocaleRouted("/admin/projects")).toBe(false);
  });

  it("leaves API routes, Next internals and files out", () => {
    expect(isLocaleRouted("/api/auth/callback")).toBe(false);
    expect(isLocaleRouted("/_next/static/chunk.js")).toBe(false);
    expect(isLocaleRouted("/pdf/cv-lucas.pdf")).toBe(false);
  });
});
