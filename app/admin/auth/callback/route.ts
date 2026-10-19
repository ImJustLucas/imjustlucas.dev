import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/app/admin/auth/oauth-state";
import {
  githubClientId,
  githubClientSecret,
  ownerGithubId,
  redirectUri,
} from "@/lib/admin/config";
import { githubOAuth } from "@/lib/admin/github-oauth";
import { completeSignIn } from "@/lib/admin/github-sign-in";
import { saveSession } from "@/lib/admin/session";

/** GitHub sends the Owner back here after he signed in. */
export async function GET(request: NextRequest) {
  const jar = await cookies();
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete({ name: OAUTH_STATE_COOKIE, path: "/admin/auth" });

  const result = await completeSignIn(
    {
      code: request.nextUrl.searchParams.get("code"),
      state: request.nextUrl.searchParams.get("state"),
      expectedState,
    },
    {
      github: githubOAuth({
        clientId: githubClientId(),
        clientSecret: githubClientSecret(),
        redirectUri: redirectUri(request.url),
      }),
      ownerGithubId: ownerGithubId(),
    },
  );

  // A rejected callback (forged state, or the consent was declined on GitHub)
  // signs nobody in: back to the sign-in page.
  if (result.kind === "signed-in") await saveSession(result.identity);
  return NextResponse.redirect(new URL("/admin", request.url));
}
