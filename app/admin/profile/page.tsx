import Link from "next/link";

import { AdminField, AdminForm } from "@/app/admin/admin-form";
import { SignOutButton } from "@/app/admin/admin-screens";
import { FileField } from "@/app/admin/file-field";
import {
  updateProfileAction,
  uploadResumeAction,
} from "@/app/admin/profile/actions";
import {
  TypographyH2,
  TypographyH3,
  TypographyMuted,
} from "@/components/typography";
import { type Locale, routing } from "@/i18n/routing";
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

/** The Owner edits the Profile, as it is on `main`. */
export default async function ProfileEditorPage() {
  const editor = await getProfileEditor();
  if (editor.kind !== "owner") return null;
  const { revision, profile } = editor;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            ← Admin
          </Link>
          <TypographyH2>Profile</TypographyH2>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <TypographyH3>Liens et comptes</TypographyH3>
        <TypographyMuted>
          Le lien YouTube doit être celui de la chaîne :
          https://www.youtube.com/channel/ suivi de son identifiant.
        </TypographyMuted>
        <AdminForm
          action={updateProfileAction}
          revision={revision}
          submitLabel="Enregistrer"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {LINKS.map(([key, label, placeholder]) => (
              <AdminField
                key={key}
                name={`links.${key}`}
                label={label}
                defaultValue={profile.links[key]}
                placeholder={placeholder}
              />
            ))}
            <AdminField
              name="youtubeChannelId"
              label="Identifiant de la chaîne YouTube"
              defaultValue={profile.youtubeChannelId}
              placeholder="UCLw4N_gccAY1Y4K4S20IPog"
            />
            <AdminField
              name="discordUserId"
              label="Identifiant du compte Discord (Presence)"
              defaultValue={profile.discordUserId}
              placeholder="127063570616811520"
            />
          </div>
        </AdminForm>
      </section>

      <section className="flex flex-col gap-4">
        <TypographyH3>CV</TypographyH3>
        <TypographyMuted>
          Le nouveau PDF remplace l&apos;actuel, à la même adresse, et sa date
          de mise à jour devient celle du jour.
        </TypographyMuted>
        <ul className="grid gap-3 sm:grid-cols-2">
          {routing.locales.map((locale) => {
            const label = RESUME_LABELS[locale];
            const resume = profile.resumes[locale];
            return (
              <li
                key={locale}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                <div>
                  <TypographyH3>{label}</TypographyH3>
                  <TypographyMuted>
                    <a
                      href={resume.asset}
                      className="underline underline-offset-4"
                    >
                      {resume.asset}
                    </a>
                    , mis à jour le {day.format(new Date(resume.lastUpdated))}
                  </TypographyMuted>
                </div>
                <AdminForm
                  action={uploadResumeAction}
                  revision={revision}
                  submitLabel="Publier ce CV"
                  resetOnSave
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
    </div>
  );
}
