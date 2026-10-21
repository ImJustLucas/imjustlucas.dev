"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useSounds } from "@/components/sound/SoundProvider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectWindowProps = {
  /** The id of the title naming the window. */
  titleId: string;
  children: React.ReactNode;
};

/**
 * A Project's inspect screen opened over the inventory: a modal dialog
 * (focus kept inside, the client inert behind it) that rises in the centre
 * from 768px and slides up as a sheet below. Closing goes back in history,
 * to the inventory as it was: Escape, the close button (`ProjectWindowClose`)
 * or a press on the dimmed client, each with the toggle-off note.
 */
export function ProjectWindow({ titleId, children }: ProjectWindowProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useCloseWindow();

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: leave through history, like the close button
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-ink backdrop:animate-fade-in backdrop:bg-frame/75"
    >
      <div
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="flex min-h-full flex-col justify-end pt-3 md:items-center md:justify-center md:p-6"
      >
        <div className="w-full animate-sheet-in shadow-[var(--float)] motion-reduce:animate-fade-in md:max-w-[1080px] md:animate-window-in md:rounded-lg">
          {children}
        </div>
      </div>
    </dialog>
  );
}

/** Closes the window: back to the inventory, with the toggle-off note. */
function useCloseWindow() {
  const router = useRouter();
  const { play } = useSounds();
  return () => {
    play("toggleOff");
    router.back();
  };
}

/** The window's close button, beside the Project's title. */
export function ProjectWindowClose({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const close = useCloseWindow();
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
