/**
 * Sign-in to the Admin with GitHub OAuth (an OAuth App, web flow).
 *
 * `signInUrl` builds the redirect to GitHub's consent page; `completeSignIn`
 * turns GitHub's callback into the identity to keep in the session; `signOut`
 * revokes the Owner's token and ends the session. GitHub itself sits behind
 * the `GitHubOAuth` interface so this logic is testable without a real
 * sign-in.
 */

import { isOwner, type SignedInIdentity } from "@/lib/admin/owner-access";

/**
 * The only scope the Admin needs: read and write this public repository's
 * contents, to commit the Owner's saves. Reading the profile needs no scope.
 */
export const GITHUB_SCOPE = "public_repo";

export function signInUrl(request: {
  clientId: string;
  redirectUri: string;
  state: string;
}): URL {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", request.clientId);
  url.searchParams.set("redirect_uri", request.redirectUri);
  url.searchParams.set("scope", GITHUB_SCOPE);
  url.searchParams.set("state", request.state);
  url.searchParams.set("allow_signup", "false");
  return url;
}

/** The calls the sign-in and sign-out make to GitHub. */
export interface GitHubOAuth {
  /** Exchanges the callback's `code` for an access token. */
  exchangeCode(code: string): Promise<string>;
  /** Reads the account the token belongs to. */
  fetchUser(accessToken: string): Promise<{ id: number; login: string }>;
  /** Revokes the token, so it is useless even if it leaked. */
  revokeToken(accessToken: string): Promise<void>;
}

export type SignInResult =
  | { kind: "signed-in"; identity: SignedInIdentity }
  /** A forged state, or the consent was declined on GitHub. */
  | { kind: "invalid-request" }
  /** GitHub refused the code or could not be reached. */
  | { kind: "failed" };

/**
 * Handles GitHub's callback. The identity returned is what the session keeps:
 * the GitHub token is kept for the Owner only, so any other account is
 * remembered just long enough to be shown a refusal.
 */
export async function completeSignIn(
  callback: {
    code: string | null;
    state: string | null;
    expectedState: string | undefined;
  },
  deps: { github: GitHubOAuth; ownerGithubId: string | undefined },
): Promise<SignInResult> {
  const { code, state, expectedState } = callback;
  if (!code || !state || !expectedState || state !== expectedState) {
    return { kind: "invalid-request" };
  }
  try {
    const accessToken = await deps.github.exchangeCode(code);
    const user = await deps.github.fetchUser(accessToken);
    const identity: SignedInIdentity = { githubId: user.id, login: user.login };
    if (isOwner(user.id, deps.ownerGithubId))
      identity.accessToken = accessToken;
    return { kind: "signed-in", identity };
  } catch {
    return { kind: "failed" };
  }
}

/**
 * Signs out of the Admin: revokes the Owner's GitHub token, if the session
 * kept one, then ends the session. A failed revocation (GitHub down, token
 * already revoked) never keeps anyone signed in.
 */
export async function signOut(deps: {
  identity: SignedInIdentity | undefined;
  revokeToken: (accessToken: string) => Promise<void>;
  endSession: () => Promise<void>;
}): Promise<void> {
  const token = deps.identity?.accessToken;
  if (token) await deps.revokeToken(token).catch(() => undefined);
  await deps.endSession();
}
