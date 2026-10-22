import { FileText } from "lucide-react";

import {
  AdminField,
  AdminForm,
  FieldGroup,
  LocalizedField,
} from "@/app/admin/admin-form";
import { ContentUnavailableScreen } from "@/app/admin/admin-screens";
import { EditorPage, EntryTag } from "@/app/admin/editor-frame";
import { FileField } from "@/app/admin/file-field";
import {
  updateProfileAction,
  updateRecruiterAction,
  uploadResumeAction,
} from "@/app/admin/profile/actions";
import { LanguagesField } from "@/app/admin/profile/languages-field";
import {
  TypographyData,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { type Locale, routing } from "@/i18n/routing";
import {
  monthsBetween,
  parisDay,
  RESUME_MAX_AGE_MONTHS,
} from "@/lib/admin/alerts";
import { contentBranch } from "@/lib/admin/config";
import { getProfileEditor } from "@/lib/admin/server";

/** One Resume per Locale. */
const RESUME_LABELS: { readonly [L in Locale]: string } = {
  en: "CV anglais",
  fr: "CV français",
};

const LINKS = [
  ["github", "GitHub", "https://github.com/ImJustLucas"],
  ["linkedin", "LinkedIn", "https://www.linkedin.com/in/lucasbellier/"],
  ["youtube", "YouTube", "https://www.youtube.com/channel/UC…"],
  ["instagram", "Instagram", "https://www.instagram.com/imjustlucas_/"],
] as const;

const day = new Intl.DateTimeFormat("fr", {
  dateStyle: "long",
  timeZone: "UTC",
});

const age = (months: number) =>
  months < 1 ? "ce mois-ci" : `il y a ${months} mois`;

/** The Owner edits the Profile, as it is on the content branch. */
export default async function ProfileEditorPage() {
  const editor = await getProfileEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, profile } = editor;
  const today = parisDay(new Date());

  return (
    <EditorPage
      title="Profile"
      intro="Les liens de la barre latérale et de la page contact, les comptes que le site lit en direct, les CV que le bouton de l'accueil télécharge, et ce que dit le mode recruteur."
    >
      <section
        id="cv"
        aria-labelledby="cv-title"
        className="flex scroll-mt-[calc(var(--admin-notice,0px)+1rem)] flex-col gap-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <TypographyTitle id="cv-title">CV</TypographyTitle>
          <TypographyMuted className="text-label font-normal text-ink-muted">
            Le nouveau PDF remplace l&apos;actuel, à la même adresse, et sa date
            de mise à jour devient celle du jour.
          </TypographyMuted>
        </div>
        <ul className="grid gap-3 xl:grid-cols-2">
          {routing.locales.map((locale) => {
            const resume = profile.resumes[locale];
            const months = monthsBetween(resume.lastUpdated, today);
            const stale = months >= RESUME_MAX_AGE_MONTHS;
            return (
              <li
                key={locale}
                id={`cv-${locale}`}
                className="tray flex scroll-mt-[calc(var(--admin-notice,0px)+1rem)] flex-col gap-4 rounded-lg bg-raised p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-ground text-ink-muted ring-2 ring-seam">
                    <FileText aria-hidden className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-title text-ink">
                        {RESUME_LABELS[locale]}
                      </span>
                      {stale && (
                        <EntryTag tone="warning">
                          plus de {RESUME_MAX_AGE_MONTHS} mois
                        </EntryTag>
                      )}
                    </span>
                    <TypographyData className="text-ink-muted">
                      {day.format(new Date(resume.lastUpdated))} · {age(months)}
                    </TypographyData>
                    <a
                      href={resume.asset}
                      target="_blank"
                      rel="noreferrer"
                      className="w-fit truncate font-mono text-data text-ink underline decoration-seam decoration-2 underline-offset-4 hover:decoration-action-ink"
                    >
                      {resume.asset}
                    </a>
                  </div>
                </div>
                <AdminForm
                  action={uploadResumeAction}
                  revision={revision}
                  submitLabel="Publier ce CV"
                  published={`${RESUME_LABELS[locale]} publié`}
                  resetOnSave
                  inline
                >
                  <input type="hidden" name="locale" value={locale} readOnly />
                  <FileField
                    name="file"
                    kind="pdf"
                    label="Nouveau PDF"
                    required
                  />
                </AdminForm>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="links-title"
        className="tray flex flex-col gap-4 rounded-lg bg-raised p-4 sm:p-5"
      >
        <TypographyTitle id="links-title">Liens et comptes</TypographyTitle>
        <AdminForm
          action={updateProfileAction}
          revision={revision}
          submitLabel="Publier"
          published="Liens et comptes publiés"
        >
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {LINKS.map(([key, label, placeholder]) => (
                <AdminField
                  key={key}
                  name={`links.${key}`}
                  label={label}
                  hint={key === "youtube" ? "celui de la chaîne" : undefined}
                  defaultValue={profile.links[key]}
                  placeholder={placeholder}
                />
              ))}
            </div>
            <TypographyMuted className="text-label font-normal text-ink-muted">
              Le lien YouTube doit être celui de la chaîne :
              https://www.youtube.com/channel/ suivi de son identifiant.
            </TypographyMuted>
          </div>
          <FieldGroup title="Comptes lus en direct">
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminField
                name="youtubeChannelId"
                label="Identifiant de la chaîne YouTube"
                hint="les vidéos"
                defaultValue={profile.youtubeChannelId}
                placeholder="UCLw4N_gccAY1Y4K4S20IPog"
              />
              <AdminField
                name="discordUserId"
                label="Identifiant du compte Discord"
                hint="la présence"
                defaultValue={profile.discordUserId}
                placeholder="127063570616811520"
              />
            </div>
          </FieldGroup>
        </AdminForm>
      </section>

      <section
        id="recruiter"
        aria-labelledby="recruiter-title"
        className="tray flex scroll-mt-[calc(var(--admin-notice,0px)+1rem)] flex-col gap-4 rounded-lg bg-raised p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <TypographyTitle id="recruiter-title">Mode recruteur</TypographyTitle>
          <a
            href="/fr/cv"
            target="_blank"
            rel="noreferrer"
            className="text-label text-ink underline decoration-seam decoration-2 underline-offset-4 hover:decoration-action-ink"
          >
            voir la page /cv
          </a>
        </div>
        <AdminForm
          action={updateRecruiterAction}
          revision={revision}
          submitLabel="Publier"
          published="Mode recruteur publié"
        >
          <LocalizedField
            name="summary"
            label="Résumé"
            hint="sous ton nom, 2 ou 3 phrases"
            multiline
            defaultValue={profile.summary}
          />
          <LocalizedField
            name="availability"
            label="Disponibilité"
            hint="la pastille verte"
            defaultValue={profile.availability}
            placeholder={{
              fr: "ouvert aux opportunités · Paris ou remote",
              en: "open to opportunities · Paris or remote",
            }}
          />
          <LanguagesField defaultValue={profile.languages} />
        </AdminForm>
      </section>
    </EditorPage>
  );
}
