import { describe, expect, it } from "vitest";

import profile from "@/content/profile.json";

import {
  cvStructuredData,
  homeStructuredData,
  jsonLdScript,
} from "./structured-data";

const data = (locale: "en" | "fr") =>
  homeStructuredData({
    locale,
    profile,
    jobTitle: "Fullstack developer",
    description: "A description",
  });

const node = (locale: "en" | "fr", type: string) => {
  const found = data(locale)["@graph"].find((item) => item["@type"] === type);
  if (!found) throw new Error(`No ${type}`);
  return found as Record<string, unknown>;
};

describe("homeStructuredData", () => {
  it("names the Owner by his real name, with his handle as alternate", () => {
    const person = node("en", "Person");
    expect(person.name).toBe("Lucas Bellier");
    expect(person.alternateName).toBe("ImJustLucas");
  });

  it("ties the Owner to every social profile of the Profile", () => {
    expect(node("en", "Person").sameAs).toEqual(Object.values(profile.links));
  });

  it("points at the home page in the Locale, on the served host", () => {
    expect(node("fr", "Person").url).toBe("https://www.imjustlucas.dev/fr");
    expect(node("fr", "WebSite").url).toBe("https://www.imjustlucas.dev/fr");
    expect(node("fr", "WebSite").inLanguage).toBe("fr");
  });

  it("makes the Owner the site's author", () => {
    const person = node("en", "Person");
    expect(node("en", "WebSite").author).toEqual({ "@id": person["@id"] });
  });
});

describe("cvStructuredData", () => {
  const cv = cvStructuredData({
    locale: "fr",
    profile,
    jobTitle: "Développeur fullstack",
    description: "Une description",
    worksFor: [{ name: "Predi.GG", url: "https://predi.gg" }],
    alumniOf: ["IIM"],
    knowsAbout: ["TypeScript"],
    knowsLanguage: ["fr", "en"],
  });

  it("is the recruiter mode's page in the Locale, on the served host", () => {
    expect(cv["@type"]).toBe("ProfilePage");
    expect(cv.url).toBe("https://www.imjustlucas.dev/fr/cv");
  });

  it("is about the same Person as the home page", () => {
    expect(cv.mainEntity["@id"]).toBe(node("fr", "Person")["@id"]);
    expect(cv.mainEntity.name).toBe("Lucas Bellier");
  });

  it("says where he works, where he studied, what he knows", () => {
    expect(cv.mainEntity.worksFor).toEqual([
      { "@type": "Organization", name: "Predi.GG", url: "https://predi.gg" },
    ]);
    expect(cv.mainEntity.alumniOf).toEqual([
      { "@type": "EducationalOrganization", name: "IIM" },
    ]);
    expect(cv.mainEntity.knowsAbout).toEqual(["TypeScript"]);
    expect(cv.mainEntity.knowsLanguage).toEqual(["fr", "en"]);
  });
});

describe("jsonLdScript", () => {
  it("cannot close its script element", () => {
    const text = jsonLdScript({ name: "</script><script>alert(1)</script>" });
    expect(text).not.toContain("</script>");
    expect(JSON.parse(text)).toEqual({
      name: "</script><script>alert(1)</script>",
    });
  });
});
