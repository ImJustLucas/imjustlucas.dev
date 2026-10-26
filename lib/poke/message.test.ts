import { describe, expect, it } from "vitest";

import {
  countryFlag,
  knownPaths,
  pokeMessage,
  pokePage,
  pokePlace,
} from "./message";

const KNOWN = knownPaths(["sweetch"]);

describe("pokePage", () => {
  it("keeps a Route or a Project page, with its Locale", () => {
    expect(pokePage("/fr/arcade", KNOWN)).toEqual({
      page: "/fr/arcade",
      locale: "fr",
    });
    expect(pokePage("/en/what/sweetch", KNOWN)).toEqual({
      page: "/en/what/sweetch",
      locale: "en",
    });
  });

  it("reads the home page with or without its slash", () => {
    expect(pokePage("/en", KNOWN)).toEqual({ page: "/en", locale: "en" });
    expect(pokePage("/en/", KNOWN)).toEqual({ page: "/en", locale: "en" });
    expect(pokePage("/fr/contact/", KNOWN)?.page).toBe("/fr/contact");
  });

  it("refuses anything the site does not serve", () => {
    expect(pokePage("/fr/hire-me-now", KNOWN)).toBeNull();
    expect(pokePage("/de/arcade", KNOWN)).toBeNull();
    expect(pokePage("/arcade", KNOWN)).toBeNull();
    expect(pokePage("/en/what/not-a-project", KNOWN)).toBeNull();
    expect(pokePage("/en/arcade?x=hello", KNOWN)).toBeNull();
    expect(pokePage("https://evil.example/en", KNOWN)).toBeNull();
    expect(pokePage(42, KNOWN)).toBeNull();
    expect(pokePage(`/en/${"a".repeat(300)}`, KNOWN)).toBeNull();
  });
});

describe("pokePlace", () => {
  it("decodes Vercel's city and keeps the country", () => {
    expect(pokePlace("S%C3%A3o%20Paulo", "BR")).toEqual({
      city: "São Paulo",
      country: "BR",
    });
  });

  it("keeps whichever part is usable", () => {
    expect(pokePlace(null, "FR")).toEqual({ country: "FR" });
    expect(pokePlace("Lyon", null)).toEqual({ city: "Lyon" });
    expect(pokePlace(null, null)).toBeNull();
  });

  it("drops a city that is not a name, and an unknown country", () => {
    expect(pokePlace("%5Bclick%5D(https%3A%2F%2Fx.y)", "fr")).toBeNull();
    expect(pokePlace("%E0%A4%A", "XX")).toBeNull();
    expect(pokePlace("**Paris**", "FR")).toEqual({ country: "FR" });
  });
});

describe("countryFlag", () => {
  it("draws the flag from the two letters", () => {
    expect(countryFlag("FR")).toBe("🇫🇷");
    expect(countryFlag("jp")).toBe("🇯🇵");
  });
});

describe("pokeMessage", () => {
  const base = {
    emote: "surf" as const,
    name: null,
    page: "/fr/arcade",
    locale: "fr" as const,
    waveBackUrl: "https://www.imjustlucas.dev/admin/pokes#poke-1",
    at: Date.UTC(2026, 9, 22, 12),
  };

  it("tells the emote, the page, the language and the place", () => {
    const [embed] = pokeMessage({
      ...base,
      place: { city: "Lyon", country: "FR" },
    }).embeds;
    expect(embed.title).toBe("🏄 Quelqu'un te fait coucou !");
    expect(embed.description).toBe(
      [
        "Depuis **/fr/arcade**, en français.",
        "📍 Lyon, FR 🇫🇷",
        "",
        "[Lui faire coucou en retour](https://www.imjustlucas.dev/admin/pokes#poke-1)",
      ].join("\n"),
    );
    expect(embed.timestamp).toBe("2026-10-22T12:00:00.000Z");
  });

  it("names the visitor when they gave their first name", () => {
    const [embed] = pokeMessage({ ...base, name: "Léa", place: null }).embeds;
    expect(embed.title).toBe("🏄 Léa te fait coucou !");
  });

  it("leaves the place out when Vercel gave none", () => {
    const [embed] = pokeMessage({ ...base, place: null }).embeds;
    expect(embed.description).not.toContain("📍");
  });

  it("never lets a mention ping anyone", () => {
    expect(pokeMessage({ ...base, place: null }).allowed_mentions).toEqual({
      parse: [],
    });
  });
});
