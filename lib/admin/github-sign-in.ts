/**
 * Sign-in to the Admin with GitHub OAuth (an OAuth App, web flow).
 *
 * `signInUrl` builds the redirect to GitHub's consent page; `completeSignIn`
 * turns GitHub's callback into the identity to keep in the session. GitHub
 * itself sits behind the `GitHubOAuth` interface so the callback logic is
 * testable without a real sign-in.
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

/** The two calls the sign-in makes to GitHub. */
export interface GitHubOAuth {
  /** Exchanges the callback's `code` for an access token. */
  exchangeCode(code: string): Promise<string>;
  /** Reads the account the token belongs to. */
  fetchUser(accessToken: string): Promise<{ id: number; login: string }>;
}

export type SignInResult =
  | { kind: "signed-in"; identity: SignedInIdentity }
  | { kind: "invalid-request" };

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
  const accessToken = await deps.github.exchangeCode(code);
  const user = await deps.github.fetchUser(accessToken);
  const identity: SignedInIdentity = { githubId: user.id, login: user.login };
  if (isOwner(user.id, deps.ownerGithubId)) identity.accessToken = accessToken;
  return { kind: "signed-in", identity };
}
