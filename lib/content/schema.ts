import { Schema } from "effect";

/** A translation: a non-empty string, reported as missing otherwise. */
const Translation = Schema.String.check(
  Schema.isNonEmpty({ message: "Missing translation" }),
).pipe(Schema.annotateKey({ messageMissingKey: "Missing translation" }));

/** Descriptive text, in every Locale. */
export const LocalizedText = Schema.Struct({
  en: Translation,
  fr: Translation,
});
export type LocalizedText = typeof LocalizedText.Type;

/** Stable identifier of a Tech, referenced by Projects and Tech categories. */
export const TechId = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: "Expected a lowercase kebab-case identifier",
  }),
).pipe(Schema.brand("TechId"));
export type TechId = typeof TechId.Type;

/** Display colour, as a `#rrggbb` hex string. */
export const Color = Schema.String.check(
  Schema.isPattern(/^#[0-9a-fA-F]{6}$/, {
    message: "Expected a #rrggbb colour",
  }),
);

export const Tech = Schema.Struct({
  id: TechId,
  name: Schema.NonEmptyString,
  color: Color,
});
export type Tech = typeof Tech.Type;

export const TechCategory = Schema.Struct({
  name: LocalizedText,
  description: LocalizedText,
  /** Techs in display order. */
  techs: Schema.Array(TechId),
});
export type TechCategory = typeof TechCategory.Type;

/**
 * Every content document, keyed by kind, with the rules that span documents:
 * a Tech is defined once, and every referenced Tech exists.
 */
export const Content = Schema.Struct({
  techs: Schema.Array(Tech),
  techCategories: Schema.Array(TechCategory),
}).check(
  Schema.makeFilter((content) => {
    const seen = new Set<string>();
    const duplicates = content.techs.flatMap((tech, i) => {
      if (!seen.has(tech.id)) {
        seen.add(tech.id);
        return [];
      }
      return [
        {
          path: ["techs", i, "id"],
          issue: `Tech identifier defined more than once: ${tech.id}`,
        },
      ];
    });
    const unknown = content.techCategories.flatMap((category, i) =>
      category.techs.flatMap((id, j) =>
        seen.has(id)
          ? []
          : [
              {
                path: ["techCategories", i, "techs", j],
                issue: `Unknown Tech identifier: ${id}`,
              },
            ],
      ),
    );
    return [...duplicates, ...unknown];
  }),
);
export type Content = typeof Content.Type;

/** Where each content document lives in the content repository. */
export const DOCUMENT_PATHS: { readonly [K in keyof Content]: string } = {
  techs: "content/techs.json",
  techCategories: "content/tech-categories.json",
};
