import Link from "next/link";

import { AdminForm, LocalizedField, SelectField } from "@/app/admin/admin-form";
import {
  ContentUnavailableScreen,
  SignOutButton,
} from "@/app/admin/admin-screens";
import {
  createHobbyAction,
  deleteHobbyAction,
  moveHobbyAction,
  updateHobbyAction,
} from "@/app/admin/hobbies/actions";
import { TypographyH2, TypographyMuted } from "@/components/typography";
import { contentBranch } from "@/lib/admin/config";
import { getHobbiesEditor } from "@/lib/admin/server";
import type { Hobby, HobbyPose } from "@/lib/content/types";

/** The poses of Lucas's chibi avatar, labelled in French. */
const POSES: ReadonlyArray<readonly [HobbyPose, string]> = [
  ["surf", "surf"],
  ["skate", "skate"],
  ["lol", "LoL"],
  ["coding", "code"],
  ["coffee", "café"],
  ["series", "série"],
  ["music", "musique"],
];

const HobbyFields: React.FC<{ hobby?: Hobby }> = ({ hobby }) => (
  <>
    <LocalizedField name="label" label="Libellé" defaultValue={hobby?.label} />
    <SelectField
      name="pose"
      label="Pose"
      options={POSES}
      defaultValue={hobby?.pose}
    />
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
    submitLabel={direction === "up" ? "↑ Monter" : "↓ Descendre"}
  >
    <input type="hidden" name="index" value={index} readOnly />
    <input type="hidden" name="direction" value={direction} readOnly />
  </AdminForm>
);

/** The Owner edits Hobbies, as they are on the content branch. */
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
    <div className="mx-auto flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            ← Admin
          </Link>
          <TypographyH2>Hobbies</TypographyH2>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <TypographyMuted>
          L&apos;accueil les affiche dans cet ordre, chacun avec sa pose de
          l&apos;avatar.
        </TypographyMuted>
        <ul className="flex flex-col gap-3">
          {hobbies.map((hobby, index) => (
            // Hobbies are addressed by position: keyed by revision too, so a
            // move or a deletion never leaves a form on another Hobby.
            <li
              key={`${revision}-${index}`}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <AdminForm
                action={updateHobbyAction}
                revision={revision}
                submitLabel="Enregistrer"
              >
                <input type="hidden" name="index" value={index} readOnly />
                <HobbyFields hobby={hobby} />
              </AdminForm>
              <div className="flex flex-wrap gap-3">
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
                <AdminForm
                  action={deleteHobbyAction}
                  revision={revision}
                  submitLabel="Supprimer"
                  confirmation={`Supprimer le Hobby ${hobby.label.fr} ?`}
                  destructive
                >
                  <input type="hidden" name="index" value={index} readOnly />
                </AdminForm>
              </div>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed p-4">
          <TypographyMuted>Nouveau Hobby (ajouté en dernier)</TypographyMuted>
          <AdminForm
            action={createHobbyAction}
            revision={revision}
            submitLabel="Ajouter"
            resetOnSave
            className="mt-3"
          >
            <HobbyFields />
          </AdminForm>
        </div>
      </section>
    </div>
  );
}
