import { describe, expect, it } from "vitest";

import {
  completeSignIn,
  type GitHubOAuth,
  signInUrl,
} from "@/lib/admin/github-sign-in";

const OWNER_GITHUB_ID = "1234567";

/** A fake GitHub that grants `token` for `code` and reports `user` for it. */
const fakeGitHub = (user: { id: number; login: string }) => {
  const exchangedCodes: string[] = [];
  const github: GitHubOAuth = {
    exchangeCode: async (code) => {
      exchangedCodes.push(code);
      return `token-for-${code}`;
    },
    fetchUser: async (accessToken) => {
      if (accessToken !== `token-for-${exchangedCodes.at(-1)}`) {
        throw new Error("unknown token");
      }
      return user;
    },
  };
  return { github, exchangedCodes };
};

const owner = { id: 1234567, login: "ImJustLucas" };

describe("signInUrl", () => {
  it("sends the Owner to GitHub's consent page asking only for public_repo", () => {
    const url = signInUrl({
      clientId: "Iv1.client",
      redirectUri: "https://imjustlucas.dev/admin/auth/callback",
      state: "random-state",
    });

    expect(url.origin + url.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "Iv1.client",
      redirect_uri: "https://imjustlucas.dev/admin/auth/callback",
      scope: "public_repo",
      state: "random-state",
      allow_signup: "false",
    });
  });
});

describe("completeSignIn", () => {
  it("signs the Owner in and keeps his GitHub token", async () => {
    const { github } = fakeGitHub(owner);

    const result = await completeSignIn(
      { code: "abc", state: "s1", expectedState: "s1" },
      { github, ownerGithubId: OWNER_GITHUB_ID },
    );

    expect(result).toEqual({
      kind: "signed-in",
      identity: {
        githubId: 1234567,
        login: "ImJustLucas",
        accessToken: "token-for-abc",
      },
    });
  });

  it("keeps no token for any other GitHub account", async () => {
    const { github } = fakeGitHub({ id: 7654321, login: "someone" });

    const result = await completeSignIn(
      { code: "abc", state: "s1", expectedState: "s1" },
      { github, ownerGithubId: OWNER_GITHUB_ID },
    );

    expect(result).toEqual({
      kind: "signed-in",
      identity: { githubId: 7654321, login: "someone" },
    });
  });

  it("keeps no token while no Owner identifier is configured", async () => {
    const { github } = fakeGitHub(owner);

    const result = await completeSignIn(
      { code: "abc", state: "s1", expectedState: "s1" },
      { github, ownerGithubId: undefined },
    );

    expect(result).toEqual({
      kind: "signed-in",
      identity: { githubId: 1234567, login: "ImJustLucas" },
    });
  });

  it.each([
    ["the state differs from the one sent", "abc", "forged", "s1"],
    ["the state cookie is gone", "abc", "s1", undefined],
    ["GitHub sent no state", "abc", null, "s1"],
    ["GitHub sent no code", null, "s1", "s1"],
  ])(
    "rejects the callback without asking GitHub when %s",
    async (_case, code, state, expectedState) => {
      const { github, exchangedCodes } = fakeGitHub(owner);

      const result = await completeSignIn(
        { code, state, expectedState },
        { github, ownerGithubId: OWNER_GITHUB_ID },
      );

      expect(result).toEqual({ kind: "invalid-request" });
      expect(exchangedCodes).toEqual([]);
    },
  );
});
