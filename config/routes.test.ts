import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { projectPath, ROUTES } from "@/config/routes";

const LOCALE_APP = join(process.cwd(), "app", "[locale]");

/** The 404 page `proxy.ts` rewrites unknown paths to: not a Route. */
const NOT_FOUND_PAGE = "/page-not-found";

/** The Project pages' folder: one page per Project slug. */
const PROJECT_PAGE = projectPath("[slug]");

/**
 * The path of every public page, without its Locale prefix. Pages of a
 * parallel route slot (`@modal`) are no URL of their own.
 */
const publicPagePaths = (): string[] =>
  readdirSync(LOCALE_APP, { recursive: true, encoding: "utf8" })
    .filter((file) => file.split(sep).at(-1) === "page.tsx")
    .map((file) => {
      const folder = relative(".", join(file, "..")).split(sep).join("/");
      return folder === "" ? "/" : `/${folder}`;
    })
    .filter((path) => path !== NOT_FOUND_PAGE && !path.includes("/@"));

describe("the Routes list", () => {
  it("has an entry for every public page, or proxy.ts serves the page as a 404", () => {
    const routed = new Set<string>(
      Object.values(ROUTES).map((route) => route.path),
    );

    const unrouted = publicPagePaths().filter(
      (path) => !routed.has(path) && path !== PROJECT_PAGE,
    );

    expect(unrouted).toEqual([]);
  });

  it("has the Project pages under the Projects Route", () => {
    expect(publicPagePaths()).toContain(PROJECT_PAGE);
  });

  it("points every Route at an existing page", () => {
    const pages = new Set(publicPagePaths());

    const pageless = Object.values(ROUTES)
      .map((route) => route.path)
      .filter((path) => !pages.has(path));

    expect(pageless).toEqual([]);
  });
});
