import Link from "next/link";

import { AdminField, AdminForm, LocalizedField } from "@/app/admin/admin-form";
import {
  ContentUnavailableScreen,
  SignOutButton,
} from "@/app/admin/admin-screens";
import {
  createTechAction,
  createTechCategoryAction,
  deleteTechAction,
  deleteTechCategoryAction,
  updateTechAction,
  updateTechCategoryAction,
} from "@/app/admin/techs/actions";
import { TechPicker } from "@/app/admin/techs/tech-picker";
import { TechBadge } from "@/components/tech/TechBadge";
import {
  TypographyH2,
  TypographyH3,
  TypographyMuted,
} from "@/components/typography";
import { contentBranch } from "@/lib/admin/config";
import { getTechsEditor } from "@/lib/admin/server";

/** The Owner edits Techs and Tech categories, as they are on the content branch. */
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
  const { revision, techs, techCategories } = editor;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            ← Admin
          </Link>
          <TypographyH2>Techs et Tech categories</TypographyH2>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <TypographyH3>Techs</TypographyH3>
        <ul className="flex flex-col gap-3">
          {techs.map((tech) => (
            <li
              key={tech.id}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <TechBadge tech={tech} />
                <TypographyMuted>{tech.id}</TypographyMuted>
              </div>
              <AdminForm
                action={updateTechAction}
                revision={revision}
                submitLabel="Enregistrer"
              >
                <input type="hidden" name="id" value={tech.id} readOnly />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <AdminField
                    name="name"
                    label="Nom"
                    defaultValue={tech.name}
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
                confirmation={`Supprimer le Tech ${tech.name} ?`}
                destructive
              >
                <input type="hidden" name="id" value={tech.id} readOnly />
              </AdminForm>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed p-4">
          <TypographyMuted>Nouveau Tech</TypographyMuted>
          <AdminForm
            action={createTechAction}
            revision={revision}
            submitLabel="Ajouter"
            resetOnSave
            className="mt-3"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <AdminField
                name="id"
                label="Identifiant (définitif)"
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
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <TypographyH3>Tech categories</TypographyH3>
        <ul className="flex flex-col gap-3">
          {techCategories.map((category, index) => (
            // Tech categories are addressed by position: keyed by revision
            // too, so a deletion never leaves a form on another category.
            <li
              key={`${revision}-${index}`}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <AdminForm
                action={updateTechCategoryAction}
                revision={revision}
                submitLabel="Enregistrer"
              >
                <input type="hidden" name="index" value={index} readOnly />
                <LocalizedField
                  name="name"
                  label="Nom"
                  defaultValue={category.name}
                />
                <LocalizedField
                  name="description"
                  label="Description"
                  defaultValue={category.description}
                />
                <TechPicker techs={techs} selected={category.techs} />
              </AdminForm>
              <AdminForm
                action={deleteTechCategoryAction}
                revision={revision}
                submitLabel="Supprimer"
                confirmation={`Supprimer la Tech category ${category.name.fr} ?`}
                destructive
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed p-4">
          <TypographyMuted>Nouvelle Tech category</TypographyMuted>
          <AdminForm
            action={createTechCategoryAction}
            revision={revision}
            submitLabel="Ajouter"
            resetOnSave
            className="mt-3"
          >
            <LocalizedField name="name" label="Nom" />
            <LocalizedField name="description" label="Description" />
            <TechPicker techs={techs} />
          </AdminForm>
        </div>
      </section>
    </div>
  );
}
