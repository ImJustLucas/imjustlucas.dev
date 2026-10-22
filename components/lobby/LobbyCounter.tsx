"use client";

import { useTranslations } from "next-intl";

import { TypographyData } from "@/components/typography";
import { lobbyView } from "@/lib/lobby/rules";
import { cn } from "@/lib/utils";

import { useLobby } from "./use-lobby";

/**
 * The lobby line under the friends panel's heading: how many visitors are on
 * the site right now, the visitor included. Its row is kept from the first
 * render so the presence card never jumps when the first beat answers, and
 * dropped only when the store is down. Not a live region: screen readers
 * read the current count where it stands, never each change.
 */
export function LobbyCounter() {
  const beat = useLobby();
  const t = useTranslations("Lobby");
  const view = lobbyView(beat);

  if (beat && beat.kind !== "lobby") return null;
  if (view.kind === "hidden") return <div aria-hidden className="h-5" />;

  return (
    <div
      title={t("hint")}
      className="flex h-5 items-center gap-2 px-1 text-label text-ink-muted"
    >
      <span
        aria-hidden
        className={cn(
          "size-2 shrink-0 rounded-full transition-colors duration-150",
          view.kind === "players" ? "bg-online" : "bg-common",
        )}
      />
      {/* A new count rises in over the old one (only fades, reduced) */}
      <span
        key={view.kind === "players" ? view.count : "alone"}
        className="inline-block animate-count-in"
      >
        {view.kind === "players"
          ? t.rich("players", {
              count: view.count,
              strong: (chunks) => (
                <TypographyData className="text-ink">{chunks}</TypographyData>
              ),
            })
          : t("alone")}
      </span>
    </div>
  );
}
