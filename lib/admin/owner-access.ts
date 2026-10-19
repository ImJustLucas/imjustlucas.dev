/**
 * The Owner check: the one gate in front of the Admin.
 *
 * `ownerAccess` asks an `AdminIdentitySource` who is signed in and lets only
 * the Owner through. The Admin layout and home page read it through
 * `currentOwnerAccess`; editor pages and every Admin action through
 * `AdminAccess` (`lib/admin/admin-action.ts`). In production the source is the session
 * cookie (`lib/admin/session.ts`); tests pass a fake signed-in identity.
 */

/** Whoever is signed in to the Admin, as GitHub reported them at sign-in. */
export interface SignedInIdentity {
  /** Numeric GitHub account identifier (stable, unlike the login). */
  githubId: number;
  login: string;
  /** GitHub token, only ever kept for the Owner. */
  accessToken?: string;
}

/** The Owner, signed in, with the GitHub token used to commit content. */
export interface Owner {
  githubId: number;
  login: string;
  accessToken: string;
}

/** Tells who is signed in to the Admin, if anyone. */
export interface AdminIdentitySource {
  current(): Promise<SignedInIdentity | undefined>;
}

/**
 * Whether a GitHub account is the Owner. `ownerGithubId` is the configured
 * Owner identifier (`OWNER_GITHUB_ID`); while it is unset nobody is.
 */
export function isOwner(
  githubId: number,
  ownerGithubId: string | undefined,
): boolean {
  return !!ownerGithubId && String(githubId) === ownerGithubId;
}

/** What the Admin shows whoever is signed in. */
export type OwnerAccess =
  | { kind: "owner"; owner: Owner }
  | { kind: "refused"; login: string }
  | { kind: "signed-out" };

export async function ownerAccess(
  identities: AdminIdentitySource,
  ownerGithubId: string | undefined,
): Promise<OwnerAccess> {
  const identity = await identities.current();
  if (!identity) return { kind: "signed-out" };
  if (!isOwner(identity.githubId, ownerGithubId)) {
    return { kind: "refused", login: identity.login };
  }
  if (!identity.accessToken) return { kind: "signed-out" };
  return {
    kind: "owner",
    owner: {
      githubId: identity.githubId,
      login: identity.login,
      accessToken: identity.accessToken,
    },
  };
}
