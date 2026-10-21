import Image from "next/image";

import { ArrowDown, ArrowUp } from "lucide-react";

import { AdminForm, LocalizedField } from "@/app/admin/admin-form";
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
import {
  createHobbyAction,
  deleteHobbyAction,
  moveHobbyAction,
  updateHobbyAction,
} from "@/app/admin/hobbies/actions";
import { PoseField } from "@/app/admin/hobbies/pose-field";
import { contentBranch } from "@/lib/admin/config";
import { getHobbiesEditor } from "@/lib/admin/server";
import { chibiFrames } from "@/lib/chibi";
import type { Hobby } from "@/lib/content/types";

const HobbyFields: React.FC<{ hobby?: Hobby }> = ({ hobby }) => (
  <>
    <LocalizedField name="label" label="Libellé" defaultValue={hobby?.label} />
    <PoseField defaultValue={hobby?.pose} />
  </>
);

const MoveButton: React.FC<{
  revision: string;
  index: number;
  direction: "up" | "down";
}> = ({ revision, index, direction }) => (
  <AdminForm
    action={moveHobbyAction}
    revision={revision}
    submitLabel={direction === "up" ? "Monter" : "Descendre"}
    published="Ordre publié"
    pendingLabel="Déplacement…"
    icon={
      direction === "up" ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />
    }
    tone="step"
  >
    <input type="hidden" name="index" value={index} readOnly />
    <input type="hidden" name="direction" value={direction} readOnly />
  </AdminForm>
);

/**
 * The Owner edits Hobbies, as they are on the content branch, in the home
 * page's order: each row moves up or down from its closed header and opens
 * on its label and pose.
 */
export default async function HobbiesEditorPage() {
  const editor = await getHobbiesEditor();
  if (editor.kind === "unavailable")
    return (
      <ContentUnavailableScreen
        reason={editor.reason}
        branch={contentBranch()}
      />
    );
  if (editor.kind !== "owner") return null;
  const { revision, hobbies } = editor;

  return (
    <EditorPage
      title="Hobbies"
      count={`${hobbies.length} Hobbies`}
      addLabel="Ajouter un Hobby"
      intro="L'accueil les affiche dans cet ordre, chacun avec sa pose de l'avatar."
    >
      <EntryList>
        {hobbies.map((hobby, index) => (
          // Hobbies are addressed by position: keyed by revision too, so a
          // move or a deletion never leaves a form on another Hobby.
          <EntryRow
            key={`${revision}-${index}`}
            id={`hobby-${index}`}
            summary={
              <>
                <span className="relative size-11 shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
                  />
                  <Image
                    src={chibiFrames(hobby.pose)[0]}
                    alt=""
                    width={96}
                    height={96}
                    sizes="44px"
                    // Seven small files, shared by every row: no pop-in
                    loading="eager"
                    className="relative size-full object-contain"
                  />
                </span>
                <EntryName>{hobby.label.fr}</EntryName>
                <EntryFact>
                  place {index + 1} sur {hobbies.length}
                </EntryFact>
              </>
            }
            actions={
              <>
                {index > 0 && (
                  <MoveButton
                    revision={revision}
                    index={index}
                    direction="up"
                  />
                )}
                {index < hobbies.length - 1 && (
                  <MoveButton
                    revision={revision}
                    index={index}
                    direction="down"
                  />
                )}
              </>
            }
          >
            <AdminForm
              action={updateHobbyAction}
              revision={revision}
              submitLabel="Publier"
              published={`${hobby.label.fr} publié`}
              inline
            >
              <input type="hidden" name="index" value={index} readOnly />
              <HobbyFields hobby={hobby} />
            </AdminForm>
            <DangerZone>
              <AdminForm
                action={deleteHobbyAction}
                revision={revision}
                submitLabel="Supprimer ce Hobby"
                pendingLabel="Suppression…"
                published={`${hobby.label.fr} supprimé`}
                confirmation={`Supprimer le Hobby ${hobby.label.fr} ?`}
                tone="delete"
              >
                <input type="hidden" name="index" value={index} readOnly />
              </AdminForm>
            </DangerZone>
          </EntryRow>
        ))}
        <NewEntryRow label="Nouveau Hobby" hint="ajouté en dernier">
          <AdminForm
            action={createHobbyAction}
            revision={revision}
            submitLabel="Ajouter et publier"
            published="Hobby ajouté"
            resetOnSave
            inline
          >
            <HobbyFields />
          </AdminForm>
        </NewEntryRow>
      </EntryList>
    </EditorPage>
  );
}
