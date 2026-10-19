"use server";

import { redirect } from "next/navigation";

import { githubClientId, githubClientSecret } from "@/lib/admin/config";
import { githubOAuth } from "@/lib/admin/github-oauth";
import { signOut as endSignIn } from "@/lib/admin/github-sign-in";
import { endSession, sessionIdentities } from "@/lib/admin/session";

/**
 * Signs out of the Admin (a POST, so no link or image can trigger it): the
 * Owner's GitHub token is revoked, then the session ends.
 */
export async function signOut() {
  await endSignIn({
    identity: await sessionIdentities.current(),
    // Configuration is read here, so a missing one only skips the revocation.
    revokeToken: (token) =>
      githubOAuth({
        clientId: githubClientId(),
        clientSecret: githubClientSecret(),
      }).revokeToken(token),
    endSession,
  });
  redirect("/admin");
}
