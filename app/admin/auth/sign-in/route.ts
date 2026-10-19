import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/app/admin/auth/oauth-state";
import { githubClientId, redirectUri } from "@/lib/admin/config";
import { signInUrl } from "@/lib/admin/github-sign-in";

/** Sends the Owner to GitHub to sign in to the Admin. */
export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  (await cookies()).set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/auth",
    maxAge: 600,
  });
  return NextResponse.redirect(
    signInUrl({
      clientId: githubClientId(),
      redirectUri: redirectUri(request.url),
      state,
    }),
  );
}
