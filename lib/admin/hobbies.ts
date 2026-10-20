import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  openEditor,
  saveContent,
  type Saved,
} from "@/lib/admin/admin-action";
import type { HobbyPose, LocalizedText } from "@/lib/content/schema";

/**
 * Admin actions on Hobbies. Hobbies have no identifier: they are addressed
 * by their position in the stored document, which is also their public
 * order, so the Owner moves them up and down.
 */

/** A Hobby as the Owner types it (unvalidated). */
type HobbyFields = {
  readonly label: LocalizedText;
  /** One of the poses; anything else is a field error. */
  readonly pose: string;
};

const hobby = (input: HobbyFields) => ({
  label: { en: input.label.en, fr: input.label.fr },
  // Typed as a pose; `saveContent` validates it like every field.
  pose: input.pose as HobbyPose,
});

const hobbyGone = gone("Ce Hobby");

export const createHobby = (input: Saved & HobbyFields): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage(`add Hobby '${input.label.en}'`),
    documents: documents(content, {
      hobbies: [...content.hobbies, hobby(input)],
    }),
    entry: ["hobbies", content.hobbies.length],
  }));

export const updateHobby = (
  input: Saved & HobbyFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    if (!content.hobbies[input.index]) return hobbyGone;
    return {
      kind: "edited",
      message: commitMessage(`update Hobby '${input.label.en}'`),
      documents: documents(content, {
        hobbies: content.hobbies.map((stored, i) =>
          i === input.index ? hobby(input) : stored,
        ),
      }),
      entry: ["hobbies", input.index],
    };
  });

export const deleteHobby = (
  input: Saved & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const deleted = content.hobbies[input.index];
    if (!deleted) return hobbyGone;
    return {
      kind: "edited",
      message: commitMessage(`delete Hobby '${deleted.label.en}'`),
      documents: documents(content, {
        hobbies: content.hobbies.filter((stored) => stored !== deleted),
      }),
    };
  });

/**
 * Swaps the Hobby with its neighbour above (`up`) or below (`down`). The
 * first one moved up, or the last one down, stays where it is: nothing is
 * committed.
 */
export const moveHobby = (
  input: Saved & {
    readonly index: number;
    readonly direction: "up" | "down";
  },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const moved = content.hobbies[input.index];
    if (!moved) return hobbyGone;
    const target = input.index + (input.direction === "up" ? -1 : 1);
    const hobbies = [...content.hobbies];
    if (target >= 0 && target < hobbies.length)
      [hobbies[input.index], hobbies[target]] = [hobbies[target], moved];
    return {
      kind: "edited",
      message: commitMessage(
        `move Hobby '${moved.label.en}' ${input.direction}`,
      ),
      documents: documents(content, { hobbies }),
    };
  });

/**
 * What the Hobbies editor shows: the Hobbies in stored order, their public
 * order.
 */
export const openHobbiesEditor = openEditor((content) => ({
  hobbies: content.hobbies,
}));
