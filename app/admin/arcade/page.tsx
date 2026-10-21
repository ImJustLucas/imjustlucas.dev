import { AdminForm } from "@/app/admin/admin-form";
import { removeArcadeEntryAction } from "@/app/admin/arcade/actions";
import {
  EditorPage,
  EntryFact,
  EntryList,
  EntryName,
} from "@/app/admin/editor-frame";
import { TypographyData, TypographyMuted } from "@/components/typography";
import { currentOwnerAccess } from "@/lib/admin/session";
import { LEADERBOARD_GAMES, LEADERBOARD_SIZE } from "@/lib/arcade/board";
import { getArcadeBoard } from "@/lib/arcade/server";

const GAME_NAMES = { ollie: "Ollie" } as const;

/**
 * The Arcade's leaderboards, as visitors see them: the Owner takes off a
 * player whose name has no place there. Scores live in Upstash, not in the
 * content, so nothing here is committed.
 */
export default async function ArcadeAdminPage() {
  const access = await currentOwnerAccess();
  if (access.kind !== "owner") return null;
  const boards = await Promise.all(
    LEADERBOARD_GAMES.map(
      async (game) => [game, await getArcadeBoard(game)] as const,
    ),
  );

  return (
    <EditorPage
      title="Arcade"
      count={`top ${LEADERBOARD_SIZE} par jeu`}
      intro="Les classements des bornes, comme les visiteurs les voient. Retirer un joueur efface son score et son prénom ; il peut revenir avec une nouvelle partie."
    >
      {boards.map(([game, board]) => (
        <EntryList key={game} title={GAME_NAMES[game]}>
          {board.kind === "unavailable" ? (
            <TypographyMuted>
              Upstash ne répond pas : le classement n&apos;a pas pu être lu.
            </TypographyMuted>
          ) : board.top.length === 0 ? (
            <TypographyMuted>
              Personne au classement pour l&apos;instant.
            </TypographyMuted>
          ) : (
            board.top.map((entry, index) => (
              <div
                key={entry.playerId}
                className="tray flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-raised px-4 py-3"
              >
                <TypographyData className="w-6 text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </TypographyData>
                <EntryName>{entry.name}</EntryName>
                <EntryFact>{entry.score} points</EntryFact>
                <AdminForm
                  action={removeArcadeEntryAction}
                  revision=""
                  submitLabel="Retirer"
                  pendingLabel="Retrait…"
                  published={`${entry.name} retiré du classement`}
                  confirmation={`Retirer ${entry.name} du classement de ${GAME_NAMES[game]} ?`}
                  tone="delete"
                  className="ml-auto"
                >
                  <input type="hidden" name="game" value={game} readOnly />
                  <input
                    type="hidden"
                    name="playerId"
                    value={entry.playerId}
                    readOnly
                  />
                </AdminForm>
              </div>
            ))
          )}
        </EntryList>
      ))}
    </EditorPage>
  );
}
