import {
  createAchievementAction,
  deleteAchievementAction,
  updateAchievementAction,
} from "@/app/admin/achievements/actions";
import {
  AdminField,
  AdminForm,
  FieldGroup,
  LocalizedField,
} from "@/app/admin/admin-form";
import { ContentUnavailableScreen } from "@/app/admin/admin-screens";
import {
  DangerZone,
  EditorPage,
  EntryFact,
  EntryList,
  EntryName,
  NewEntryRow,
} from "@/app/admin/editor-frame";
import { EntryRow } from "@/app/admin/entry-row";
import { FileField } from "@/app/admin/file-field";
import { RarityChip } from "@/app/admin/rarity-chip";
import { RarityField } from "@/app/admin/rarity-field";
import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { contentBranch } from "@/lib/admin/config";
import { getAchievementsEditor } from "@/lib/admin/server";
import type { Achievement } from "@/lib/content/types";

const AchievementFields: React.FC<{ achievement?: Achievement }> = ({
  achievement,
}) => (
  <>
    <FieldGroup title="Le succès">
      <LocalizedField
        name="name"
        label="Nom"
        defaultValue={achievement?.name}
      />
      <LocalizedField
        name="description"
        label="Description"
        multiline
        defaultValue={achievement?.description}
      />
      <RarityField defaultValue={achievement?.rarity} />
    </FieldGroup>
    <FieldGroup title="Sur le site">
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <AdminField
          name="year"
          label="Année"
          type="number"
          min={2000}
          defaultValue={achievement?.year.toString()}
          placeholder="2025"
        />
        <AdminField
          name="link"
          label="Lien"
          hint="page du site ou URL"
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
    </FieldGroup>
  </>
);

/** What tells an Achievement apart in its closed row. */
const AchievementSummary: React.FC<{ achievement: Achievement }> = ({
  achievement,
}) => (
  <>
    <span className="inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-ground ring-2 ring-seam">
      {/* A site path, at icon size: no optimisation needed */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={achievement.art} alt="" className="size-full object-contain" />
    </span>
    <EntryName>{achievement.name.fr}</EntryName>
    <RarityChip rarity={achievement.rarity} />
    <EntryFact>{achievement.year}</EntryFact>
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
    <EditorPage
      title="Achievements"
      count={`${achievements.length} Achievements`}
      addLabel="Ajouter un Achievement"
      intro="L'accueil les affiche dans cet ordre. Un lien vers une page du site s'écrit sans la langue, par exemple /mdf-2025."
    >
      <EntryList>
        {achievements.map((achievement, index) => (
          // Achievements are addressed by position: keyed by revision too,
          // so a deletion never leaves a form on another Achievement.
          <EntryRow
            key={`${revision}-${index}`}
            id={`achievement-${index}`}
            summary={<AchievementSummary achievement={achievement} />}
            band={RARITY_STYLE[achievement.rarity].frame}
          >
            <AdminForm
              action={updateAchievementAction}
              revision={revision}
              submitLabel="Publier"
              published={`${achievement.name.fr} publié`}
            >
              <input type="hidden" name="index" value={index} readOnly />
              <AchievementFields achievement={achievement} />
            </AdminForm>
            <DangerZone>
              <AdminForm
                action={deleteAchievementAction}
                revision={revision}
                submitLabel="Supprimer cet Achievement"
                published={`${achievement.name.fr} supprimé`}
                pendingLabel="Suppression…"
                confirmation={`Supprimer l'Achievement ${achievement.name.fr} ?`}
                tone="delete"
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </DangerZone>
          </EntryRow>
        ))}
        <NewEntryRow label="Nouvel Achievement">
          <AdminForm
            action={createAchievementAction}
            revision={revision}
            submitLabel="Ajouter et publier"
            published="Achievement ajouté"
            resetOnSave
          >
            <AchievementFields />
          </AdminForm>
        </NewEntryRow>
      </EntryList>
    </EditorPage>
  );
}
