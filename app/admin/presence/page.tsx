import { EditorPage } from "@/app/admin/editor-frame";
import { PresenceGallery } from "@/app/admin/presence/presence-gallery";
import { currentOwnerAccess } from "@/lib/admin/session";
import { getProfile } from "@/lib/content/server";

/**
 * Every state of the presence, as visitors see it: the live one, then each
 * card and pose with sample data, since most only show while Lucas plays,
 * codes, watches or listens. Nothing here is saved.
 */
export default async function PresenceAdminPage() {
  const access = await currentOwnerAccess();
  if (access.kind !== "owner") return null;
  const profile = await getProfile();

  return (
    <EditorPage
      title="Présence"
      count="aperçu"
      intro="Ta présence Discord telle que les visiteurs la voient : en direct, puis chaque état avec des données d'exemple. Rien n'est enregistré ici."
    >
      <PresenceGallery discordUserId={profile.discordUserId} />
    </EditorPage>
  );
}
