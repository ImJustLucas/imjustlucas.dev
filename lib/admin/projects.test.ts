import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import type { SignedInIdentity } from "@/lib/admin/owner-access";
import {
  createProject,
  deleteProject,
  openProjectsEditor,
  updateProject,
} from "@/lib/admin/projects";
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

const portfolio = {
  title: "Portfolio",
  description: { en: "This site", fr: "Ce site" },
  image: "/images/projects/portfolio.png",
  wip: false,
  period: { start: "2024", end: "ongoing" },
  techs: ["typescript"],
  openSource: true,
  repository: "https://github.com/ImJustLucas/imjustlucas.dev",
};

const PROJECTS = "content/projects.json";

/**
 * The Admin over an in-memory content repository holding these Projects,
 * with `identity` signed in. `commits` lists what the actions committed.
 */
const admin = (
  identity: SignedInIdentity | undefined,
  projects: ReadonlyArray<unknown> = [portfolio],
) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      "content/techs.json": JSON.stringify([typescript, react]),
      "content/tech-categories.json": "[]",
      [PROJECTS]: JSON.stringify(projects),
      "content/experiences.json": "[]",
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
      projects: Effect.map(memory.repository.read(PROJECTS), (text) =>
        JSON.parse(text),
      ),
    };
  });

/** A Project as the Owner fills the form, without an image upload. */
const tricks = {
  title: "Tricks",
  description: { en: "A social network", fr: "Un réseau social" },
  wip: true,
  period: { start: "2021-09", end: "2023" },
  techs: ["react", "typescript"],
  externalLink: "https://tricks.example",
  repository: "",
  openSource: false,
};

/** The first bytes of a PNG, a JPEG and a WebP file: enough to recognise them. */
const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d,
]);
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
const WEBP = new TextEncoder().encode("RIFF\x24\0\0\0WEBPVP8 ");

describe("Admin actions on Projects", () => {
  it.effect("a valid new Project is published as one commit", () =>
    Effect.gen(function* () {
      const { run, commits, projects } = yield* admin(owner);

      const result = yield* run(
        createProject({ revision: "memory-0", ...tricks }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe("📝 Admin: add Project 'Tricks'");
      expect(made[0].changes.map((change) => change.path)).toEqual([PROJECTS]);
      expect(yield* projects).toEqual([
        portfolio,
        {
          title: "Tricks",
          description: { en: "A social network", fr: "Un réseau social" },
          wip: true,
          period: { start: "2021-09", end: "2023" },
          techs: ["react", "typescript"],
          externalLink: "https://tricks.example",
          openSource: false,
        },
      ]);
    }),
  );

  it.effect("an invalid Period gives field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const ended = yield* run(
        createProject({
          revision: "memory-0",
          ...tricks,
          period: { start: "2023-05", end: "2022" },
        }),
      );
      const malformed = yield* run(
        createProject({
          revision: "memory-0",
          ...tricks,
          period: { start: "2023-13", end: "" },
        }),
      );

      expect(ended).toEqual({
        kind: "invalid",
        fieldErrors: { "period.end": "La fin ne peut pas précéder le début" },
      });
      expect(malformed).toEqual({
        kind: "invalid",
        fieldErrors: {
          "period.start": "Année (AAAA) ou mois (AAAA-MM) attendu",
          "period.end": "Année (AAAA), mois (AAAA-MM) ou « en cours » attendu",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("missing or malformed fields give field errors", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createProject({
          revision: "memory-0",
          ...tricks,
          title: "",
          description: { en: "A social network", fr: "" },
          externalLink: "tricks.example",
          repository: "https://gitlab.com/someone/tricks",
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          title: "Champ obligatoire",
          "description.fr": "Traduction manquante",
          externalLink: "Lien attendu, commençant par http:// ou https://",
          repository:
            "Lien attendu au format https://github.com/<compte>/<dépôt>",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a Tech that does not exist gives a field error", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        createProject({
          revision: "memory-0",
          ...tricks,
          techs: ["react", "vue"],
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: { "techs.1": "Tech inconnu : vue" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("editing a Project replaces it in place and keeps its image", () =>
    Effect.gen(function* () {
      const { run, commits, projects } = yield* admin(owner, [
        portfolio,
        { ...tricks, repository: undefined, externalLink: undefined },
      ]);

      const result = yield* run(
        updateProject({
          revision: "memory-0",
          index: 0,
          title: "imjustlucas.dev",
          description: { en: "My portfolio", fr: "Mon portfolio" },
          wip: true,
          period: { start: "2024-03", end: "ongoing" },
          techs: ["react", "typescript"],
          externalLink: "https://imjustlucas.dev",
          repository: "",
          openSource: false,
        }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: update Project 'imjustlucas.dev'",
      );
      const [edited, untouched] = yield* projects;
      expect(edited).toEqual({
        title: "imjustlucas.dev",
        description: { en: "My portfolio", fr: "Mon portfolio" },
        image: "/images/projects/portfolio.png",
        wip: true,
        period: { start: "2024-03", end: "ongoing" },
        techs: ["react", "typescript"],
        externalLink: "https://imjustlucas.dev",
        openSource: false,
      });
      expect(untouched.title).toBe("Tricks");
    }),
  );

  it.effect("star counts are not editable: any sent are ignored", () =>
    Effect.gen(function* () {
      const { run, projects } = yield* admin(owner);
      const withStars = { ...tricks, stars: 999 } as typeof tricks;

      yield* run(createProject({ revision: "memory-0", ...withStars }));
      yield* run(
        updateProject({ revision: "memory-1", index: 0, ...withStars }),
      );

      for (const saved of yield* projects)
        expect(saved).not.toHaveProperty("stars");
    }),
  );

  it.effect("deleting a Project removes it", () =>
    Effect.gen(function* () {
      const { run, commits, projects } = yield* admin(owner);

      const result = yield* run(
        deleteProject({ revision: "memory-0", index: 0 }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      expect((yield* commits)[0].message).toBe(
        "📝 Admin: delete Project 'Portfolio'",
      );
      expect(yield* projects).toEqual([]);
    }),
  );

  it.effect("a Project that no longer exists is refused", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const edited = yield* run(
        updateProject({ revision: "memory-0", index: 4, ...tricks }),
      );
      const deleted = yield* run(
        deleteProject({ revision: "memory-0", index: 4 }),
      );

      expect(edited).toMatchObject({ kind: "refused" });
      expect(deleted).toMatchObject({ kind: "refused" });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a save based on a stale revision is a conflict, no commit", () =>
    Effect.gen(function* () {
      const { run, commits, head } = yield* admin(owner);
      yield* run(createProject({ revision: "memory-0", ...tricks }));

      const result = yield* run(
        updateProject({ revision: "memory-0", index: 0, ...tricks }),
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
          createProject({ revision: "memory-0", ...tricks }),
        );

        expect(result).toEqual({ kind: "not-owner" });
        expect(yield* commits).toEqual([]);
      }
    }),
  );

  it.effect(
    "uploading an image commits the image and the updated Project in one save",
    () =>
      Effect.gen(function* () {
        const { run, commits, projects } = yield* admin(owner);

        const result = yield* run(
          updateProject({
            revision: "memory-0",
            index: 0,
            ...tricks,
            title: "Tricks Network",
            image: JPEG,
          }),
        );

        expect(result).toEqual({ kind: "saved", revision: "memory-1" });
        const made = yield* commits;
        expect(made).toHaveLength(1);
        const [document, asset] = made[0].changes;
        expect(document.path).toBe(PROJECTS);
        expect(asset.path).toMatch(
          /^public\/images\/projects\/tricks-network-[0-9a-f]{8}\.jpg$/,
        );
        expect(asset.content).toEqual(JPEG);
        const [saved] = yield* projects;
        expect(`public${saved.image}`).toBe(asset.path);
      }),
  );

  it.effect("a new Project can come with its image", () =>
    Effect.gen(function* () {
      const { run, commits, projects } = yield* admin(owner);

      yield* run(
        createProject({ revision: "memory-0", ...tricks, image: WEBP }),
      );

      const [, asset] = (yield* commits)[0].changes;
      expect(asset.path).toMatch(
        /^public\/images\/projects\/tricks-[0-9a-f]{8}\.webp$/,
      );
      expect((yield* projects)[1].image).toBe(
        asset.path.slice("public".length),
      );
    }),
  );

  it.effect("another image is stored under another name", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      yield* run(
        updateProject({
          revision: "memory-0",
          index: 0,
          ...tricks,
          image: PNG,
        }),
      );
      yield* run(
        updateProject({
          revision: "memory-1",
          index: 0,
          ...tricks,
          image: Uint8Array.from([...PNG, 1, 2, 3]),
        }),
      );

      const [first, second] = (yield* commits).map(
        (commit) => commit.changes[1].path,
      );
      expect(first).toMatch(/\.png$/);
      expect(second).toMatch(/\.png$/);
      expect(second).not.toBe(first);
    }),
  );

  it.effect("a file that is not an image gives a field error, no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        updateProject({
          revision: "memory-0",
          index: 0,
          ...tricks,
          period: { start: "2023", end: "2022" },
          image: new TextEncoder().encode("%PDF-1.7"),
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          image: "Image attendue au format PNG, JPEG, WebP ou AVIF",
          "period.end": "La fin ne peut pas précéder le début",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("an image over 4 MB gives a field error, no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);
      const huge = new Uint8Array(4 * 1024 * 1024 + 1);
      huge.set(PNG);

      const result = yield* run(
        createProject({ revision: "memory-0", ...tricks, image: huge }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: { image: "Image trop lourde : 4 Mo au maximum" },
      });
      expect(yield* commits).toEqual([]);
    }),
  );
});

describe("the Projects editor", () => {
  it.effect(
    "opens on the Projects in display order, each with its position",
    () =>
      Effect.gen(function* () {
        const older = {
          ...portfolio,
          title: "Older",
          period: { start: "2019", end: "2020" },
        };
        const { run } = yield* admin(owner, [older, portfolio]);

        const editor = yield* run(openProjectsEditor);

        expect(editor).toEqual({
          kind: "owner",
          revision: "memory-0",
          techs: [typescript, react],
          projects: [
            { index: 1, project: portfolio },
            { index: 0, project: older },
          ],
        });
      }),
  );

  it.effect("shows nothing to anyone but the Owner", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(undefined);

      expect(yield* run(openProjectsEditor)).toEqual({ kind: "not-owner" });
    }),
  );
});
