import { Effect } from "effect";

import { ContentRepository } from "./repository";
import { layerGitHub } from "./repository-github";

import { describe, expect, it } from "@effect/vitest";

const API = "https://api.github.com/repos/ImJustLucas/imjustlucas.dev";
const TOKEN = "gho_owner";

type Request = {
  readonly method: string;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
};

/**
 * A stand-in for the GitHub REST API (Git Data and Contents endpoints) of one
 * repository with a `main` branch: it keeps blobs, trees, commits and the ref
 * like GitHub does, and records every request it receives.
 */
const fakeGitHub = (files: Record<string, string>) => {
  let next = 0;
  const sha = (kind: string) => `${kind}-${++next}`;
  const blobs = new Map<string, string>();
  const trees = new Map<string, Map<string, string>>();
  const commits = new Map<
    string,
    { tree: string; parents: string[]; message: string }
  >();

  const tree = new Map<string, string>();
  for (const [path, content] of Object.entries(files)) {
    const blob = sha("blob");
    blobs.set(blob, Buffer.from(content).toString("base64"));
    tree.set(path, blob);
  }
  const rootTree = sha("tree");
  trees.set(rootTree, tree);
  const rootCommit = sha("commit");
  commits.set(rootCommit, { tree: rootTree, parents: [], message: "init" });

  const state = {
    main: rootCommit,
    unauthorized: false,
    requests: [] as Request[],
  };

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });

  const fetch = async (
    input: string | URL | globalThis.Request,
    init?: RequestInit,
  ) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    const body =
      typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    state.requests.push({ method, url, headers, body });

    if (state.unauthorized || headers.authorization !== `Bearer ${TOKEN}`)
      return json(401, { message: "Bad credentials" });

    const route = `${method} ${url.replace(API, "")}`;
    let match: RegExpMatchArray | null;

    if (route === "GET /git/ref/heads/main")
      return json(200, {
        ref: "refs/heads/main",
        object: { sha: state.main, type: "commit" },
      });

    if ((match = route.match(/^GET \/contents\/(.+)\?ref=(.+)$/))) {
      const path = match[1].split("/").map(decodeURIComponent).join("/");
      const ref = decodeURIComponent(match[2]);
      const commit = commits.get(ref === "main" ? state.main : ref);
      if (!commit) return json(404, { message: "No commit found for the ref" });
      const blob = trees.get(commit.tree)!.get(path);
      if (headers.accept !== "application/vnd.github.raw+json")
        return json(415, { message: "Expected the raw media type" });
      if (blob === undefined) return json(404, { message: "Not Found" });
      return new Response(Buffer.from(blobs.get(blob)!, "base64"));
    }

    if ((match = route.match(/^GET \/git\/commits\/(.+)$/))) {
      const commit = commits.get(match[1]);
      if (!commit) return json(404, { message: "Not Found" });
      return json(200, { sha: match[1], tree: { sha: commit.tree } });
    }

    if (route === "POST /git/blobs") {
      const { content, encoding } = body as {
        content: string;
        encoding: "utf-8" | "base64";
      };
      const blob = sha("blob");
      blobs.set(
        blob,
        encoding === "base64"
          ? content
          : Buffer.from(content, "utf8").toString("base64"),
      );
      return json(201, { sha: blob });
    }

    if (route === "POST /git/trees") {
      const { base_tree, tree: entries } = body as {
        base_tree: string;
        tree: Array<{ path: string; sha: string | null }>;
      };
      const base = trees.get(base_tree);
      if (!base) return json(422, { message: "Invalid base_tree" });
      const merged = new Map(base);
      for (const entry of entries) {
        if (entry.sha === null) merged.delete(entry.path);
        else merged.set(entry.path, entry.sha);
      }
      const created = sha("tree");
      trees.set(created, merged);
      return json(201, { sha: created });
    }

    if (route === "POST /git/commits") {
      const {
        tree: treeSha,
        parents,
        message,
      } = body as {
        tree: string;
        parents: string[];
        message: string;
      };
      const created = sha("commit");
      commits.set(created, { tree: treeSha, parents, message });
      return json(201, { sha: created });
    }

    if (route === "PATCH /git/refs/heads/main") {
      const { sha: target, force } = body as { sha: string; force: boolean };
      const commit = commits.get(target);
      if (!commit) return json(422, { message: "Object does not exist" });
      if (!force && !commit.parents.includes(state.main))
        return json(422, { message: "Update is not a fast forward" });
      state.main = target;
      return json(200, { ref: "refs/heads/main", object: { sha: target } });
    }

    return json(404, { message: `No fake for ${route}` });
  };

  /** Simulates a push to `main` from elsewhere (e.g. the Owner's laptop). */
  const pushFromElsewhere = () => {
    const created = sha("commit");
    commits.set(created, {
      tree: commits.get(state.main)!.tree,
      parents: [state.main],
      message: "Pushed from a laptop",
    });
    state.main = created;
  };

  return {
    fetch,
    state,
    commits,
    pushFromElsewhere,
    blobContent: (path: string) => {
      const blob = trees.get(commits.get(state.main)!.tree)!.get(path);
      return blob === undefined
        ? undefined
        : Buffer.from(blobs.get(blob)!, "base64");
    },
  };
};

const repositoryOver = (github: ReturnType<typeof fakeGitHub>) =>
  layerGitHub({
    owner: "ImJustLucas",
    repo: "imjustlucas.dev",
    branch: "main",
    token: TOKEN,
    fetch: github.fetch,
  });

describe("GitHub ContentRepository", () => {
  it.effect("reads the head of main and its files", () => {
    const github = fakeGitHub({ "content/techs.json": "[1]" });
    return Effect.gen(function* () {
      const repository = yield* ContentRepository;

      expect(yield* repository.head).toBe(github.state.main);
      expect(yield* repository.read("content/techs.json")).toBe("[1]");
      expect(github.state.requests[0].headers).toMatchObject({
        authorization: `Bearer ${TOKEN}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
      });
      expect(github.state.requests[0].headers["user-agent"]).toBeTruthy();
    }).pipe(Effect.provide(repositoryOver(github)));
  });

  it.effect("reads a file as it was at a given revision", () => {
    const github = fakeGitHub({ "content/techs.json": "[1]" });
    return Effect.gen(function* () {
      const repository = yield* ContentRepository;
      const revision = yield* repository.head;
      yield* repository.commit({
        revision,
        message: "Admin save",
        changes: [{ path: "content/techs.json", content: "[2]" }],
      });

      expect(yield* repository.read("content/techs.json", revision)).toBe(
        "[1]",
      );
      expect(yield* repository.read("content/techs.json")).toBe("[2]");
      expect(
        github.state.requests.some((r) =>
          r.url.endsWith(`/contents/content/techs.json?ref=${revision}`),
        ),
      ).toBe(true);
    }).pipe(Effect.provide(repositoryOver(github)));
  });

  it.effect("reports a missing file as not found", () => {
    const github = fakeGitHub({});
    return Effect.gen(function* () {
      const error = yield* Effect.flip(
        (yield* ContentRepository).read("content/nope.json"),
      );

      expect(error._tag).toBe("ContentNotFound");
    }).pipe(Effect.provide(repositoryOver(github)));
  });

  it.effect(
    "commits every change at once on main, on top of the revision read",
    () => {
      const github = fakeGitHub({
        "content/techs.json": "[]",
        "public/old.png": "old",
      });
      const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0xff, 0x00]);
      return Effect.gen(function* () {
        const repository = yield* ContentRepository;
        const revision = yield* repository.head;

        const next = yield* repository.commit({
          revision,
          message: "Admin: add Tech 'Effect'",
          changes: [
            { path: "content/techs.json", content: "café" },
            { path: "public/resume-en.pdf", content: pdf },
            { path: "public/old.png", content: null },
          ],
        });

        expect(yield* repository.head).toBe(next);
        expect(github.commits.get(next)).toMatchObject({
          parents: [revision],
          message: "Admin: add Tech 'Effect'",
        });
        expect(yield* repository.read("content/techs.json")).toBe("café");
        expect(github.blobContent("public/resume-en.pdf")).toEqual(
          Buffer.from(pdf),
        );
        expect(github.blobContent("public/old.png")).toBeUndefined();
        const refUpdates = github.state.requests.filter(
          (r) => r.method === "PATCH",
        );
        expect(refUpdates).toHaveLength(1);
        expect(refUpdates[0].body).toEqual({ sha: next, force: false });
      }).pipe(Effect.provide(repositoryOver(github)));
    },
  );

  it.effect(
    "refuses a commit when main moved since the revision, writing nothing",
    () => {
      const github = fakeGitHub({ "content/techs.json": "[]" });
      return Effect.gen(function* () {
        const repository = yield* ContentRepository;
        const revision = yield* repository.head;
        github.pushFromElsewhere();
        const head = github.state.main;

        const error = yield* Effect.flip(
          repository.commit({
            revision,
            message: "Admin save",
            changes: [{ path: "content/techs.json", content: "[1]" }],
          }),
        );

        expect(error).toMatchObject({
          _tag: "ContentConflict",
          revision,
          head,
        });
        expect(github.state.main).toBe(head);
        expect(github.state.requests.filter((r) => r.method !== "GET")).toEqual(
          [],
        );
      }).pipe(Effect.provide(repositoryOver(github)));
    },
  );

  it.effect(
    "refuses a commit when main moves while it is being written",
    () => {
      const github = fakeGitHub({ "content/techs.json": "[]" });
      const racing: typeof github.fetch = async (input, init) => {
        if (init?.method === "POST" && String(input).endsWith("/git/commits"))
          github.pushFromElsewhere();
        return github.fetch(input, init);
      };
      return Effect.gen(function* () {
        const repository = yield* ContentRepository;
        const revision = yield* repository.head;

        const error = yield* Effect.flip(
          repository.commit({
            revision,
            message: "Admin save",
            changes: [{ path: "content/techs.json", content: "[1]" }],
          }),
        );

        expect(error).toMatchObject({
          _tag: "ContentConflict",
          revision,
          head: github.state.main,
        });
        expect(github.blobContent("content/techs.json")).toEqual(
          Buffer.from("[]"),
        );
      }).pipe(
        Effect.provide(
          layerGitHub({
            owner: "ImJustLucas",
            repo: "imjustlucas.dev",
            branch: "main",
            token: TOKEN,
            fetch: racing,
          }),
        ),
      );
    },
  );

  it.effect(
    "fails with a repository error when GitHub refuses the token",
    () => {
      const github = fakeGitHub({ "content/techs.json": "[]" });
      return Effect.gen(function* () {
        const repository = yield* ContentRepository;
        const revision = yield* repository.head;
        github.state.unauthorized = true;

        const error = yield* Effect.flip(
          repository.commit({
            revision,
            message: "Admin save",
            changes: [{ path: "content/techs.json", content: "[1]" }],
          }),
        );

        expect(error._tag).toBe("ContentRepositoryError");
        expect(error.message).toContain("401");
      }).pipe(Effect.provide(repositoryOver(github)));
    },
  );
});
