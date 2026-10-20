import { Effect } from "effect";

import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  imageUpload,
  openEditor,
  saveContent,
  type Saved,
  type Upload,
} from "@/lib/admin/admin-action";
import { achievementArt } from "@/lib/admin/uploaded-image";
import type { Achievement, LocalizedText, Rarity } from "@/lib/content/schema";

/**
 * Admin actions on Achievements. Achievements have no identifier: they are
 * addressed by their position in the stored document, which is also their
 * public order.
 */

/** An Achievement as the Owner types it (unvalidated). */
type AchievementFields = {
  readonly name: LocalizedText;
  readonly description: LocalizedText;
  /** As typed, e.g. `2025`. */
  readonly year: string;
  /** One of the Rarities; anything else is a field error. */
  readonly rarity: string;
  /** A page of the site (e.g. `/mdf-2025`) or an http(s) URL. */
  readonly link: string;
  /** New art, uploaded: committed with the Achievement. */
  readonly art?: Upload;
};

/**
 * The art a save gives the Achievement: the uploaded one, committed
 * alongside (or a field error), else the one it had.
 */
const upload = (input: AchievementFields, current: string | undefined) =>
  imageUpload({
    upload: input.art,
    current,
    field: "art",
    store: (bytes) => achievementArt(input.name.en, bytes),
  });

/**
 * The Achievement entry the fields describe, keys in document order. Without
 * `art` (a new Achievement with no upload), the schema reports it missing.
 */
const achievement = (input: AchievementFields, art: string | undefined) =>
  ({
    name: { en: input.name.en, fr: input.name.fr },
    description: { en: input.description.en, fr: input.description.fr },
    // Empty or not a number: a field error, like any year out of range.
    year: input.year === "" ? Number.NaN : Number(input.year),
    // Typed as a Rarity; `saveContent` validates it like every field.
    rarity: input.rarity as Rarity,
    link: input.link,
    ...(art !== undefined && { art }),
  }) as Achievement;

const achievementGone = gone("Cet Achievement");

export const createAchievement = (
  input: Saved & AchievementFields,
): AdminAction =>
  saveContent(input.revision, (content) =>
    Effect.map(upload(input, undefined), ({ image, ...uploaded }) => ({
      kind: "edited",
      message: commitMessage(`add Achievement '${input.name.en}'`),
      documents: documents(content, {
        achievements: [...content.achievements, achievement(input, image)],
      }),
      entry: ["achievements", content.achievements.length],
      ...uploaded,
    })),
  );

export const updateAchievement = (
  input: Saved & AchievementFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const existing = content.achievements[input.index];
    if (!existing) return achievementGone;
    return Effect.map(
      upload(input, existing.art),
      ({ image, ...uploaded }) => ({
        kind: "edited",
        message: commitMessage(`update Achievement '${input.name.en}'`),
        documents: documents(content, {
          achievements: content.achievements.map((entry, i) =>
            i === input.index ? achievement(input, image) : entry,
          ),
        }),
        entry: ["achievements", input.index],
        ...uploaded,
      }),
    );
  });

export const deleteAchievement = (
  input: Saved & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const existing = content.achievements[input.index];
    if (!existing) return achievementGone;
    return {
      kind: "edited",
      message: commitMessage(`delete Achievement '${existing.name.en}'`),
      documents: documents(content, {
        achievements: content.achievements.filter(
          (entry) => entry !== existing,
        ),
      }),
    };
  });

/**
 * What the Achievements editor shows: the Achievements in stored order, their
 * public order.
 */
export const openAchievementsEditor = openEditor((content) => ({
  achievements: content.achievements,
}));
