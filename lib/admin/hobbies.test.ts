import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import {
  createHobby,
  deleteHobby,
  moveHobby,
  openHobbiesEditor,
  updateHobby,
} from "@/lib/admin/hobbies";
import type { SignedInIdentity } from "@/lib/admin/owner-access";
import { makeInMemoryRepository } from "@/lib/content/repository-in-memory";
import { testProfile } from "@/lib/content/test-profile";

import { describe, expect, it } from "@effect/vitest";

const OWNER_GITHUB_ID = "1234567";
const owner: SignedInIdentity = {
  githubId: 1234567,
  login: "ImJustLucas",
  accessToken: "gho_owner",
};

const surf = { label: { en: "surf", fr: "surf" }, pose: "surf" };
const lol = { label: { en: "playing LoL", fr: "jouer à LoL" }, pose: "lol" };
const coffee = {
  label: { en: "a good coffee", fr: "un bon café" },
  pose: "coffee",
};

const HOBBIES = "content/hobbies.json";

/**
 * The Admin over an in-memory content repository holding these Hobbies,
 * with `identity` signed in. `commits` lists what the actions committed.
 */
const admin = (
  identity: SignedInIdentity | undefined,
  hobbies: ReadonlyArray<unknown> = [surf, lol, coffee],
) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      "content/techs.json": "[]",
      "content/projects.json": "[]",
      "content/experiences.json": "[]",
      "content/achievements.json": "[]",
      [HOBBIES]: JSON.stringify(hobbies),
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
      head: memory.repository.head,
      hobbies: Effect.map(memory.repository.read(HOBBIES), (text) =>
        JSON.parse(text),
      ),
    };
  });

const music = { label: { en: "music on", fr: "de la musique" }, pose: "music" };

describe("Admin actions on Hobbies", () => {
  it.effect("a valid new Hobby is published last, as one commit", () =>
    Effect.gen(function* () {
      const { run, commits, hobbies } = yield* admin(owner);

      const result = yield* run(
        createHobby({ revision: "memory-0", ...music }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe("📝 Admin: add Hobby 'music on'");
      expect(made[0].changes.map((change) => change.path)).toEqual([HOBBIES]);
      expect(yield* hobbies).toEqual([surf, lol, coffee, music]);
    }),
  );

  it.effect("an unknown pose or a missing translation is a field error", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createHobby({
          revision: "memory-0",
          label: { en: "", fr: "échecs" },
          pose: "chess",
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          "label.en": "Traduction manquante",
          pose: "Pose inconnue",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("editing a Hobby replaces it in place", () =>
    Effect.gen(function* () {
      const { run, commits, hobbies } = yield* admin(owner);
      const edited = { label: { en: "League", fr: "LoL" }, pose: "lol" };

      const result = yield* run(
        updateHobby({ revision: "memory-0", index: 1, ...edited }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: update Hobby 'League'",
      );
      expect(yield* hobbies).toEqual([surf, edited, coffee]);
    }),
  );

  it.effect("deleting a Hobby removes it", () =>
    Effect.gen(function* () {
      const { run, commits, hobbies } = yield* admin(owner);

      const result = yield* run(
        deleteHobby({ revision: "memory-0", index: 0 }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe("📝 Admin: delete Hobby 'surf'");
      expect(yield* hobbies).toEqual([lol, coffee]);
    }),
  );

  it.effect("moving a Hobby swaps it with its neighbour", () =>
    Effect.gen(function* () {
      const { run, commits, hobbies } = yield* admin(owner);

      yield* run(
        moveHobby({ revision: "memory-0", index: 2, direction: "up" }),
      );
      expect(yield* hobbies).toEqual([surf, coffee, lol]);
      yield* run(
        moveHobby({ revision: "memory-1", index: 0, direction: "down" }),
      );
      expect(yield* hobbies).toEqual([coffee, surf, lol]);

      expect((yield* commits).map((commit) => commit.message)).toEqual([
        "📝 Admin: move Hobby 'a good coffee' up",
        "📝 Admin: move Hobby 'surf' down",
      ]);
    }),
  );

  it.effect(
    "moving the first Hobby up or the last one down commits nothing",
    () =>
      Effect.gen(function* () {
        const { run, commits, hobbies } = yield* admin(owner);

        for (const move of [
          moveHobby({ revision: "memory-0", index: 0, direction: "up" }),
          moveHobby({ revision: "memory-0", index: 2, direction: "down" }),
        ])
          expect(yield* run(move)).toEqual({
            kind: "saved",
            revision: "memory-0",
          });

        expect(yield* commits).toEqual([]);
        expect(yield* hobbies).toEqual([surf, lol, coffee]);
      }),
  );

  it.effect("a Hobby that no longer exists is refused", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      for (const action of [
        updateHobby({ revision: "memory-0", index: 3, ...music }),
        deleteHobby({ revision: "memory-0", index: 3 }),
        moveHobby({ revision: "memory-0", index: 3, direction: "up" }),
      ]) {
        expect(yield* run(action)).toEqual({
          kind: "refused",
          reason: "Ce Hobby n'existe plus. Recharge la page.",
        });
      }
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a save based on a stale revision is a conflict, no commit", () =>
    Effect.gen(function* () {
      const { run, commits, head } = yield* admin(owner);
      yield* run(createHobby({ revision: "memory-0", ...music }));

      const result = yield* run(
        moveHobby({ revision: "memory-0", index: 1, direction: "up" }),
      );

      expect(result).toEqual({ kind: "conflict" });
      expect(yield* commits).toHaveLength(1);
      expect(yield* head).toBe("memory-1");
    }),
  );

  it.effect("anyone but the Owner is refused, and nothing is committed", () =>
    Effect.gen(function* () {
      for (const identity of [
        undefined,
        { githubId: 7654321, login: "someone", accessToken: "gho_someone" },
      ]) {
        const { run, commits } = yield* admin(identity);

        const result = yield* run(
          moveHobby({ revision: "memory-0", index: 1, direction: "up" }),
        );

        expect(result).toEqual({ kind: "not-owner" });
        expect(yield* commits).toEqual([]);
      }
    }),
  );
});

describe("the Hobbies editor", () => {
  it.effect("opens on the Hobbies in stored order", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(owner);

      expect(yield* run(openHobbiesEditor)).toEqual({
        kind: "owner",
        revision: "memory-0",
        hobbies: [surf, lol, coffee],
      });
    }),
  );

  it.effect("shows nothing to anyone but the Owner", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(undefined);

      expect(yield* run(openHobbiesEditor)).toEqual({ kind: "not-owner" });
    }),
  );
});
