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

/**
 * GitHub sends the Owner back here after he signed in. Whatever goes wrong
 * (forged state, consent declined, GitHub failing, missing configuration),
 * nobody is signed in and the visitor lands back on the sign-in screen.
 */
export async function GET(request: NextRequest) {
  const backToAdmin = NextResponse.redirect(new URL("/admin", request.url));
  try {
    await signIn(request);
  } catch {
    // GitHub's own words are not logged: they may echo the request.
    console.error("Admin sign-in failed");
  }
  return backToAdmin;
}

async function signIn(request: NextRequest) {
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

  // A rejected or failed callback signs nobody in.
  if (result.kind === "signed-in") await saveSession(result.identity);
}
