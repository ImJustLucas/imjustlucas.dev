"use client";

import { useEffect, useState } from "react";

import { lobbyBeatAction } from "@/app/[locale]/lobby-actions";
import { HEARTBEAT_MS, type LobbyBeat } from "@/lib/lobby/rules";

const STORAGE_KEY = "imjustlucas:lobby:session";

/**
 * The tab's anonymous id for the lobby, kept in `sessionStorage` so a reload
 * is not a second visitor; in memory when storage is blocked.
 */
let memoryId: string | undefined;
function sessionId() {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}

/**
 * Beats while the tab is visible, once every `HEARTBEAT_MS` and never more
 * often (a tab shown again waits out the rest of its period), and stops while
 * it is hidden. Each beat's answer is the lobby's count: no other request.
 */
export function useLobby(): LobbyBeat | undefined {
  const [last, setLast] = useState<LobbyBeat>();

  useEffect(() => {
    const id = sessionId();
    let cancelled = false;
    let sentAt = -Infinity;
    let timer: number | undefined;

    const send = () => {
      sentAt = Date.now();
      lobbyBeatAction(id).then(
        (answer) => !cancelled && setLast(answer),
        () => !cancelled && setLast({ kind: "unavailable" }),
      );
    };
    const stop = () => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      if (document.visibilityState !== "visible" || timer !== undefined) {
        return;
      }
      const wait = Math.max(0, sentAt + HEARTBEAT_MS - Date.now());
      timer = window.setTimeout(() => {
        send();
        timer = window.setInterval(send, HEARTBEAT_MS);
      }, wait);
    };
    const onVisibility = () =>
      document.visibilityState === "visible" ? start() : stop();

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return last;
}
