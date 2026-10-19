import type { GitHubOAuth } from "@/lib/admin/github-sign-in";

import "server-only";

const USER_AGENT = "imjustlucas.dev-admin";

/** The real GitHub behind the sign-in's `GitHubOAuth` interface. */
export function githubOAuth(app: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): GitHubOAuth {
  return {
    async exchangeCode(code) {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          cache: "no-store",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent": USER_AGENT,
          },
          body: JSON.stringify({
            client_id: app.clientId,
            client_secret: app.clientSecret,
            code,
            redirect_uri: app.redirectUri,
          }),
        },
      );
      const body = (await response.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };
      if (!response.ok || !body.access_token) {
        throw new Error(
          `GitHub refused the sign-in code: ${body.error_description ?? body.error ?? response.status}`,
        );
      }
      return body.access_token;
    },

    async fetchUser(accessToken) {
      const response = await fetch("https://api.github.com/user", {
        cache: "no-store",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${accessToken}`,
          "user-agent": USER_AGENT,
          "x-github-api-version": "2022-11-28",
        },
      });
      if (!response.ok) {
        throw new Error(
          `GitHub did not return the account: ${response.status}`,
        );
      }
      const user = (await response.json()) as { id: number; login: string };
      return { id: user.id, login: user.login };
    },
  };
}
