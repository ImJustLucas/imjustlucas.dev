import { AdminField, AdminForm } from "@/app/admin/admin-form";
import { ContentUnavailableScreen } from "@/app/admin/admin-screens";
import { EditorPage, EntryList, NewEntryRow } from "@/app/admin/editor-frame";
import {
  createTechAction,
  deleteTechAction,
  updateTechAction,
} from "@/app/admin/techs/actions";
import { TechBadge } from "@/components/tech/TechBadge";
import { TypographyData } from "@/components/typography";
import { contentBranch } from "@/lib/admin/config";
import { getTechsEditor } from "@/lib/admin/server";

/**
 * The Owner edits Techs, as they are on the content branch. A Tech has two
 * fields, so each is a short row, always open: its chip as the site draws
 * it, then its name, its colour and its buttons on one line; on narrower
 * panels the deletion moves up beside the chip, away from "Publier".
 */
export default async function TechsEditorPage() {
  const editor = await getTechsEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, techs } = editor;

  return (
    <EditorPage
      title="Techs"
      count={`${techs.length} Techs`}
      addLabel="Ajouter un Tech"
      intro="Les Techs que les Projects peuvent utiliser, avec leur couleur sur le site. L'identifiant ne change plus après l'ajout, et un Tech utilisé par un Project ne peut pas être supprimé."
    >
      <EntryList>
        {techs.map((tech) => (
          <section
            key={tech.id}
            id={`tech-${tech.id}`}
            className="tray grid scroll-mt-[calc(var(--admin-notice,0px)+1rem)] grid-cols-[1fr_auto] items-center gap-4 rounded-lg bg-raised p-4 sm:px-5 lg:flex lg:items-start lg:gap-5"
          >
            <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 lg:w-40 lg:shrink-0 lg:flex-col lg:items-start lg:gap-1.5 lg:pt-7">
              <TechBadge tech={tech} />
              <TypographyData className="truncate text-ink-muted">
                {tech.id}
              </TypographyData>
            </div>
            <AdminForm
              action={updateTechAction}
              revision={revision}
              submitLabel="Publier"
              published={`${tech.name} publié`}
              inline
              className="col-span-2 row-start-2 min-w-0 flex-1 lg:flex-row lg:flex-wrap lg:items-end"
            >
              <input type="hidden" name="id" value={tech.id} readOnly />
              <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
                <AdminField
                  name="name"
                  label="Nom"
                  defaultValue={tech.name}
                  className="min-w-[10rem] flex-1"
                />
                <AdminField
                  name="color"
                  label="Couleur"
                  type="color"
                  defaultValue={tech.color}
                />
              </div>
            </AdminForm>
            <AdminForm
              action={deleteTechAction}
              revision={revision}
              submitLabel="Supprimer"
              published={`${tech.name} supprimé`}
              pendingLabel="Suppression…"
              confirmation={`Supprimer le Tech ${tech.name} ?`}
              tone="delete"
              className="col-start-2 row-start-1 lg:pt-7"
            >
              <input type="hidden" name="id" value={tech.id} readOnly />
            </AdminForm>
          </section>
        ))}
        <NewEntryRow label="Nouveau Tech">
          <AdminForm
            action={createTechAction}
            revision={revision}
            submitLabel="Ajouter et publier"
            published="Tech ajouté"
            resetOnSave
            inline
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
              <AdminField
                name="id"
                label="Identifiant"
                hint="définitif"
                placeholder="tailwind-css"
              />
              <AdminField name="name" label="Nom" placeholder="Tailwind CSS" />
              <AdminField
                name="color"
                label="Couleur"
                type="color"
                defaultValue="#000000"
              />
            </div>
          </AdminForm>
        </NewEntryRow>
      </EntryList>
    </EditorPage>
  );
}
