import { cookies } from "next/headers";

import { getIronSession, type SessionOptions } from "iron-session";

import { ownerGithubId, sessionSecret } from "@/lib/admin/config";
import {
  type AdminIdentitySource,
  type Owner,
  type OwnerAccess,
  ownerAccess,
  requireOwner,
  type SignedInIdentity,
} from "@/lib/admin/owner-access";

import "server-only";

/**
 * The Admin session: the signed-in identity, sealed (encrypted and signed)
 * in an httpOnly cookie. No database; the Owner's GitHub token never leaves
 * the server in readable form.
 *
 * Server Components can only read it; `saveSession` and `endSession` run in
 * Route Handlers and Server Actions.
 */

/** Short, as the session holds a token able to commit to the repository. */
const TWELVE_HOURS = 60 * 60 * 12;

const sessionOptions = (): SessionOptions => ({
  cookieName: "admin_session",
  password: sessionSecret(),
  ttl: TWELVE_HOURS,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
  },
});

const session = async () =>
  getIronSession<Partial<SignedInIdentity>>(await cookies(), sessionOptions());

/** The session as the Owner check's identity source. */
export const sessionIdentities: AdminIdentitySource = {
  async current() {
    const { githubId, login, accessToken } = await session();
    if (githubId === undefined || login === undefined) return undefined;
    return { githubId, login, accessToken };
  },
};

export const currentOwnerAccess = (): Promise<OwnerAccess> =>
  ownerAccess(sessionIdentities, ownerGithubId());

/** For Admin actions: the signed-in Owner, or `NotOwnerError`. */
export const requireOwnerSession = (): Promise<Owner> =>
  requireOwner(sessionIdentities, ownerGithubId());

export async function saveSession(identity: SignedInIdentity): Promise<void> {
  const current = await session();
  current.githubId = identity.githubId;
  current.login = identity.login;
  if (identity.accessToken) current.accessToken = identity.accessToken;
  else delete current.accessToken;
  await current.save();
}

export async function endSession(): Promise<void> {
  (await session()).destroy();
}
