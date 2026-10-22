import {
  type AdminAction,
  commitMessage,
  documents,
  gone,
  openEditor,
  saveContent,
  type Saved,
} from "@/lib/admin/admin-action";
import { byVersionNewestFirst, nextVersion } from "@/lib/content/patch-version";
import type { LocalizedText, Patch, PatchTag } from "@/lib/content/schema";

/**
 * Admin actions on the patch notes. A Patch is addressed by its position in
 * the stored document; the site and the editor order them by version, so
 * a new one is simply added at the end.
 */

/** A Patch as the Owner types it (unvalidated). */
type PatchFields = {
  /** As typed, e.g. `2.4`. */
  readonly version: string;
  /** `YYYY-MM-DD`, from a date input. */
  readonly date: string;
  readonly title: LocalizedText;
  /** Its lines in the order typed; a tag outside the three is a field error. */
  readonly entries: ReadonlyArray<{
    readonly tag: string;
    readonly text: LocalizedText;
  }>;
  /** Empty: no link. */
  readonly link: string;
};

/** The Patch entry the fields describe, keys in document order. */
const patch = (input: PatchFields): Patch => ({
  version: input.version,
  date: input.date,
  title: { en: input.title.en, fr: input.title.fr },
  entries: input.entries.map((entry) => ({
    // Typed as a tag; `saveContent` validates it like every field.
    tag: entry.tag as PatchTag,
    text: { en: entry.text.en, fr: entry.text.fr },
  })),
  ...(input.link !== "" && { link: input.link }),
});

const patchGone = gone("Ce Patch");

export const createPatch = (input: Saved & PatchFields): AdminAction =>
  saveContent(input.revision, (content) => ({
    kind: "edited",
    message: commitMessage(`add Patch ${input.version}`),
    documents: documents(content, {
      patchNotes: [...content.patchNotes, patch(input)],
    }),
    entry: ["patchNotes", content.patchNotes.length],
  }));

export const updatePatch = (
  input: Saved & PatchFields & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    if (!content.patchNotes[input.index]) return patchGone;
    return {
      kind: "edited",
      message: commitMessage(`update Patch ${input.version}`),
      documents: documents(content, {
        patchNotes: content.patchNotes.map((stored, i) =>
          i === input.index ? patch(input) : stored,
        ),
      }),
      entry: ["patchNotes", input.index],
    };
  });

export const deletePatch = (
  input: Saved & { readonly index: number },
): AdminAction =>
  saveContent(input.revision, (content) => {
    const deleted = content.patchNotes[input.index];
    if (!deleted) return patchGone;
    return {
      kind: "edited",
      message: commitMessage(`delete Patch ${deleted.version}`),
      documents: documents(content, {
        patchNotes: content.patchNotes.filter((stored) => stored !== deleted),
      }),
    };
  });

/**
 * What the patch notes editor shows: the Patches by version, newest first
 * like the public page, each with its stored position, and the version a
 * new Patch most likely takes.
 */
export const openPatchNotesEditor = openEditor((content) => {
  const patches = content.patchNotes
    .map((entry, index) => ({ index, entry }))
    .sort((a, b) => byVersionNewestFirst(a.entry.version, b.entry.version));
  return { patches, nextVersion: nextVersion(patches[0]?.entry.version) };
});
