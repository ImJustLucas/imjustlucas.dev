"use client";

import { useCallback, useEffect, useState } from "react";

import { isPlayerId } from "@/lib/arcade/player-name";

/** The visitor as an Arcade player: an id made here, and the name they chose. */
export type Player = { readonly id: string; readonly name: string | null };

const KEY = "imjustlucas:arcade:player";

const read = (): Player | null => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (
      stored &&
      typeof stored.id === "string" &&
      isPlayerId(stored.id) &&
      (stored.name === null || typeof stored.name === "string")
    ) {
      return { id: stored.id, name: stored.name };
    }
  } catch {
    // Unreadable or refused: a new player for this visit
  }
  return null;
};

const write = (player: Player) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(player));
  } catch {
    // Storage refused: the name holds for this visit only
  }
};

/**
 * The visitor's player id and first name, kept in their browser so the next
 * score goes on the board under the same name. Null until mounted.
 */
export const usePlayer = () => {
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const load = () => {
      const stored = read();
      const next = stored ?? { id: crypto.randomUUID(), name: null };
      if (!stored) write(next);
      setPlayer(next);
    };
    load();
  }, []);

  const remember = useCallback((name: string) => {
    setPlayer((current) => {
      const next = { id: current?.id ?? crypto.randomUUID(), name };
      write(next);
      return next;
    });
  }, []);

  return { player, remember };
};
