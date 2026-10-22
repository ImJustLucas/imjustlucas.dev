"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { pokeReplyAction, sendPokeAction } from "@/app/[locale]/poke-actions";
import { useSounds } from "@/components/sound/SoundProvider";
import type { Emote } from "@/lib/poke/emotes";
import type { SentPoke } from "@/lib/poke/result";
import {
  awaitsReply,
  POKE_STORAGE_KEY,
  readVisitPoke,
  type VisitPoke,
  type WaveView,
  waveView,
} from "@/lib/poke/visit";

import { PokeToast, type PokeToastKind } from "./PokeToast";

/** Why the last wave did not go out, shown under the emotes. */
export type WaveProblem = "limited" | "busy" | "failed";

type PokeContextValue = {
  /** Whether visitors can wave at all (the webhook is set). */
  readonly enabled: boolean;
  /** Null until the browser's own Poke is read, after mount. */
  readonly view: WaveView | null;
  /** The emote on its way, if one is. */
  readonly sending: Emote | null;
  readonly problem: WaveProblem | null;
  /** Waves at Lucas; `toast` reports the outcome in a toast (the ⌘K command). */
  readonly send: (
    emote: Emote,
    options?: { readonly toast?: boolean; readonly website?: string },
  ) => void;
};

const PokeContext = createContext<PokeContextValue>({
  enabled: false,
  view: null,
  sending: null,
  problem: null,
  send: () => {},
});

const read = () => {
  try {
    return readVisitPoke(window.localStorage.getItem(POKE_STORAGE_KEY));
  } catch {
    return null;
  }
};

const keep = (poke: VisitPoke) => {
  try {
    window.localStorage.setItem(POKE_STORAGE_KEY, JSON.stringify(poke));
  } catch {
    // Private mode: the wave still went out, it is only not remembered
  }
};

const PROBLEM: {
  readonly [K in Exclude<SentPoke["kind"], "sent">]: WaveProblem;
} = {
  limited: "limited",
  busy: "busy",
  refused: "failed",
  unavailable: "failed",
};

/**
 * The visitor's wave at Lucas (DESIGN.md, Wave), shared by the contact
 * screen, the friends panel and the quick menu: their Poke, kept in the
 * browser, what is on its way, and the toasts. On load it asks once whether
 * Lucas waved back at a Poke he has not answered yet.
 */
export function PokeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const { play } = useSounds();
  // What the buttons show, worked out whenever the Poke changes
  const [view, setView] = useState<WaveView | null>(null);
  const remember = useCallback(
    (poke: VisitPoke | null) => setView(waveView(poke, Date.now())),
    [],
  );
  const [sending, setSending] = useState<Emote | null>(null);
  const [problem, setProblem] = useState<WaveProblem | null>(null);
  const [toast, setToast] = useState<{
    readonly kind: PokeToastKind;
    readonly emote: Emote | null;
    readonly id: number;
  } | null>(null);
  const [announced, setAnnounced] = useState("");
  const t = useTranslations("Poke");
  const toastId = useRef(0);
  const busy = useRef(false);

  const hideToast = useCallback(() => setToast(null), []);
  const showToast = useCallback(
    (kind: PokeToastKind, emote: Emote | null) =>
      setToast({ kind, emote, id: ++toastId.current }),
    [],
  );

  // The browser's own Poke, then, once per load, Lucas's answer to it
  useEffect(() => {
    if (!enabled) return;
    let current = true;
    const load = () => {
      const stored = read();
      remember(stored);
      if (!stored || !awaitsReply(stored, Date.now())) return;
      pokeReplyAction(stored.pokeId)
        .then((reply) => {
          if (!current || reply.kind !== "waved") return;
          const answered = { ...stored, wavedBack: true };
          keep(answered);
          remember(answered);
          // Silent: it arrives on its own, not from a press
          showToast("wavedBack", stored.emote);
        })
        .catch(() => {});
    };
    load();
    return () => {
      current = false;
    };
  }, [enabled, remember, showToast]);

  // A problem says its piece, then the emotes stand alone again
  useEffect(() => {
    if (!problem) return;
    const timer = window.setTimeout(() => setProblem(null), 6000);
    return () => window.clearTimeout(timer);
  }, [problem]);

  const send = useCallback<PokeContextValue["send"]>(
    (emote, options = {}) => {
      if (!enabled || busy.current) return;
      busy.current = true;
      setSending(emote);
      setProblem(null);
      setAnnounced(t("sending"));
      sendPokeAction({
        emote,
        page: window.location.pathname,
        ...(options.website && { website: options.website }),
      })
        .catch((): SentPoke => ({ kind: "unavailable" }))
        .then((result) => {
          if (result.kind === "sent" || result.kind === "limited") {
            // Already waved elsewhere: the day is spent all the same
            const kept: VisitPoke =
              result.kind === "sent"
                ? {
                    pokeId: result.pokeId,
                    emote,
                    at: result.at,
                    wavedBack: false,
                  }
                : {
                    pokeId: null,
                    emote: null,
                    at: Date.now(),
                    wavedBack: false,
                  };
            keep(kept);
            remember(kept);
          }
          if (result.kind === "sent") {
            play("confirm");
            setAnnounced(t("sentAnnounced"));
          } else {
            play("miss");
            setProblem(PROBLEM[result.kind]);
            setAnnounced(t(PROBLEM[result.kind]));
          }
          if (options.toast) {
            showToast(
              result.kind === "sent" ? "sent" : PROBLEM[result.kind],
              emote,
            );
          }
        })
        .finally(() => {
          busy.current = false;
          setSending(null);
        });
    },
    [enabled, play, remember, showToast, t],
  );

  const value = useMemo<PokeContextValue>(
    () => ({
      enabled,
      view,
      sending,
      problem,
      send,
    }),
    [enabled, view, sending, problem, send],
  );

  return (
    <PokeContext.Provider value={value}>
      {children}
      {/* The one place a wave is said aloud, wherever it was sent from */}
      <span aria-live="polite" className="sr-only">
        {announced}
      </span>
      {toast && (
        <PokeToast
          key={toast.id}
          kind={toast.kind}
          emote={toast.emote}
          onDone={hideToast}
        />
      )}
    </PokeContext.Provider>
  );
}

/** The visitor's wave; disabled outside a `PokeProvider` (the Admin). */
export const usePoke = () => useContext(PokeContext);
