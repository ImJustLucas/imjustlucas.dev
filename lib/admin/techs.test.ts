import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import type { SignedInIdentity } from "@/lib/admin/owner-access";
import {
  createTech,
  createTechCategory,
  deleteTech,
  deleteTechCategory,
  openTechsEditor,
  updateTech,
  updateTechCategory,
} from "@/lib/admin/techs";
import { makeInMemoryRepository } from "@/lib/content/repository-in-memory";
import { testProfile } from "@/lib/content/test-profile";

import { describe, expect, it } from "@effect/vitest";

const OWNER_GITHUB_ID = "1234567";
const owner: SignedInIdentity = {
  githubId: 1234567,
  login: "ImJustLucas",
  accessToken: "gho_owner",
};

const typescript = { id: "typescript", name: "TypeScript", color: "#3b82f6" };
const react = { id: "react", name: "React", color: "#60a5fa" };
const docker = { id: "docker", name: "Docker", color: "#2496ed" };
const frontend = {
  name: { en: "Frontend", fr: "Frontend" },
  description: { en: "Building UIs", fr: "Construire des interfaces" },
  techs: ["typescript", "react"],
};

const portfolio = {
  title: "Portfolio",
  description: { en: "This site", fr: "Ce site" },
  wip: false,
  period: { start: "2024", end: "ongoing" },
  techs: ["typescript"],
  openSource: true,
  rarity: "common",
};

const TECHS = "content/techs.json";
const CATEGORIES = "content/tech-categories.json";

/**
 * The Admin over an in-memory content repository holding these documents,
 * with `identity` signed in. `commits` lists what the actions committed.
 */
const admin = (
  identity: SignedInIdentity | undefined,
  documents: { techs?: unknown; techCategories?: unknown } = {},
) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      [TECHS]: JSON.stringify(documents.techs ?? [typescript, react, docker]),
      [CATEGORIES]: JSON.stringify(documents.techCategories ?? [frontend]),
      "content/projects.json": JSON.stringify([portfolio]),
      "content/experiences.json": "[]",
      "content/achievements.json": "[]",
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
    const document = (path: string) =>
      Effect.map(memory.repository.read(path), (text) => JSON.parse(text));
    return {
      run: <A, E>(action: Effect.Effect<A, E, AdminAccess>) =>
        Effect.provide(action, access),
      commits: memory.commits,
      head: memory.repository.head,
      document,
    };
  });

describe("Admin actions on Techs", () => {
  it.effect("a valid new Tech is published as one commit", () =>
    Effect.gen(function* () {
      const { run, commits, document } = yield* admin(owner);

      const result = yield* run(
        createTech({
          revision: "memory-0",
          id: "effect",
          name: "Effect",
          color: "#7c3aed",
        }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe("📝 Admin: add Tech 'Effect'");
      expect(made[0].changes.map((change) => change.path)).toEqual([TECHS]);
      expect(yield* document(TECHS)).toEqual([
        typescript,
        react,
        docker,
        { id: "effect", name: "Effect", color: "#7c3aed" },
      ]);
    }),
  );

  it.effect("invalid input gives field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createTech({
          revision: "memory-0",
          id: "Not An Id",
          name: "",
          color: "blue",
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          id: "Identifiant attendu en minuscules, mots séparés par des tirets",
          name: "Champ obligatoire",
          color: "Couleur attendue au format #rrggbb",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a Tech identifier already taken is a field error", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createTech({
          revision: "memory-0",
          id: "react",
          name: "React again",
          color: "#000000",
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: { id: "Un Tech utilise déjà cet identifiant : react" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("editing a Tech changes its name and colour in place", () =>
    Effect.gen(function* () {
      const { run, commits, document } = yield* admin(owner);

      const result = yield* run(
        updateTech({
          revision: "memory-0",
          id: "react",
          name: "React 19",
          color: "#61dafb",
        }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: update Tech 'React 19'",
      );
      expect(yield* document(TECHS)).toEqual([
        typescript,
        { id: "react", name: "React 19", color: "#61dafb" },
        docker,
      ]);
    }),
  );

  it.effect("deleting an unused Tech removes it", () =>
    Effect.gen(function* () {
      const { run, commits, document } = yield* admin(owner);

      const result = yield* run(
        deleteTech({ revision: "memory-0", id: "docker" }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: delete Tech 'Docker'",
      );
      expect(yield* document(TECHS)).toEqual([typescript, react]);
    }),
  );

  it.effect(
    "deleting a Tech still used by a Tech category is refused, naming it",
    () =>
      Effect.gen(function* () {
        const { run, commits } = yield* admin(owner);

        const result = yield* run(
          deleteTech({ revision: "memory-0", id: "react" }),
        );

        expect(result).toEqual({
          kind: "refused",
          reason:
            "React est encore utilisé par la Tech category « Frontend ». Retire-le d'abord de là pour pouvoir le supprimer.",
        });
        expect(yield* commits).toEqual([]);
      }),
  );

  it.effect(
    "deleting a Tech still used by a Project is refused, naming every use",
    () =>
      Effect.gen(function* () {
        const { run, commits } = yield* admin(owner);

        const result = yield* run(
          deleteTech({ revision: "memory-0", id: "typescript" }),
        );

        expect(result).toEqual({
          kind: "refused",
          reason:
            "TypeScript est encore utilisé par la Tech category « Frontend », le Project « Portfolio ». Retire-le d'abord de là pour pouvoir le supprimer.",
        });
        expect(yield* commits).toEqual([]);
      }),
  );

  it.effect("a save based on a stale revision is a conflict, no commit", () =>
    Effect.gen(function* () {
      const { run, commits, head } = yield* admin(owner);
      yield* run(
        updateTech({
          revision: "memory-0",
          id: "react",
          name: "React 19",
          color: "#61dafb",
        }),
      );

      const result = yield* run(
        updateTech({
          revision: "memory-0",
          id: "docker",
          name: "Docker Engine",
          color: "#2496ed",
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
          deleteTech({ revision: "memory-0", id: "docker" }),
        );

        expect(result).toEqual({ kind: "not-owner" });
        expect(yield* commits).toEqual([]);
      }
    }),
  );
});

describe("Admin actions on Tech categories", () => {
  it.effect("a new Tech category is published with its Techs in order", () =>
    Effect.gen(function* () {
      const { run, commits, document } = yield* admin(owner);
      const devops = {
        name: { en: "DevOps", fr: "DevOps" },
        description: { en: "Shipping it", fr: "Livrer" },
        techs: ["docker", "typescript"],
      };

      const result = yield* run(
        createTechCategory({ revision: "memory-0", ...devops }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe("📝 Admin: add Tech category 'DevOps'");
      expect(made[0].changes.map((change) => change.path)).toEqual([
        CATEGORIES,
      ]);
      expect(yield* document(CATEGORIES)).toEqual([frontend, devops]);
    }),
  );

  it.effect("a missing translation gives field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createTechCategory({
          revision: "memory-0",
          name: { en: "Backend", fr: "" },
          description: { en: "", fr: "Le serveur" },
          techs: ["typescript"],
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          "name.fr": "Traduction manquante",
          "description.en": "Traduction manquante",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("an unknown Tech gives a field error and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createTechCategory({
          revision: "memory-0",
          name: { en: "Backend", fr: "Backend" },
          description: { en: "Servers", fr: "Serveurs" },
          techs: ["typescript", "vue"],
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: { "techs.1": "Tech inconnu : vue" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("editing a Tech category replaces it in place", () =>
    Effect.gen(function* () {
      const backend = {
        name: { en: "Backend", fr: "Backend" },
        description: { en: "Servers", fr: "Serveurs" },
        techs: ["docker"],
      };
      const { run, commits, document } = yield* admin(owner, {
        techCategories: [frontend, backend],
      });
      const edited = {
        name: { en: "Frontend", fr: "Interfaces" },
        description: { en: "Building UIs", fr: "Construire des interfaces" },
        techs: ["react", "typescript"],
      };

      const result = yield* run(
        updateTechCategory({ revision: "memory-0", index: 0, ...edited }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: update Tech category 'Frontend'",
      );
      expect(yield* document(CATEGORIES)).toEqual([edited, backend]);
    }),
  );

  it.effect("deleting a Tech category removes it", () =>
    Effect.gen(function* () {
      const { run, commits, document } = yield* admin(owner);

      const result = yield* run(
        deleteTechCategory({ revision: "memory-0", index: 0 }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: delete Tech category 'Frontend'",
      );
      expect(yield* document(CATEGORIES)).toEqual([]);
    }),
  );

  it.effect("a Tech category that no longer exists is refused", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        deleteTechCategory({ revision: "memory-0", index: 3 }),
      );

      expect(result).toMatchObject({ kind: "refused" });
      expect(yield* commits).toEqual([]);
    }),
  );
});

describe("the Techs editor", () => {
  it.effect(
    "opens on the current content and the revision it was read at",
    () =>
      Effect.gen(function* () {
        const { run } = yield* admin(owner);

        const editor = yield* run(openTechsEditor);

        expect(editor).toEqual({
          kind: "owner",
          revision: "memory-0",
          techs: [typescript, react, docker],
          techCategories: [frontend],
        });
      }),
  );

  it.effect("shows nothing to anyone but the Owner", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(undefined);

      expect(yield* run(openTechsEditor)).toEqual({ kind: "not-owner" });
    }),
  );

  it.effect("tells the Owner which content file is missing", () =>
    Effect.gen(function* () {
      const { run } = yield* withoutTechs(owner);

      expect(yield* run(openTechsEditor)).toEqual({
        kind: "unavailable",
        reason: "Le fichier content/techs.json est introuvable.",
      });
    }),
  );
});

describe("a branch without the content", () => {
  it.effect("a save fails with the missing file named, nothing committed", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* withoutTechs(owner);

      const result = yield* run(
        createTech({
          revision: "memory-0",
          id: "effect",
          name: "Effect",
          color: "#7c3aed",
        }),
      );

      expect(result).toEqual({
        kind: "failed",
        reason: "Le fichier content/techs.json est introuvable.",
      });
      expect(yield* commits).toHaveLength(0);
    }),
  );
});

/** The Admin over a repository with every content document but the Techs. */
const withoutTechs = (identity: SignedInIdentity | undefined) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      [CATEGORIES]: JSON.stringify([frontend]),
      "content/projects.json": JSON.stringify([portfolio]),
      "content/experiences.json": "[]",
      "content/achievements.json": "[]",
      "content/hobbies.json": "[]",
      "content/profile.json": JSON.stringify(testProfile),
    });
    const access = AdminAccess.layer({
      identities: { current: async () => identity },
      ownerGithubId: OWNER_GITHUB_ID,
      repositoryFor: () => memory.repository,
    });
    return {
      run: <A, E>(action: Effect.Effect<A, E, AdminAccess>) =>
        Effect.provide(action, access),
      commits: memory.commits,
    };
  });
