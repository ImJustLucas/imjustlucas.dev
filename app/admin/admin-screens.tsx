import { Github } from "lucide-react";

import { signOut } from "@/app/admin/actions";
import { TypographyH2, TypographyP } from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { OwnerAccess } from "@/lib/admin/owner-access";

export const SignOutButton: React.FC = () => (
  <form action={signOut}>
    <Button type="submit" variant="outline" size="sm">
      Se déconnecter
    </Button>
  </form>
);

/** What anyone but the signed-in Owner sees at the Admin path. */
export const SignInScreen: React.FC<{
  access: Exclude<OwnerAccess, { kind: "owner" }>;
}> = ({ access }) => (
  <div className="mx-auto flex max-w-md flex-col items-start gap-4 py-24">
    <TypographyH2>Admin</TypographyH2>
    {access.kind === "refused" ? (
      <>
        <TypographyP>
          Le compte GitHub <strong>@{access.login}</strong> n&apos;a pas accès à
          l&apos;Admin.
        </TypographyP>
        <SignOutButton />
      </>
    ) : (
      <>
        <TypographyP>
          Connecte-toi avec ton compte GitHub pour modifier le contenu du site.
        </TypographyP>
        <Button asChild>
          {/* A full-page navigation: the sign-in Route Handler redirects to
              GitHub, which client-side routing cannot follow. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin/auth/sign-in">
            <Github />
            Se connecter avec GitHub
          </a>
        </Button>
      </>
    )}
  </div>
);
