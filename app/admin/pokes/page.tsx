import { Hand } from "lucide-react";

import { AdminForm } from "@/app/admin/admin-form";
import {
  EditorPage,
  EntryFact,
  EntryList,
  EntryName,
  EntryTag,
} from "@/app/admin/editor-frame";
import { waveBackAction } from "@/app/admin/pokes/actions";
import { TypographyMuted } from "@/components/typography";
import { currentOwnerAccess } from "@/lib/admin/session";
import { EMOTE_GLYPH } from "@/lib/poke/emotes";
import type { RecentPoke } from "@/lib/poke/result";
import { getRecentPokes, pokeEnabled } from "@/lib/poke/server";

const LANGUAGE = { en: "anglais", fr: "français" } as const;

const SENT_AT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

/**
 * The Pokes of the last week, newest first, as Discord announced them:
 * the Owner waves back, and the visitor sees it on their next visit. Where
 * a visitor was is never kept, so it is not listed. Nothing is committed.
 */
export default async function PokesAdminPage() {
  const access = await currentOwnerAccess();
  if (access.kind !== "owner") return null;
  const recent = await getRecentPokes();

  return (
    <EditorPage
      title="Coucous"
      count={
        recent.kind === "pokes"
          ? `${recent.pokes.length} cette semaine`
          : undefined
      }
      intro="Les coucous des visiteurs, comme Discord te les a annoncés. Fais coucou en retour : le visiteur le voit à sa prochaine visite. Ils sont gardés une semaine, avec le prénom du visiteur s'il en a donné un, jamais son adresse ni sa ville."
    >
      <EntryList>
        {!pokeEnabled() ? (
          <TypographyMuted>
            Le bouton est caché aux visiteurs : ajoute DISCORD_POKE_WEBHOOK_URL
            sur Vercel (docs/poke.md).
          </TypographyMuted>
        ) : recent.kind === "unavailable" ? (
          <TypographyMuted>
            Upstash ne répond pas : les coucous n&apos;ont pas pu être lus.
          </TypographyMuted>
        ) : recent.pokes.length === 0 ? (
          <TypographyMuted>
            Personne ne t&apos;a fait coucou cette semaine.
          </TypographyMuted>
        ) : (
          recent.pokes.map((poke) => <PokeRow key={poke.id} poke={poke} />)
        )}
      </EntryList>
    </EditorPage>
  );
}

function PokeRow({ poke }: { poke: RecentPoke }) {
  return (
    <div
      id={`poke-${poke.id}`}
      className="tray flex scroll-mt-6 flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-raised px-4 py-3 target:ring-2 target:ring-action-ink"
    >
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ground text-[1.375rem] leading-none"
      >
        {EMOTE_GLYPH[poke.emote]}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {poke.name ? (
          <EntryName>{poke.name}</EntryName>
        ) : (
          <span className="text-label text-ink-muted">Sans prénom</span>
        )}
        <EntryFact>
          {poke.page} · {SENT_AT.format(poke.at)} · {LANGUAGE[poke.locale]}
        </EntryFact>
      </div>
      <div className="ml-auto">
        {poke.wavedBack ? (
          <EntryTag tone="live">Coucou rendu</EntryTag>
        ) : (
          <AdminForm
            action={waveBackAction}
            revision=""
            submitLabel="Faire coucou en retour"
            pendingLabel="Envoi…"
            published="Coucou rendu : le visiteur le verra à sa prochaine visite"
            icon={<Hand aria-hidden />}
            inline
          >
            <input type="hidden" name="pokeId" value={poke.id} readOnly />
          </AdminForm>
        )}
      </div>
    </div>
  );
}
