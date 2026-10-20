import Link from "next/link";

import {
  createAchievementAction,
  deleteAchievementAction,
  updateAchievementAction,
} from "@/app/admin/achievements/actions";
import { AdminField, AdminForm, LocalizedField } from "@/app/admin/admin-form";
import {
  ContentUnavailableScreen,
  SignOutButton,
} from "@/app/admin/admin-screens";
import { FileField } from "@/app/admin/file-field";
import { RarityField } from "@/app/admin/rarity-field";
import {
  TypographyH2,
  TypographyH3,
  TypographyMuted,
} from "@/components/typography";
import { contentBranch } from "@/lib/admin/config";
import { getAchievementsEditor } from "@/lib/admin/server";
import type { Achievement } from "@/lib/content/types";

const AchievementFields: React.FC<{ achievement?: Achievement }> = ({
  achievement,
}) => (
  <>
    <LocalizedField name="name" label="Nom" defaultValue={achievement?.name} />
    <LocalizedField
      name="description"
      label="Description"
      defaultValue={achievement?.description}
    />
    <div className="grid gap-3 sm:grid-cols-3">
      <AdminField
        name="year"
        label="Année"
        type="number"
        min={2000}
        defaultValue={achievement?.year.toString()}
        placeholder="2025"
      />
      <RarityField defaultValue={achievement?.rarity} />
      <AdminField
        name="link"
        label="Lien (page du site ou URL)"
        defaultValue={achievement?.link}
        placeholder="/mdf-2025"
      />
    </div>
    {/* Left empty, the Achievement keeps its art. */}
    <FileField
      name="art"
      kind="image"
      label={achievement ? "Remplacer l'illustration" : "Illustration"}
      current={achievement?.art}
      required={!achievement}
    />
  </>
);

/** The Owner edits Achievements, as they are on the content branch. */
export default async function AchievementsEditorPage() {
  const editor = await getAchievementsEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, achievements } = editor;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            ← Admin
          </Link>
          <TypographyH2>Achievements</TypographyH2>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <TypographyMuted>
          L&apos;accueil les affiche dans cet ordre. Un lien vers une page du
          site s&apos;écrit sans la langue, par exemple /mdf-2025.
        </TypographyMuted>
        <ul className="flex flex-col gap-3">
          {achievements.map((achievement, index) => (
            // Achievements are addressed by position: keyed by revision too,
            // so a deletion never leaves a form on another Achievement.
            <li
              key={`${revision}-${index}`}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div>
                <TypographyH3>{achievement.name.fr}</TypographyH3>
                <TypographyMuted>{achievement.year}</TypographyMuted>
              </div>
              <AdminForm
                action={updateAchievementAction}
                revision={revision}
                submitLabel="Enregistrer"
              >
                <input type="hidden" name="index" value={index} readOnly />
                <AchievementFields achievement={achievement} />
              </AdminForm>
              <AdminForm
                action={deleteAchievementAction}
                revision={revision}
                submitLabel="Supprimer"
                confirmation={`Supprimer l'Achievement ${achievement.name.fr} ?`}
                destructive
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed p-4">
          <TypographyMuted>Nouvel Achievement</TypographyMuted>
          <AdminForm
            action={createAchievementAction}
            revision={revision}
            submitLabel="Ajouter"
            resetOnSave
            className="mt-3"
          >
            <AchievementFields />
          </AdminForm>
        </div>
      </section>
    </div>
  );
}
