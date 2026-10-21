import { Briefcase } from "lucide-react";

import {
  AdminField,
  AdminForm,
  FieldGroup,
  LocalizedField,
  SelectField,
} from "@/app/admin/admin-form";
import { ContentUnavailableScreen } from "@/app/admin/admin-screens";
import {
  DangerZone,
  EditorPage,
  EntryFact,
  EntryList,
  EntryName,
  EntryTag,
  NewEntryRow,
} from "@/app/admin/editor-frame";
import { EntryRow } from "@/app/admin/entry-row";
import {
  createExperienceAction,
  deleteExperienceAction,
  updateExperienceAction,
} from "@/app/admin/experiences/actions";
import { PeriodField } from "@/app/admin/period-field";
import { contentBranch } from "@/lib/admin/config";
import { getExperiencesEditor } from "@/lib/admin/server";
import { formatPeriod } from "@/lib/content/format-period";
import type { ContractType } from "@/lib/content/types";
import fr from "@/messages/fr.json";

/** The contract types, labelled as French Visitors read them. */
const CONTRACT_TYPES = Object.entries(fr.Experiences.contractTypes) as Array<
  [ContractType, string]
>;

type StoredExperience = Extract<
  Awaited<ReturnType<typeof getExperiencesEditor>>,
  { kind: "owner" }
>["experiences"][number]["experience"];

const ExperienceFields: React.FC<{ experience?: StoredExperience }> = ({
  experience,
}) => (
  <>
    <FieldGroup title="Le poste">
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <AdminField
          name="company"
          label="Entreprise"
          defaultValue={experience?.company}
          placeholder="Favikon"
        />
        <AdminField
          name="emoji"
          label="Emoji"
          hint="facultatif"
          defaultValue={experience?.emoji}
          placeholder="💜"
        />
      </div>
      <LocalizedField
        name="role"
        label="Poste"
        defaultValue={experience?.role}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          name="contractType"
          label="Type de contrat"
          options={CONTRACT_TYPES}
          defaultValue={experience?.contractType}
        />
        <AdminField
          name="link"
          label="Lien"
          defaultValue={experience?.link}
          placeholder="https://favikon.com"
        />
      </div>
    </FieldGroup>
    <FieldGroup title="Quand">
      <PeriodField name="period" defaultValue={experience?.period} />
    </FieldGroup>
    <FieldGroup title="Ce que j'y fais">
      <LocalizedField
        name="description"
        label="Description"
        multiline
        defaultValue={experience?.description}
      />
    </FieldGroup>
  </>
);

/** What tells an Experience apart in its closed row. */
const ExperienceSummary: React.FC<{ experience: StoredExperience }> = ({
  experience,
}) => (
  <>
    <span
      aria-hidden
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ground text-lg ring-2 ring-seam"
    >
      {experience.emoji ?? <Briefcase className="size-4 text-ink-muted" />}
    </span>
    <span className="flex min-w-0 flex-col">
      <EntryName>{experience.company}</EntryName>
      <span className="truncate text-label text-ink-muted">
        {experience.role.fr}
      </span>
    </span>
    <span className="flex flex-wrap items-center gap-2">
      <EntryFact>{formatPeriod(experience.period, "fr")}</EntryFact>
      {experience.period.end === "ongoing" && (
        <EntryTag tone="live">en cours</EntryTag>
      )}
      <EntryTag>
        {fr.Experiences.contractTypes[experience.contractType]}
      </EntryTag>
    </span>
  </>
);

/** The Owner edits Experiences, as they are on the content branch. */
export default async function ExperiencesEditorPage() {
  const editor = await getExperiencesEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, experiences } = editor;

  return (
    <EditorPage
      title="Experiences"
      count={`${experiences.length} Experiences`}
      addLabel="Ajouter une Experience"
      intro="Le site les affiche de la plus récente à la plus ancienne, d'après leur période. Celles en cours forment l'équipe actuelle de l'accueil."
    >
      <EntryList>
        {experiences.map(({ index, experience }) => (
          // Experiences are addressed by position: keyed by revision too,
          // so a deletion never leaves a form on another Experience.
          <EntryRow
            key={`${revision}-${index}`}
            id={`experience-${index}`}
            summary={<ExperienceSummary experience={experience} />}
          >
            <AdminForm
              action={updateExperienceAction}
              revision={revision}
              submitLabel="Publier"
              published={`${experience.company} publiée`}
            >
              <input type="hidden" name="index" value={index} readOnly />
              <ExperienceFields experience={experience} />
            </AdminForm>
            <DangerZone>
              <AdminForm
                action={deleteExperienceAction}
                revision={revision}
                submitLabel="Supprimer cette Experience"
                published={`${experience.company} supprimée`}
                pendingLabel="Suppression…"
                confirmation={`Supprimer l'Experience ${experience.company} (${experience.role.fr}) ?`}
                tone="delete"
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </DangerZone>
          </EntryRow>
        ))}
        <NewEntryRow label="Nouvelle Experience">
          <AdminForm
            action={createExperienceAction}
            revision={revision}
            submitLabel="Ajouter et publier"
            published="Experience ajoutée"
            resetOnSave
          >
            <ExperienceFields />
          </AdminForm>
        </NewEntryRow>
      </EntryList>
    </EditorPage>
  );
}
