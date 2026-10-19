import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes";

const LOCALE_APP = join(process.cwd(), "app", "[locale]");

/** The 404 page `proxy.ts` rewrites unknown paths to: not a Route. */
const NOT_FOUND_PAGE = "/page-not-found";

/** The path of every public page, without its Locale prefix. */
const publicPagePaths = (): string[] =>
  readdirSync(LOCALE_APP, { recursive: true, encoding: "utf8" })
    .filter((file) => file.split(sep).at(-1) === "page.tsx")
    .map((file) => {
      const folder = relative(".", join(file, "..")).split(sep).join("/");
      return folder === "" ? "/" : `/${folder}`;
    })
    .filter((path) => path !== NOT_FOUND_PAGE);

describe("the Routes list", () => {
  it("has an entry for every public page, or proxy.ts serves the page as a 404", () => {
    const routed = new Set<string>(
      Object.values(ROUTES).map((route) => route.path),
    );

    const unrouted = publicPagePaths().filter((path) => !routed.has(path));

    expect(unrouted).toEqual([]);
  });

  it("points every Route at an existing page", () => {
    const pages = new Set(publicPagePaths());

    const pageless = Object.values(ROUTES)
      .map((route) => route.path)
      .filter((path) => !pages.has(path));

    expect(pageless).toEqual([]);
  });
});
