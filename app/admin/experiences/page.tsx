import Link from "next/link";

import {
  AdminField,
  AdminForm,
  FieldError,
  LocalizedField,
} from "@/app/admin/admin-form";
import { SignOutButton } from "@/app/admin/admin-screens";
import {
  createExperienceAction,
  deleteExperienceAction,
  updateExperienceAction,
} from "@/app/admin/experiences/actions";
import { PeriodField } from "@/app/admin/period-field";
import {
  TypographyH2,
  TypographyH3,
  TypographyMuted,
} from "@/components/typography";
import { getExperiencesEditor } from "@/lib/admin/server";
import { formatPeriod } from "@/lib/content/format-period";
import type { ContractType } from "@/lib/content/types";
import fr from "@/messages/fr.json";

/** The contract types, labelled as French Visitors read them. */
const CONTRACT_TYPES = Object.entries(fr.Experiences.contractTypes) as Array<
  [ContractType, string]
>;

const ContractTypeField: React.FC<{ defaultValue?: ContractType }> = ({
  defaultValue,
}) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium">Type de contrat</span>
    <select
      name="contractType"
      defaultValue={defaultValue ?? ""}
      className="rounded-md border border-input bg-background px-3 py-2"
    >
      {!defaultValue && (
        <option value="" disabled>
          Choisir…
        </option>
      )}
      {CONTRACT_TYPES.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
    <FieldError name="contractType" />
  </label>
);

type StoredExperience = Extract<
  Awaited<ReturnType<typeof getExperiencesEditor>>,
  { kind: "owner" }
>["experiences"][number]["experience"];

const ExperienceFields: React.FC<{ experience?: StoredExperience }> = ({
  experience,
}) => (
  <>
    <div className="grid gap-3 sm:grid-cols-2">
      <AdminField
        name="company"
        label="Entreprise"
        defaultValue={experience?.company}
        placeholder="Favikon"
      />
      <AdminField
        name="link"
        label="Lien"
        defaultValue={experience?.link}
        placeholder="https://favikon.com"
      />
    </div>
    <LocalizedField name="role" label="Poste" defaultValue={experience?.role} />
    <ContractTypeField defaultValue={experience?.contractType} />
    <LocalizedField
      name="description"
      label="Description"
      defaultValue={experience?.description}
    />
    <PeriodField name="period" defaultValue={experience?.period} />
  </>
);

/** The Owner edits Experiences, as they are on `main`. */
export default async function ExperiencesEditorPage() {
  const editor = await getExperiencesEditor();
  if (editor.kind !== "owner") return null;
  const { revision, experiences } = editor;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            ← Admin
          </Link>
          <TypographyH2>Experiences</TypographyH2>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <TypographyMuted>
          Le site les affiche de la plus récente à la plus ancienne,
          d&apos;après leur période.
        </TypographyMuted>
        <ul className="flex flex-col gap-3">
          {experiences.map(({ index, experience }) => (
            // Experiences are addressed by position: keyed by revision too,
            // so a deletion never leaves a form on another Experience.
            <li
              key={`${revision}-${index}`}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div>
                <TypographyH3>
                  {experience.company} · {experience.role.fr}
                </TypographyH3>
                <TypographyMuted>
                  {formatPeriod(experience.period, "fr")}
                </TypographyMuted>
              </div>
              <AdminForm
                action={updateExperienceAction}
                revision={revision}
                submitLabel="Enregistrer"
              >
                <input type="hidden" name="index" value={index} readOnly />
                <ExperienceFields experience={experience} />
              </AdminForm>
              <AdminForm
                action={deleteExperienceAction}
                revision={revision}
                submitLabel="Supprimer"
                confirmation={`Supprimer l'Experience ${experience.company} (${experience.role.fr}) ?`}
                destructive
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed p-4">
          <TypographyMuted>Nouvelle Experience</TypographyMuted>
          <AdminForm
            action={createExperienceAction}
            revision={revision}
            submitLabel="Ajouter"
            resetOnSave
            className="mt-3"
          >
            <ExperienceFields />
          </AdminForm>
        </div>
      </section>
    </div>
  );
}
