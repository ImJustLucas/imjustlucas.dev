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
import dynamic from "next/dynamic";

import { useSounds } from "@/components/sound/SoundProvider";
import { KONAMI, konamiStep } from "@/lib/quick-menu/konami";

import type { QuickMenuData, ShownToast, Toast } from "./QuickMenuLayer";

const loadLayer = () => import("./QuickMenuLayer");

// The menu and its toasts are their own chunk, fetched on the first
// shortcut, or when a trigger is hovered or focused
const QuickMenuLayer = dynamic(loadLayer, { ssr: false });

type QuickMenuContextValue = {
  /** Opens the menu, from a trigger. */
  open: () => void;
  /** Fetches the menu's chunk ahead of a press (hover, focus). */
  preload: () => void;
};

const QuickMenuContext = createContext<QuickMenuContextValue | undefined>(
  undefined,
);

/** Whether a key press is someone typing (a field, an editable region). */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest("input, textarea, select, [contenteditable]") !== null);

/**
 * The quick menu (DESIGN.md, Quick menu), mounted once in the client:
 * ⌘K or Ctrl+K toggles it, "/" opens it outside a field, and the triggers in
 * the sidebar and the mobile top bar open it. It also listens for the Konami
 * code anywhere. Only these listeners ship with the page; the menu itself
 * loads on first use.
 */
export function QuickMenuProvider({
  data,
  children,
}: {
  data: QuickMenuData;
  children: React.ReactNode;
}) {
  const { play } = useSounds();
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<ShownToast | null>(null);
  const toastId = useRef(0);
  const konami = useRef(0);
  // Read by the key listener without re-subscribing it
  const isOpenRef = useRef(false);

  /** Opens or closes with the toggle notes; silently after a command ran. */
  const setOpen = useCallback(
    (next: boolean, silent = false) => {
      setLoaded(true);
      if (isOpenRef.current === next) return;
      isOpenRef.current = next;
      if (!silent) play(next ? "toggleOn" : "toggleOff");
      setIsOpen(next);
    },
    [play],
  );

  const showToast = useCallback((next: Toast | null) => {
    setLoaded(true);
    toastId.current += 1;
    setToast(next && { toast: next, id: toastId.current });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const typing = isTyping(event.target);

      if (!typing) {
        konami.current = konamiStep(konami.current, event.key);
        if (konami.current === KONAMI.length) {
          konami.current = 0;
          play("unlock");
          showToast({ kind: "secret", secret: "konami" });
        }
      }

      const key = event.key.toLowerCase();
      if (
        key === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setOpen(!isOpenRef.current);
      } else if (
        event.key === "/" &&
        !typing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isOpenRef.current
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [play, showToast, setOpen]);

  const value = useMemo(
    () => ({
      open: () => setOpen(true),
      preload: () => void loadLayer(),
    }),
    [setOpen],
  );

  return (
    <QuickMenuContext.Provider value={value}>
      {children}
      {loaded && (
        <QuickMenuLayer
          data={data}
          open={isOpen}
          onOpenChange={setOpen}
          toast={toast}
          onToast={showToast}
        />
      )}
    </QuickMenuContext.Provider>
  );
}

export function useQuickMenu() {
  const context = useContext(QuickMenuContext);
  if (context === undefined) {
    throw new Error("useQuickMenu must be used within a QuickMenuProvider");
  }
  return context;
}
