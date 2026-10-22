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
  EntryTag,
  NewEntryRow,
} from "@/app/admin/editor-frame";
import { EntryRow } from "@/app/admin/entry-row";
import {
  createPatchAction,
  deletePatchAction,
  updatePatchAction,
} from "@/app/admin/patch-notes/actions";
import { PatchEntriesField } from "@/app/admin/patch-notes/entries-field";
import { PATCH_TAG_LABEL } from "@/app/admin/patch-notes/patch-tag";
import { parisDay } from "@/lib/admin/alerts";
import { contentBranch } from "@/lib/admin/config";
import { getPatchNotesEditor } from "@/lib/admin/server";
import type { Patch, PatchTag } from "@/lib/content/types";

const PatchFields: React.FC<{
  patch?: Patch;
  version?: string;
  date?: string;
}> = ({ patch, version, date }) => (
  <>
    <FieldGroup title="La version">
      <div className="grid gap-4 sm:grid-cols-[9rem_12rem]">
        <AdminField
          name="version"
          label="Version"
          hint="saison.patch"
          defaultValue={patch?.version ?? version}
          placeholder="2.4"
        />
        <AdminField
          name="date"
          label="Date"
          type="date"
          defaultValue={patch?.date ?? date}
        />
      </div>
      <LocalizedField
        name="title"
        label="Titre"
        hint="le nom du patch, en une ligne"
        defaultValue={patch?.title}
        placeholder={{ fr: "L'Arcade ouvre", en: "The Arcade opens" }}
      />
      <AdminField
        name="link"
        label="Lien"
        hint="facultatif, par exemple la pull request"
        defaultValue={patch?.link}
        placeholder="https://github.com/ImJustLucas/imjustlucas.dev/pull/43"
      />
    </FieldGroup>
    <FieldGroup title="Les notes">
      <PatchEntriesField defaultValue={patch?.entries} />
    </FieldGroup>
  </>
);

/** How many lines of each tag, e.g. "3 nouveau · 1 corrigé". */
const tagCounts = (patch: Patch) =>
  (Object.keys(PATCH_TAG_LABEL) as ReadonlyArray<PatchTag>)
    .map((tag) => [tag, patch.entries.filter((e) => e.tag === tag).length])
    .filter(([, count]) => count !== 0)
    .map(([tag, count]) => `${count} ${PATCH_TAG_LABEL[tag as PatchTag]}`)
    .join(" · ")
    .toLowerCase();

/** What tells a Patch apart in its closed row. */
const PatchSummary: React.FC<{ patch: Patch; latest: boolean }> = ({
  patch,
  latest,
}) => (
  <>
    <EntryTag>v{patch.version}</EntryTag>
    <EntryName>{patch.title.fr}</EntryName>
    {latest && <EntryTag tone="live">en ligne</EntryTag>}
    <EntryFact>{patch.date}</EntryFact>
    <EntryFact>{tagCounts(patch)}</EntryFact>
  </>
);

/** The Owner writes the site's patch notes, as they are on the content branch. */
export default async function PatchNotesEditorPage() {
  const editor = await getPatchNotesEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, patches, nextVersion } = editor;

  return (
    <EditorPage
      title="Patch notes"
      count={`${patches.length} versions`}
      addLabel="Ajouter un patch"
      intro="Le site les range par version, la plus récente ouverte en premier. La saison est le premier nombre : 1 pour l'ancien portfolio, 2 pour le Player Profile. Écris comme un joueur, pas comme un commit."
    >
      <EntryList>
        {patches.map(({ index, entry: patch }, i) => (
          // Patches are addressed by position: keyed by revision too, so a
          // deletion never leaves a form on another Patch.
          <EntryRow
            key={`${revision}-${index}`}
            id={`patch-${index}`}
            summary={<PatchSummary patch={patch} latest={i === 0} />}
          >
            <AdminForm
              action={updatePatchAction}
              revision={revision}
              submitLabel="Publier"
              published={`Patch ${patch.version} publié`}
            >
              <input type="hidden" name="index" value={index} readOnly />
              <PatchFields patch={patch} />
            </AdminForm>
            <DangerZone>
              <AdminForm
                action={deletePatchAction}
                revision={revision}
                submitLabel="Supprimer ce patch"
                published={`Patch ${patch.version} supprimé`}
                pendingLabel="Suppression…"
                confirmation={`Supprimer le patch ${patch.version} ?`}
                tone="delete"
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </DangerZone>
          </EntryRow>
        ))}
        <NewEntryRow label="Nouveau patch" hint={`v${nextVersion} proposée`}>
          {/* Keyed by revision: its lines start over once it is published */}
          <AdminForm
            key={revision}
            action={createPatchAction}
            revision={revision}
            submitLabel="Ajouter et publier"
            published="Patch ajouté"
            resetOnSave
          >
            <PatchFields version={nextVersion} date={parisDay(new Date())} />
          </AdminForm>
        </NewEntryRow>
      </EntryList>
    </EditorPage>
  );
}
