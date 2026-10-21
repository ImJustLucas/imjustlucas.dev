"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useSounds } from "@/components/sound/SoundProvider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectWindowProps = {
  /** The id of the title naming the window. */
  titleId: string;
  children: React.ReactNode;
};

const CloseWindow = createContext<() => void>(() => {});

/**
 * A Project's inspect screen opened over the inventory: a modal dialog
 * (focus kept inside, the client inert behind it) that rises in the centre
 * from 768px and slides up as a sheet below. Closing goes back in history,
 * once, to the inventory as it was, with focus back on the card that opened
 * it: Escape, the close button (`ProjectWindowClose`) or a press on the
 * dimmed client, each with the toggle-off note.
 */
export function ProjectWindow({ titleId, children }: ProjectWindowProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const router = useRouter();
  const { play } = useSounds();

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    play("toggleOff");
    router.back();
  };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (!element.open) element.showModal();
    return () => {
      // Leaving through history unmounts the dialog still open
      if (element.open) element.close();
      opener?.focus({ preventScroll: true });
    };
  }, []);

  const closeOnBackdrop = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <CloseWindow.Provider value={close}>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onCancel={(event) => {
          // Escape: leave through history, like the close button
          event.preventDefault();
          close();
        }}
        onClick={closeOnBackdrop}
        className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-ink backdrop:animate-fade-in backdrop:bg-frame/75"
      >
        <div
          onClick={closeOnBackdrop}
          className="flex min-h-full flex-col justify-end pt-3 md:items-center md:justify-center md:p-6"
        >
          <div className="w-full shadow-[var(--float)] motion-safe:animate-sheet-in motion-reduce:animate-fade-in md:max-w-[1080px] md:rounded-lg md:motion-safe:animate-window-in">
            {children}
          </div>
        </div>
      </dialog>
    </CloseWindow.Provider>
  );
}

/** The window's close button, beside the Project's title. */
export function ProjectWindowClose({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const close = useContext(CloseWindow);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={close}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "shrink-0 [&_svg]:size-5",
      )}
    >
      {children}
    </button>
  );
}
