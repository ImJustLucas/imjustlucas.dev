import { Effect } from "effect";
import { TestClock } from "effect/testing";

import { AdminAccess } from "@/lib/admin/admin-action";
import type { SignedInIdentity } from "@/lib/admin/owner-access";
import {
  openProfileEditor,
  updateProfile,
  uploadResume,
} from "@/lib/admin/profile";
import { makeInMemoryRepository } from "@/lib/content/repository-in-memory";
import { testProfile } from "@/lib/content/test-profile";

import { describe, expect, it } from "@effect/vitest";

const OWNER_GITHUB_ID = "1234567";
const owner: SignedInIdentity = {
  githubId: 1234567,
  login: "ImJustLucas",
  accessToken: "gho_owner",
};

const PROFILE = "content/profile.json";
const FRENCH_RESUME = "public/pdf/cv-lucas-fr.pdf";

/** A file that starts like a PDF. */
const pdf = (...body: Array<number>) =>
  new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, ...body]);

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

/**
 * The Admin over an in-memory content repository holding the test Profile
 * and its Resumes, with `identity` signed in. `commits` lists what the
 * actions committed.
 */
const admin = (identity: SignedInIdentity | undefined) =>
  Effect.gen(function* () {
    const memory = yield* makeInMemoryRepository({
      "content/techs.json": "[]",
      "content/projects.json": "[]",
      "content/experiences.json": "[]",
      "content/achievements.json": "[]",
      "content/hobbies.json": "[]",
      [PROFILE]: JSON.stringify(testProfile),
      "public/pdf/cv-lucas.pdf": pdf(0x01),
      [FRENCH_RESUME]: pdf(0x02),
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
      profile: Effect.map(memory.repository.read(PROFILE), (text) =>
        JSON.parse(text),
      ),
    };
  });

/** The Profile's editable fields, as the editor opens on them. */
const fields = {
  links: testProfile.links,
  youtubeChannelId: testProfile.youtubeChannelId,
  discordUserId: testProfile.discordUserId,
};

describe("Admin actions on the Profile", () => {
  it.effect("an edited social link is published as one commit", () =>
    Effect.gen(function* () {
      const { run, commits, profile } = yield* admin(owner);

      const result = yield* run(
        updateProfile({
          revision: "memory-0",
          ...fields,
          links: {
            ...fields.links,
            linkedin: "https://www.linkedin.com/in/lucas-bellier/",
          },
        }),
      );

      expect(result).toEqual({ kind: "saved", revision: "memory-1" });
      const made = yield* commits;
      expect(made).toHaveLength(1);
      expect(made[0].message).toBe("📝 Admin: update Profile");
      expect(made[0].changes.map((change) => change.path)).toEqual([PROFILE]);
      expect(yield* profile).toEqual({
        ...testProfile,
        links: {
          ...testProfile.links,
          linkedin: "https://www.linkedin.com/in/lucas-bellier/",
        },
      });
    }),
  );

  it.effect("invalid fields give field errors and no commit", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        updateProfile({
          revision: "memory-0",
          links: { ...fields.links, github: "github.com/ImJustLucas" },
          youtubeChannelId: "ImJustLucas",
          discordUserId: "imjustlucas#0001",
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          "links.github": "Lien attendu, commençant par http:// ou https://",
          youtubeChannelId:
            "Identifiant de chaîne YouTube attendu (commençant par UC)",
          discordUserId:
            "Identifiant de compte Discord attendu (17 à 20 chiffres)",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );

  it.effect("a YouTube link that is not the channel's is a field error", () =>
    Effect.gen(function* () {
      const { run, commits } = yield* admin(owner);

      const result = yield* run(
        updateProfile({
          revision: "memory-0",
          ...fields,
          links: { ...fields.links, youtube: "https://www.youtube.com/@lucas" },
        }),
      );

      expect(result).toEqual({
        kind: "invalid",
        fieldErrors: {
          "links.youtube":
            "Lien attendu : https://www.youtube.com/channel/UCLw4N_gccAY1Y4K4S20IPog",
        },
      });
      expect(yield* commits).toEqual([]);
    }),
  );
});

describe("Resume uploads", () => {
  it.effect(
    "commit the PDF and set that Locale's last-updated date, in one save",
    () =>
      Effect.gen(function* () {
        const { run, commits, profile } = yield* admin(owner);
        // 00:30 in Paris on 19 October, still the 18th in UTC.
        yield* TestClock.setTime(Date.parse("2026-10-18T22:30:00Z"));
        const resume = pdf(0x03, 0x04);

        const result = yield* run(
          uploadResume({
            revision: "memory-0",
            locale: "fr",
            file: uploaded(resume),
          }),
        );

        expect(result).toEqual({ kind: "saved", revision: "memory-1" });
        const made = yield* commits;
        expect(made).toHaveLength(1);
        expect(made[0].message).toBe("📝 Admin: upload the French Resume");
        expect(made[0].changes).toEqual([
          { path: PROFILE, content: expect.any(String) },
          { path: FRENCH_RESUME, content: resume },
        ]);
        expect(yield* profile).toEqual({
          ...testProfile,
          resumes: {
            en: testProfile.resumes.en,
            fr: { asset: "/pdf/cv-lucas-fr.pdf", lastUpdated: "2026-10-19" },
          },
        });
      }),
  );

  it.effect("refuse anything but a PDF of at most 4 MB, with no commit", () =>
    Effect.gen(function* () {
      const { run, commits, profile } = yield* admin(owner);
      const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
      const heavy = new Uint8Array(4 * 1024 * 1024 + 1);
      heavy.set(pdf());

      for (const [file, error] of [
        [png, "PDF attendu"],
        [new Uint8Array(), "PDF attendu"],
        [heavy, "PDF trop lourd : 4 Mo au maximum"],
      ] as const) {
        expect(
          yield* run(
            uploadResume({
              revision: "memory-0",
              locale: "en",
              file: uploaded(file),
            }),
          ),
        ).toEqual({ kind: "invalid", fieldErrors: { file: error } });
      }
      expect(yield* commits).toEqual([]);
      expect(yield* profile).toEqual(testProfile);
    }),
  );
});

describe("Profile saves", () => {
  it.effect("based on a stale revision are a conflict, no commit", () =>
    Effect.gen(function* () {
      const { run, commits, head } = yield* admin(owner);
      yield* run(
        updateProfile({
          revision: "memory-0",
          ...fields,
          discordUserId: "127063570616811521",
        }),
      );

      for (const action of [
        updateProfile({
          revision: "memory-0",
          ...fields,
          links: { ...fields.links, instagram: "https://instagram.com/lucas" },
        }),
        uploadResume({
          revision: "memory-0",
          locale: "fr",
          file: uploaded(pdf()),
        }),
      ]) {
        expect(yield* run(action)).toEqual({ kind: "conflict" });
      }
      expect(yield* commits).toHaveLength(1);
      expect(yield* head).toBe("memory-1");
    }),
  );

  it.effect("by anyone but the Owner are refused, and nothing committed", () =>
    Effect.gen(function* () {
      for (const identity of [
        undefined,
        { githubId: 7654321, login: "someone", accessToken: "gho_someone" },
      ]) {
        const { run, commits } = yield* admin(identity);

        for (const action of [
          updateProfile({ revision: "memory-0", ...fields }),
          uploadResume({
            revision: "memory-0",
            locale: "en",
            file: uploaded(pdf()),
          }),
        ]) {
          expect(yield* run(action)).toEqual({ kind: "not-owner" });
        }
        expect(yield* commits).toEqual([]);
      }
    }),
  );
});

describe("Resume uploads by anyone but the Owner", () => {
  it.effect("are never read", () =>
    Effect.gen(function* () {
      for (const identity of [
        undefined,
        { githubId: 7654321, login: "someone", accessToken: "gho_someone" },
      ]) {
        const { run } = yield* admin(identity);
        const file = watchedUpload(pdf());

        yield* run(uploadResume({ revision: "memory-0", locale: "en", file }));

        expect(file.read).toBe(false);
      }
    }),
  );
});

describe("the Profile editor", () => {
  it.effect("opens on the Profile and the revision it was read at", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(owner);

      expect(yield* run(openProfileEditor)).toEqual({
        kind: "owner",
        revision: "memory-0",
        profile: testProfile,
      });
    }),
  );

  it.effect("shows nothing to anyone but the Owner", () =>
    Effect.gen(function* () {
      const { run } = yield* admin(undefined);

      expect(yield* run(openProfileEditor)).toEqual({ kind: "not-owner" });
    }),
  );
});
