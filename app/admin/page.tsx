import Link from "next/link";

import { SignOutButton } from "@/app/admin/admin-screens";
import { TypographyH2, TypographyP } from "@/components/typography";
import { currentOwnerAccess } from "@/lib/admin/session";

/** The Admin home: one entry per editor. */
export default async function AdminHome() {
  const access = await currentOwnerAccess();
  if (access.kind !== "owner") return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <TypographyH2>Admin</TypographyH2>
        <SignOutButton />
      </header>
      <TypographyP>
        Bonjour {access.owner.login}. Chaque enregistrement est publié
        directement sur <code>main</code> et sera en ligne environ une minute
        plus tard.
      </TypographyP>
      <ul className="list-disc pl-6">
        <li>
          <Link href="/admin/techs" className="underline underline-offset-4">
            Techs et Tech categories
          </Link>
        </li>
      </ul>
    </div>
  );
}
