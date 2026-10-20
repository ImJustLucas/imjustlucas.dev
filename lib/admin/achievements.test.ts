import { Effect } from "effect";

import {
  createAchievement,
  deleteAchievement,
  openAchievementsEditor,
  updateAchievement,
} from "@/lib/admin/achievements";
import { AdminAccess } from "@/lib/admin/admin-action";
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

const mdf = {
  name: { en: "MasterDevFrance 2025", fr: "MasterDevFrance 2025" },
  description: {
    en: "winner of the national competition",
    fr: "vainqueur du concours national",
  },
  year: 2025,
  rarity: "legendary",
  link: "/mdf-2025",
  art: "/images/chibi/trophy.webp",
};

const ACHIEVEMENTS = "content/achievements.json";

/**
 * The Admin over an in-memory content repository holding these
 * Achievements, with `identity` signed in. `commits` lists what the actions
 * committed.
 */
const admin = (
  identity: SignedInIdentity | undefined,
  achievements: ReadonlyArray<unknown> = [mdf],
) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      "content/techs.json": "[]",
      "content/tech-categories.json": "[]",
      "content/projects.json": "[]",
      "content/experiences.json": "[]",
      [ACHIEVEMENTS]: JSON.stringify(achievements),
      "content/hobbies.json": "[]",
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
      achievements: Effect.map(memory.repository.read(ACHIEVEMENTS), (text) =>
        JSON.parse(text),
      ),
    };
  });

/** An Achievement as the Owner fills the form, without an art upload. */
const hackathon = {
  name: { en: "Hackathon Paris", fr: "Hackathon de Paris" },
  description: { en: "first prize", fr: "premier prix" },
  year: "2023",
  rarity: "rare",
  link: "https://hackathon.example",
};

/** The first bytes of a PNG and a WebP file: enough to recognise them. */
const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d,
]);
const WEBP = new TextEncoder().encode("RIFF\x24\0\0\0WEBPVP8 ");

/** An upload of `bytes`, as the editor's form sends it. */
const uploaded = (bytes: Uint8Array) => async () => bytes;

/** An upload that records whether anything read it. */
const watchedUpload = (bytes: Uint8Array) => {
  const upload = Object.assign(
    async () => {
      upload.read = true;
      return bytes;
    },
    { read: false },
  );
  return upload;
};

describe("Admin actions on Achievements", () => {
  it.effect("a new Achievement is published with its art in one commit", () =>
    Effect.gen(function* () {
      const { run, commits, achievements } = yield* admin(owner);

      const result = yield* run(
        createAchievement({
          revision: "memory-0",
          ...hackathon,
          art: uploaded(WEBP),
        }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe(
        "📝 Admin: add Achievement 'Hackathon Paris'",
      );
      const [document, asset] = made[0].changes;
      expect(document.path).toBe(ACHIEVEMENTS);
      expect(asset.path).toMatch(
        /^public\/images\/achievements\/hackathon-paris-[0-9a-f]{8}\.webp$/,
      );
      expect(asset.content).toEqual(WEBP);
      expect(yield* achievements).toEqual([
        mdf,
        {
          name: { en: "Hackathon Paris", fr: "Hackathon de Paris" },
          description: { en: "first prize", fr: "premier prix" },
          year: 2023,
          rarity: "rare",
          link: "https://hackathon.example",
          art: asset.path.slice("public".length),
        },
      ]);
    }),
  );

  it.effect("a new Achievement without art is a field error", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createAchievement({ revision: "memory-0", ...hackathon }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: { art: "Champ obligatoire" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("invalid fields give field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      for (const year of ["1999", "", "2025.5", "deux mille"]) {
        const result = yield* run(
          createAchievement({
            revision: "memory-0",
            ...hackathon,
            name: { en: "Hackathon Paris", fr: "" },
            year,
            rarity: "mythic",
            link: "hackathon.example",
            art: uploaded(PNG),
          }),
        );

        expect(result).toEqual({
          kind: "invalid",
          fieldErrors: {
            "name.fr": "Traduction manquante",
            year: "Année attendue, de 2000 à 2100",
            rarity: "Rareté inconnue",
            link: "Page du site attendue (commençant par /) ou lien commençant par http:// ou https://",
          },
        });
      }
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a file that is not an image gives a field error, no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        updateAchievement({
          revision: "memory-0",
          index: 0,
          ...hackathon,
          art: uploaded(new TextEncoder().encode("%PDF-1.7")),
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          art: "Image attendue au format PNG, JPEG, WebP ou AVIF",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect(
    "editing an Achievement replaces it in place and keeps its art",
    () =>
      Effect.gen(function* () {
        const { run, commits, achievements } = yield* admin(owner);

        const result = yield* run(
          updateAchievement({
            revision: "memory-0",
            index: 0,
            name: mdf.name,
            description: {
              en: "national winner in software development",
              fr: "vainqueur national en développement logiciel",
            },
            year: "2025",
            rarity: "legendary",
            link: "https://masterdevfrance.example",
          }),
        );

        expect(result).toEqual({ kind: "saved", revision: "memory-1" });
        const made = yield* commits;
        expect(made[0].message).toBe(
          "📝 Admin: update Achievement 'MasterDevFrance 2025'",
        );
        expect(made[0].changes.map((change) => change.path)).toEqual([
          ACHIEVEMENTS,
        ]);
        expect(yield* achievements).toEqual([
          {
            ...mdf,
            description: {
              en: "national winner in software development",
              fr: "vainqueur national en développement logiciel",
            },
            link: "https://masterdevfrance.example",
          },
        ]);
      }),
  );

  it.effect("uploading new art replaces the Achievement's art", () =>
    Effect.gen(function* () {
      const { run, commits, achievements } = yield* admin(owner);

      yield* run(
        updateAchievement({
          revision: "memory-0",
          index: 0,
          ...hackathon,
          art: uploaded(PNG),
        }),
      );

      const [, asset] = (yield* commits)[0].changes;
      expect(asset.path).toMatch(
        /^public\/images\/achievements\/hackathon-paris-[0-9a-f]{8}\.png$/,
      );
      expect((yield* achievements)[0].art).toBe(
        asset.path.slice("public".length),
      );
    }),
  );

  it.effect("deleting an Achievement removes it", () =>
    Effect.gen(function* () {
      const { run, commits, achievements } = yield* admin(owner);

      const result = yield* run(
        deleteAchievement({ revision: "memory-0", index: 0 }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: delete Achievement 'MasterDevFrance 2025'",
      );
      expect(yield* achievements).toEqual([]);
    }),
  );

  it.effect("an Achievement that no longer exists is refused", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      for (const action of [
        updateAchievement({ revision: "memory-0", index: 1, ...hackathon }),
        deleteAchievement({ revision: "memory-0", index: 1 }),
      ]) {
        expect(yield* run(action)).toEqual({
          kind: "refused",
          reason: "Cet Achievement n'existe plus. Recharge la page.",
        });
      }
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a save based on a stale revision is a conflict, no commit", () =>
    Effect.gen(function* () {
      const { run, commits, head } = yield* admin(owner);
      yield* run(deleteAchievement({ revision: "memory-0", index: 0 }));

      const result = yield* run(
        updateAchievement({ revision: "memory-0", index: 0, ...hackathon }),
      );

      expect(result).toEqual({ kind: "conflict" });
      expect(yield* commits).toHaveLength(1);
      expect(yield* head).toBe("memory-1");
    }),
  );

  it.effect(
    "anyone but the Owner is refused, nothing is committed and no upload is read",
    () =>
      Effect.gen(function* () {
        for (const identity of [
          undefined,
          { githubId: 7654321, login: "someone", accessToken: "gho_someone" },
        ]) {
          const { run, commits } = yield* admin(identity);
          const art = watchedUpload(PNG);

          const result = yield* run(
            createAchievement({ revision: "memory-0", ...hackathon, art }),
          );

          expect(result).toEqual({ kind: "not-owner" });
          expect(art.read).toBe(false);
          expect(yield* commits).toEqual([]);
        }
      }),
  );
});

describe("the Achievements editor", () => {
  it.effect("opens on the Achievements in stored order", () =>
    Effect.gen(function* () {
      const older = { ...mdf, year: 2023, link: "/" };
      const { run } = yield* admin(owner, [mdf, older]);

      expect(yield* run(openAchievementsEditor)).toEqual({
        kind: "owner",
        revision: "memory-0",
        achievements: [mdf, older],
      });
    }),
  );

  it.effect("shows nothing to anyone but the Owner", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(undefined);

      expect(yield* run(openAchievementsEditor)).toEqual({
        kind: "not-owner",
      });
    }),
  );
});
