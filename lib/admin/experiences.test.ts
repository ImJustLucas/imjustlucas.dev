import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import {
  createExperience,
  deleteExperience,
  openExperiencesEditor,
  updateExperience,
} from "@/lib/admin/experiences";
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

const favikon = {
  company: "Favikon",
  role: { en: "Fullstack Developer", fr: "Développeur Fullstack" },
  contractType: "work-study",
  link: "https://favikon.com",
  description: {
    en: "Influencer marketing SaaS",
    fr: "SaaS de marketing d'influence",
  },
  period: { start: "2023", end: "2025" },
};
const predi = {
  company: "Predi.GG",
  role: { en: "Co-Founder", fr: "Cofondateur" },
  contractType: "entrepreneurship",
  link: "https://predi.gg",
  description: { en: "Co-founded Predi.GG", fr: "Cofondation de Predi.GG" },
  period: { start: "2025-09", end: "ongoing" },
};

const EXPERIENCES = "content/experiences.json";

/**
 * The Admin over an in-memory content repository holding these Experiences,
 * with `identity` signed in. `commits` lists what the actions committed.
 */
const admin = (
  identity: SignedInIdentity | undefined,
  experiences: unknown = [favikon, predi],
) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      "content/techs.json": "[]",
      "content/tech-categories.json": "[]",
      "content/projects.json": "[]",
      [EXPERIENCES]: JSON.stringify(experiences),
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
      experiences: Effect.map(memory.repository.read(EXPERIENCES), (text) =>
        JSON.parse(text),
      ),
    };
  });

const bam = {
  company: "Bam Karaoke",
  role: { en: "Fullstack Developer", fr: "Développeur Fullstack" },
  contractType: "permanent",
  link: "https://bamkaraoke.com",
  description: {
    en: "Fullstack development for Bam Karaoke",
    fr: "Développement fullstack pour Bam Karaoke",
  },
  period: { start: "2026-01", end: "ongoing" },
} as const;

describe("Admin actions on Experiences", () => {
  it.effect("a valid new Experience is published as one commit", () =>
    Effect.gen(function* () {
      const { run, commits, experiences } = yield* admin(owner);

      const result = yield* run(
        createExperience({ revision: "memory-0", ...bam }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe(
        "📝 Admin: add Experience 'Bam Karaoke (Fullstack Developer)'",
      );
      expect(made[0].changes.map((change) => change.path)).toEqual([
        EXPERIENCES,
      ]);
      expect(yield* experiences).toEqual([favikon, predi, bam]);
    }),
  );

  it.effect("a missing translation gives field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createExperience({
          revision: "memory-0",
          ...bam,
          role: { en: "Fullstack Developer", fr: "" },
          description: { en: "", fr: "Développement fullstack" },
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          "role.fr": "Traduction manquante",
          "description.en": "Traduction manquante",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("invalid fields give field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createExperience({
          revision: "memory-0",
          ...bam,
          company: "",
          contractType: "freelance",
          link: "bamkaraoke.com",
          period: { start: "26", end: "2026-13" },
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          company: "Champ obligatoire",
          contractType: "Type de contrat inconnu",
          link: "Lien attendu, commençant par http:// ou https://",
          "period.start": "Année (AAAA) ou mois (AAAA-MM) attendu",
          "period.end": "Année (AAAA), mois (AAAA-MM) ou « en cours » attendu",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a Period ending before it starts is a field error", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createExperience({
          revision: "memory-0",
          ...bam,
          period: { start: "2026-01", end: "2025-12" },
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          "period.end": "La fin ne peut pas précéder le début",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("editing an Experience replaces it in place", () =>
    Effect.gen(function* () {
      const { run, commits, experiences } = yield* admin(owner);
      const edited = {
        ...favikon,
        role: { en: "Software Engineer", fr: "Ingénieur logiciel" },
        period: { start: "2023-09", end: "2025-08" },
      };

      const result = yield* run(
        updateExperience({ revision: "memory-0", index: 0, ...edited }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: update Experience 'Favikon (Software Engineer)'",
      );
      expect(yield* experiences).toEqual([edited, predi]);
    }),
  );

  it.effect("invalid edits are field errors of the edited Experience", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        updateExperience({
          revision: "memory-0",
          index: 1,
          ...predi,
          role: { en: "", fr: "Cofondateur" },
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: { "role.en": "Traduction manquante" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("deleting an Experience removes it", () =>
    Effect.gen(function* () {
      const { run, commits, experiences } = yield* admin(owner);

      const result = yield* run(
        deleteExperience({ revision: "memory-0", index: 1 }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: delete Experience 'Predi.GG (Co-Founder)'",
      );
      expect(yield* experiences).toEqual([favikon]);
    }),
  );

  it.effect("an Experience that no longer exists is refused", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      for (const action of [
        updateExperience({ revision: "memory-0", index: 2, ...bam }),
        deleteExperience({ revision: "memory-0", index: 2 }),
      ]) {
        expect(yield* run(action)).toEqual({
          kind: "refused",
          reason: "Cette Experience n'existe plus. Recharge la page.",
        });
      }
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a save based on a stale revision is a conflict, no commit", () =>
    Effect.gen(function* () {
      const { run, commits, head } = yield* admin(owner);
      yield* run(createExperience({ revision: "memory-0", ...bam }));

      const result = yield* run(
        updateExperience({
          revision: "memory-0",
          index: 0,
          ...favikon,
          link: "https://www.favikon.com",
        }),
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
          deleteExperience({ revision: "memory-0", index: 0 }),
        );

        expect(result).toEqual({ kind: "not-owner" });
        expect(yield* commits).toEqual([]);
      }
    }),
  );
});

describe("the Experiences editor", () => {
  it.effect(
    "opens on the Experiences as stored and the revision they were read at",
    () =>
      Effect.gen(function* () {
        const { run } = yield* admin(owner);

        expect(yield* run(openExperiencesEditor)).toEqual({
          kind: "owner",
          revision: "memory-0",
          experiences: [favikon, predi],
        });
      }),
  );

  it.effect("shows nothing to anyone but the Owner", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(undefined);

      expect(yield* run(openExperiencesEditor)).toEqual({
        kind: "not-owner",
      });
    }),
  );
});
