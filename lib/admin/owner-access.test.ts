import { describe, expect, it } from "vitest";

import {
  type AdminIdentitySource,
  ownerAccess,
  type SignedInIdentity,
} from "@/lib/admin/owner-access";

const OWNER_GITHUB_ID = "1234567";

/** A fake signed-in identity, standing in for the session. */
const signedInAs = (
  identity: SignedInIdentity | undefined,
): AdminIdentitySource => ({
  current: async () => identity,
});

const ownerIdentity: SignedInIdentity = {
  githubId: 1234567,
  login: "ImJustLucas",
  accessToken: "gho_owner",
};

describe("ownerAccess", () => {
  it("lets the Owner in", async () => {
    expect(
      await ownerAccess(signedInAs(ownerIdentity), OWNER_GITHUB_ID),
    ).toEqual({
      kind: "owner",
      owner: {
        githubId: 1234567,
        login: "ImJustLucas",
        accessToken: "gho_owner",
      },
    });
  });

  it("asks to sign in when nobody is signed in", async () => {
    expect(await ownerAccess(signedInAs(undefined), OWNER_GITHUB_ID)).toEqual({
      kind: "signed-out",
    });
  });

  it("refuses another GitHub account by its login", async () => {
    const someoneElse = signedInAs({ githubId: 7654321, login: "someone" });

    expect(await ownerAccess(someoneElse, OWNER_GITHUB_ID)).toEqual({
      kind: "refused",
      login: "someone",
    });
  });

  it("refuses another GitHub account even when it holds a token", async () => {
    const someoneElse = signedInAs({
      githubId: 7654321,
      login: "someone-else",
      accessToken: "gho_someone_else",
    });

    expect(await ownerAccess(someoneElse, OWNER_GITHUB_ID)).toEqual({
      kind: "refused",
      login: "someone-else",
    });
  });

  it("refuses everyone while no Owner identifier is configured", async () => {
    for (const ownerGithubId of [undefined, ""]) {
      expect(
        await ownerAccess(signedInAs(ownerIdentity), ownerGithubId),
      ).toEqual({ kind: "refused", login: "ImJustLucas" });
    }
  });

  it("asks the Owner to sign in again when his token is missing", async () => {
    const ownerWithoutToken = signedInAs({
      githubId: 1234567,
      login: "ImJustLucas",
    });

    expect(await ownerAccess(ownerWithoutToken, OWNER_GITHUB_ID)).toEqual({
      kind: "signed-out",
    });
  });
});
