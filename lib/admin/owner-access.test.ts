import { describe, expect, it } from "vitest";

import {
  type AdminIdentitySource,
  NotOwnerError,
  ownerAccess,
  requireOwner,
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

describe("requireOwner", () => {
  it("accepts the Owner and hands over his GitHub token", async () => {
    const owner = await requireOwner(
      signedInAs(ownerIdentity),
      OWNER_GITHUB_ID,
    );

    expect(owner).toEqual({
      githubId: 1234567,
      login: "ImJustLucas",
      accessToken: "gho_owner",
    });
  });

  it("refuses any other GitHub account, even one holding a token", async () => {
    const someoneElse = signedInAs({
      githubId: 7654321,
      login: "someone-else",
      accessToken: "gho_someone_else",
    });

    await expect(requireOwner(someoneElse, OWNER_GITHUB_ID)).rejects.toThrow(
      NotOwnerError,
    );
  });

  it("refuses when nobody is signed in", async () => {
    await expect(
      requireOwner(signedInAs(undefined), OWNER_GITHUB_ID),
    ).rejects.toThrow(NotOwnerError);
  });

  it("refuses everyone while no Owner identifier is configured", async () => {
    await expect(
      requireOwner(signedInAs(ownerIdentity), undefined),
    ).rejects.toThrow(NotOwnerError);
    await expect(requireOwner(signedInAs(ownerIdentity), "")).rejects.toThrow(
      NotOwnerError,
    );
  });
});

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
