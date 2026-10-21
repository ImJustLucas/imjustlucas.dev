import { Star } from "lucide-react";

import {
  AdminField,
  AdminForm,
  FieldGroup,
  FlagField,
  LocalizedField,
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
import { FileField } from "@/app/admin/file-field";
import { PeriodField } from "@/app/admin/period-field";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/admin/projects/actions";
import { GalleryField } from "@/app/admin/projects/gallery-field";
import { RarityChip } from "@/app/admin/rarity-chip";
import { RarityField } from "@/app/admin/rarity-field";
import { TechPicker } from "@/app/admin/techs/tech-picker";
import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { TypographyData, TypographyMuted } from "@/components/typography";
import { contentBranch } from "@/lib/admin/config";
import { getProjectsEditor } from "@/lib/admin/server";
import { formatPeriod } from "@/lib/content/format-period";
import type { Tech } from "@/lib/content/types";

type Editor = Extract<
  Awaited<ReturnType<typeof getProjectsEditor>>,
  { kind: "owner" }
>;
type StoredProject = Editor["projects"][number]["project"];

/** Star counts come from GitHub: they have no field here. */
const ProjectFields: React.FC<{
  techs: ReadonlyArray<Tech>;
  project?: StoredProject;
}> = ({ techs, project }) => (
  <>
    <FieldGroup title="L'objet">
      <AdminField
        name="title"
        label="Titre"
        defaultValue={project?.title}
        placeholder="Predi.GG"
      />
      <LocalizedField
        name="description"
        label="Description"
        multiline
        defaultValue={project?.description}
      />
      <RarityField defaultValue={project?.rarity} />
    </FieldGroup>
    <FieldGroup title="Quand et avec quoi">
      <PeriodField name="period" defaultValue={project?.period} />
      <TechPicker techs={techs} selected={project?.techs} />
    </FieldGroup>
    <FieldGroup title="Sur le site">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left empty, the Project is not on the home page. */}
        <AdminField
          name="featured"
          label="Place sur l'accueil"
          hint="facultatif, 1 en premier"
          type="number"
          min={1}
          defaultValue={project?.featured?.toString()}
          placeholder="Pas sur l'accueil"
        />
        <div className="hidden lg:block" />
        <AdminField
          name="externalLink"
          label="Lien du site"
          hint="facultatif"
          defaultValue={project?.externalLink}
          placeholder="https://predi.gg"
        />
        <AdminField
          name="repository"
          label="Dépôt GitHub"
          hint="facultatif"
          defaultValue={project?.repository}
          placeholder="https://github.com/ImJustLucas/imjustlucas.dev"
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <FlagField
          name="openSource"
          label="Open source"
          hint="Affiche le bouton GitHub"
          defaultChecked={project?.openSource}
        />
        <FlagField
          name="wip"
          label="En cours de développement"
          hint="Affiche le tag WIP"
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
    </FieldGroup>
    <FieldGroup title="Sa page">
      {project ? (
        <TypographyMuted>
          Adresse{" "}
          <TypographyData className="text-ink">
            /what/{project.slug}
          </TypographyData>{" "}
          · fixée à la création, pour que les liens partagés marchent toujours
        </TypographyMuted>
      ) : (
        <AdminField
          name="slug"
          label="Adresse de sa page"
          hint="facultatif, tirée du titre si vide, fixée ensuite"
          placeholder="predi-gg"
        />
      )}
      {/* Every text is optional: the page reads well with only the card's. */}
      <LocalizedField
        name="role"
        label="Mon rôle"
        hint="facultatif"
        defaultValue={project?.role}
        placeholder={{
          fr: "Fondateur et développeur",
          en: "Founder and developer",
        }}
      />
      <LocalizedField
        name="context"
        label="Le contexte"
        hint="facultatif · pourquoi il existe, le problème · une ligne vide entre deux paragraphes"
        multiline
        defaultValue={project?.context}
      />
      <LocalizedField
        name="built"
        label="Ce que j'ai construit"
        hint="facultatif"
        multiline
        defaultValue={project?.built}
      />
      <LocalizedField
        name="outcome"
        label="Le résultat"
        hint="facultatif · utilisateurs, chiffres, ce que j'en ai appris"
        multiline
        defaultValue={project?.outcome}
      />
      <GalleryField current={project?.gallery} />
    </FieldGroup>
  </>
);

/** What tells a Project apart in its closed row. */
const ProjectSummary: React.FC<{ project: StoredProject }> = ({ project }) => (
  <>
    <EntryName>{project.title}</EntryName>
    <RarityChip rarity={project.rarity} />
    <EntryFact>{formatPeriod(project.period, "fr")}</EntryFact>
    {project.wip && <EntryTag>WIP</EntryTag>}
    {project.featured !== undefined && (
      <EntryTag>
        <Star aria-hidden className="size-3" />
        accueil {project.featured}
      </EntryTag>
    )}
    {project.techs.length === 0 && (
      <EntryTag tone="warning">sans Tech</EntryTag>
    )}
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
    <EditorPage
      title="Projects"
      count={`${projects.length} Projects`}
      addLabel="Ajouter un Project"
      intro="Le site les affiche du plus récent au plus ancien, d'après leur période. L'accueil montre les trois premiers d'après leur place sur l'accueil. Le nombre d'étoiles vient de GitHub."
    >
      <EntryList>
        {projects.map(({ index, project }) => (
          // Projects are addressed by position: keyed by revision too, so
          // a deletion never leaves a form on another Project.
          <EntryRow
            key={`${revision}-${index}`}
            id={`project-${index}`}
            summary={<ProjectSummary project={project} />}
            band={RARITY_STYLE[project.rarity].frame}
          >
            <AdminForm
              action={updateProjectAction}
              revision={revision}
              submitLabel="Publier"
              published={`${project.title} publié`}
            >
              <input type="hidden" name="index" value={index} readOnly />
              <ProjectFields techs={techs} project={project} />
            </AdminForm>
            <DangerZone>
              <AdminForm
                action={deleteProjectAction}
                revision={revision}
                submitLabel="Supprimer ce Project"
                published={`${project.title} supprimé`}
                pendingLabel="Suppression…"
                confirmation={`Supprimer le Project ${project.title} ?`}
                tone="delete"
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </DangerZone>
          </EntryRow>
        ))}
        <NewEntryRow label="Nouveau Project">
          <AdminForm
            action={createProjectAction}
            revision={revision}
            submitLabel="Ajouter et publier"
            published="Project ajouté"
            resetOnSave
          >
            <ProjectFields techs={techs} />
          </AdminForm>
        </NewEntryRow>
      </EntryList>
    </EditorPage>
  );
}
