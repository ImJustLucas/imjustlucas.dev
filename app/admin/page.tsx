import { SignOutButton } from "@/app/admin/admin-screens";
import { TypographyH2, TypographyP } from "@/components/typography";
import { currentOwnerAccess } from "@/lib/admin/session";

/** The Admin home, empty until the editing screens arrive. */
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
        Bonjour {access.owner.login}, rien à modifier ici pour le moment.
      </TypographyP>
    </div>
  );
}
