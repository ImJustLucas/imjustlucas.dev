import "server-only";

/**
 * The Admin's configuration, read from environment variables (see CLAUDE.md
 * and `scripts/wizards/admin-github-oauth.sh`).
 */

/** The Owner's numeric GitHub account identifier. Unset: nobody is let in. */
export const ownerGithubId = (): string | undefined =>
  process.env.OWNER_GITHUB_ID || undefined;

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Run scripts/wizards/admin-github-oauth.sh to configure the Admin sign-in.`,
    );
  }
  return value;
}

export const githubClientId = () => required("GITHUB_CLIENT_ID");
export const githubClientSecret = () => required("GITHUB_CLIENT_SECRET");
export const sessionSecret = () => required("SESSION_SECRET");

/**
 * Where GitHub sends the Owner back after sign-in. `AUTH_REDIRECT_URI` wins;
 * otherwise it is derived from the request, so it works on any host listed
 * among the OAuth app's callback URLs.
 */
export const redirectUri = (requestUrl: string): string =>
  process.env.AUTH_REDIRECT_URI ||
  new URL("/admin/auth/callback", requestUrl).toString();
