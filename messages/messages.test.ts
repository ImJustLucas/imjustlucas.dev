import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes";
import { routing } from "@/i18n/routing";

import en from "./en.json";
import fr from "./fr.json";

const dictionaries: Record<string, unknown> = { en, fr };

/** Every message of a dictionary, as `[dotted.key, text]` pairs. */
function messagesOf(node: unknown, prefix = ""): [string, unknown][] {
  if (typeof node !== "object" || node === null) return [[prefix, node]];
  return Object.entries(node).flatMap(([key, child]) =>
    messagesOf(child, prefix ? `${prefix}.${key}` : key),
  );
}

const keysOf = (dictionary: unknown) =>
  messagesOf(dictionary)
    .map(([key]) => key)
    .sort();

describe("message dictionaries", () => {
  it("exist for every Locale", () => {
    expect(Object.keys(dictionaries).sort()).toEqual(
      [...routing.locales].sort(),
    );
  });

  it.each(routing.locales)("%s has exactly the English keys", (locale) => {
    expect(keysOf(dictionaries[locale])).toEqual(keysOf(en));
  });

  it.each(routing.locales)("%s has no empty message", (locale) => {
    const empty = messagesOf(dictionaries[locale]).filter(
      ([, text]) => typeof text !== "string" || text.trim() === "",
    );
    expect(empty).toEqual([]);
  });

  it.each(Object.values(ROUTES))(
    "hold a menu label, title and description for the Route $path",
    (route) => {
      for (const locale of routing.locales) {
        expect(
          keysOf((dictionaries[locale] as typeof en).Routes[route.messageKey]),
        ).toEqual(["description", "label", "title"]);
      }
    },
  );
});
