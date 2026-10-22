import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import type { SignedInIdentity } from "@/lib/admin/owner-access";
import {
  createPatch,
  deletePatch,
  openPatchNotesEditor,
  updatePatch,
} from "@/lib/admin/patch-notes";
import { makeInMemoryRepository } from "@/lib/content/repository-in-memory";
import { testProfile } from "@/lib/content/test-profile";

import { describe, expect, it } from "@effect/vitest";

const OWNER_GITHUB_ID = "1234567";
const owner: SignedInIdentity = {
  githubId: 1234567,
  login: "ImJustLucas",
  accessToken: "gho_owner",
};

const text = (en: string, fr: string) => ({ en, fr });

const playerProfile = {
  version: "2.0",
  date: "2026-10-20",
  title: text("The Player Profile", "Le Player Profile"),
  entries: [{ tag: "new", text: text("a new home", "un nouvel accueil") }],
  link: "https://github.com/ImJustLucas/imjustlucas.dev/pull/27",
};
const arcade = {
  version: "2.1",
  date: "2026-10-21",
  title: text("The Arcade", "L'Arcade"),
  entries: [{ tag: "new", text: text("Ollie", "Ollie") }],
};
const legacy = {
  version: "1.0",
  date: "2024-10-30",
  title: text("The first portfolio", "Le premier portfolio"),
  entries: [{ tag: "new", text: text("the site", "le site") }],
};

const PATCH_NOTES = "content/patch-notes.json";

/**
 * The Admin over an in-memory content repository holding these Patches,
 * with `identity` signed in. `commits` lists what the actions committed.
 */
const admin = (
  identity: SignedInIdentity | undefined,
  patchNotes: ReadonlyArray<unknown> = [playerProfile, legacy, arcade],
) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      "content/techs.json": "[]",
      "content/projects.json": "[]",
      "content/experiences.json": "[]",
      "content/achievements.json": "[]",
      "content/hobbies.json": "[]",
      [PATCH_NOTES]: JSON.stringify(patchNotes),
      "content/profile.json": JSON.stringify(testProfile),
    });
    const access = AdminAccess.layer({
      identities: { current: async () => identity },
      ownerGithubId: OWNER_GITHUB_ID,
      repositoryFor: (signedIn) => {
        // Saves commit with the Owner's own GitHub token.
        expect(signedIn.accessToken).toBe(owner.accessToken);
        return memory.repository;
      },
    });
    return {
      run: <A, E>(action: Effect.Effect<A, E, AdminAccess>) =>
        Effect.provide(action, access),
      commits: memory.commits,
      patchNotes: Effect.map(memory.repository.read(PATCH_NOTES), (text) =>
        JSON.parse(text),
      ),
    };
  });

/** A Patch as the Owner fills the form. */
const surf = {
  version: "2.2",
  date: "2026-10-22",
  title: text("Surf's up", "Surf"),
  entries: [
    { tag: "new", text: text("a surf cabinet", "une borne de surf") },
    { tag: "fixed", text: text("the jump", "le saut") },
  ],
  link: "",
};

describe("patch notes actions", () => {
  it.effect("adding a Patch appends it, without an empty link", () =>
    Effect.gen(function* () {
      const { run, commits, patchNotes } = yield* admin(owner);

      const result = yield* run(createPatch({ revision: "memory-0", ...surf }));

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe("📝 Admin: add Patch 2.2");
      expect(made[0].changes.map((change) => change.path)).toEqual([
        PATCH_NOTES,
      ]);
      expect(yield* patchNotes).toEqual([
        playerProfile,
        legacy,
        arcade,
        {
          version: surf.version,
          date: surf.date,
          title: surf.title,
          entries: surf.entries,
        },
      ]);
    }),
  );

  it.effect(
    "a bad version, date, tag or link, or a missing translation, is a field error",
    () =>
      Effect.gen(function* () {
        const { run, commits } = yield* admin(owner);

        const result = yield* run(
          createPatch({
            revision: "memory-0",
            version: "v2",
            date: "",
            title: text("Surf", ""),
            entries: [
              { tag: "nerfed", text: text("a", "b") },
              { tag: "fixed", text: text("", "le saut") },
            ],
            link: "github.com/x",
          }),
        );

        expect(result).toEqual({
          kind: "invalid",
          fieldErrors: {
            version: "Version attendue, par exemple 2.4 ou 2.4.1",
            date: "Date attendue (AAAA-MM-JJ)",
            "title.fr": "Traduction manquante",
            "entries.0.tag": "Étiquette inconnue",
            "entries.1.text.en": "Traduction manquante",
            link: "Lien attendu, commençant par http:// ou https://",
          },
        });
        expect(yield* commits).toEqual([]);
      }),
  );

  it.effect("a Patch needs a line and a version of its own", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      expect(
        yield* run(createPatch({ revision: "memory-0", ...surf, entries: [] })),
      ).toEqual({
        kind: "invalid",
        fieldErrors: { entries: "Au moins une ligne" },
      });
      expect(
        yield* run(
          createPatch({ revision: "memory-0", ...surf, version: "2.1" }),
        ),
      ).toEqual({
        kind: "invalid",
        fieldErrors: { version: "Un Patch porte déjà cette version : 2.1" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("editing a Patch replaces it in place", () =>
    Effect.gen(function* () {
      const { run, commits, patchNotes } = yield* admin(owner);

      const result = yield* run(
        updatePatch({
          revision: "memory-0",
          index: 2,
          ...surf,
          version: "2.1",
          link: "https://github.com/ImJustLucas/imjustlucas.dev/pull/40",
        }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe("📝 Admin: update Patch 2.1");
      expect((yield* patchNotes)[2]).toEqual({
        ...surf,
        version: "2.1",
        link: "https://github.com/ImJustLucas/imjustlucas.dev/pull/40",
      });
    }),
  );

  it.effect("deleting a Patch removes it", () =>
    Effect.gen(function* () {
      const { run, commits, patchNotes } = yield* admin(owner);

      const result = yield* run(
        deletePatch({ revision: "memory-0", index: 0 }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe("📝 Admin: delete Patch 2.0");
      expect(yield* patchNotes).toEqual([legacy, arcade]);
    }),
  );

  it.effect("a Patch that no longer exists is refused", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      for (const action of [
        updatePatch({ revision: "memory-0", index: 3, ...surf }),
        deletePatch({ revision: "memory-0", index: 3 }),
      ]) {
        expect(yield* run(action)).toEqual({
          kind: "refused",
          reason: "Ce Patch n'existe plus. Recharge la page.",
        });
      }
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("anyone but the Owner is refused, and nothing is committed", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(undefined);

      const result = yield* run(createPatch({ revision: "memory-0", ...surf }));

      expect(result).toEqual({ kind: "not-owner" });
      expect(yield* commits).toEqual([]);
    }),
  );
});

describe("the patch notes editor", () => {
  it.effect(
    "opens on the Patches newest first, with their stored positions and the next version",
    () =>
      Effect.gen(function* () {
        const { run } = yield* admin(owner);

        expect(yield* run(openPatchNotesEditor)).toEqual({
          kind: "owner",
          revision: "memory-0",
          patches: [
            { index: 2, entry: arcade },
            { index: 0, entry: playerProfile },
            { index: 1, entry: legacy },
          ],
          nextVersion: "2.2",
        });
      }),
  );

  it.effect("suggests 1.0 when there is no Patch yet", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(owner, []);

      const editor = yield* run(openPatchNotesEditor);

      expect(editor).toMatchObject({ patches: [], nextVersion: "1.0" });
    }),
  );
});
