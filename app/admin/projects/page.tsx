import Link from "next/link";

import { AdminField, AdminForm, LocalizedField } from "@/app/admin/admin-form";
import {
  ContentUnavailableScreen,
  SignOutButton,
} from "@/app/admin/admin-screens";
import { FileField } from "@/app/admin/file-field";
import { PeriodField } from "@/app/admin/period-field";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/admin/projects/actions";
import { TechPicker } from "@/app/admin/techs/tech-picker";
import {
  TypographyH2,
  TypographyH3,
  TypographyMuted,
} from "@/components/typography";
import { contentBranch } from "@/lib/admin/config";
import { getProjectsEditor } from "@/lib/admin/server";
import { formatPeriod } from "@/lib/content/format-period";
import type { Tech } from "@/lib/content/types";

type Editor = Extract<
  Awaited<ReturnType<typeof getProjectsEditor>>,
  { kind: "owner" }
>;
type StoredProject = Editor["projects"][number]["project"];

const Flag: React.FC<{
  name: string;
  label: string;
  defaultChecked?: boolean;
}> = ({ name, label, defaultChecked }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" name={name} defaultChecked={defaultChecked} />
    {label}
  </label>
);

/** Star counts come from GitHub: they have no field here. */
const ProjectFields: React.FC<{
  techs: ReadonlyArray<Tech>;
  project?: StoredProject;
}> = ({ techs, project }) => (
  <>
    <AdminField
      name="title"
      label="Titre"
      defaultValue={project?.title}
      placeholder="Predi.GG"
    />
    <LocalizedField
      name="description"
      label="Description"
      defaultValue={project?.description}
    />
    <PeriodField name="period" defaultValue={project?.period} />
    <TechPicker techs={techs} selected={project?.techs} />
    <div className="grid gap-3 sm:grid-cols-2">
      <AdminField
        name="externalLink"
        label="Lien du site (facultatif)"
        defaultValue={project?.externalLink}
        placeholder="https://predi.gg"
      />
      <AdminField
        name="repository"
        label="Dépôt GitHub (facultatif)"
        defaultValue={project?.repository}
        placeholder="https://github.com/ImJustLucas/imjustlucas.dev"
      />
    </div>
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      <Flag
        name="openSource"
        label="Open source (affiche le bouton GitHub)"
        defaultChecked={project?.openSource}
      />
      <Flag
        name="wip"
        label="En cours de développement (WIP)"
        defaultChecked={project?.wip}
      />
    </div>
    {/* Left empty, the Project keeps its image. */}
    <FileField
      name="image"
      kind="image"
      label={project?.image ? "Remplacer l'image" : "Image"}
      current={project?.image}
    />
  </>
);

/** The Owner edits Projects, as they are on the content branch. */
export default async function ProjectsEditorPage() {
  const editor = await getProjectsEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, techs, projects } = editor;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            ← Admin
          </Link>
          <TypographyH2>Projects</TypographyH2>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <TypographyMuted>
          Le site les affiche du plus récent au plus ancien, d&apos;après leur
          période. Le nombre d&apos;étoiles vient de GitHub.
        </TypographyMuted>
        <ul className="flex flex-col gap-3">
          {projects.map(({ index, project }) => (
            // Projects are addressed by position: keyed by revision too, so
            // a deletion never leaves a form on another Project.
            <li
              key={`${revision}-${index}`}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div>
                <TypographyH3>{project.title}</TypographyH3>
                <TypographyMuted>
                  {formatPeriod(project.period, "fr")}
                </TypographyMuted>
              </div>
              <AdminForm
                action={updateProjectAction}
                revision={revision}
                submitLabel="Enregistrer"
              >
                <input type="hidden" name="index" value={index} readOnly />
                <ProjectFields techs={techs} project={project} />
              </AdminForm>
              <AdminForm
                action={deleteProjectAction}
                revision={revision}
                submitLabel="Supprimer"
                confirmation={`Supprimer le Project ${project.title} ?`}
                destructive
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed p-4">
          <TypographyMuted>Nouveau Project</TypographyMuted>
          <AdminForm
            action={createProjectAction}
            revision={revision}
            submitLabel="Ajouter"
            resetOnSave
            className="mt-3"
          >
            <ProjectFields techs={techs} />
          </AdminForm>
        </div>
      </section>
    </div>
  );
}
