"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * An editor entry as a raised row that opens in place on its form
 * (DESIGN.md, Admin). Which rows are open is kept by the Admin layout, so a
 * row stays open after a save re-renders the editor with new forms; a row is
 * also opened by its address (`/admin/projects#project-1`).
 */

type OpenRows = {
  isOpen: (id: string) => boolean;
  setOpen: (id: string, open: boolean) => void;
};

const OpenRowsContext = createContext<OpenRows | undefined>(undefined);

export const EntryRowsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpenIds] = useState<ReadonlySet<string>>(new Set());
  const isOpen = useCallback((id: string) => open.has(id), [open]);
  const setOpen = useCallback((id: string, value: boolean) => {
    setOpenIds((ids) => {
      if (ids.has(id) === value) return ids;
      const next = new Set(ids);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  return (
    <OpenRowsContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </OpenRowsContext.Provider>
  );
};

/** Tells the row its form holds changes not yet published. */
const ChangedContext = createContext<(changed: boolean) => void>(() => {});
export const useMarkChanged = () => useContext(ChangedContext);

export const EntryRow: React.FC<{
  /** The row's address, unique on the page, e.g. `project-1`. */
  id: string;
  /** The closed row: what tells this entry apart. */
  summary: React.ReactNode;
  /** Controls beside the toggle, always in view (e.g. a Hobby's moves). */
  actions?: React.ReactNode;
  /** A 4px top band, e.g. the entry's rarity colour as a border class. */
  band?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, summary, actions, band, className, children }) => {
  const rows = useContext(OpenRowsContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = rows ? rows.isOpen(id) : localOpen;
  const setOpen = useCallback(
    (value: boolean) => (rows ? rows.setOpen(id, value) : setLocalOpen(value)),
    [rows, id],
  );
  const [changed, setChanged] = useState(false);
  const panelId = useId();
  const row = useRef<HTMLElement>(null);

  // Opened by its address, on arrival and when a link on the page points to it
  useEffect(() => {
    const follow = () => {
      if (window.location.hash !== `#${id}`) return;
      setOpen(true);
      requestAnimationFrame(() =>
        row.current?.scrollIntoView({ block: "start" }),
      );
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [id, setOpen]);

  const chevron = (
    <ChevronDown
      aria-hidden
      className={cn(
        "size-5 shrink-0 text-ink-muted transition-transform duration-200 ease-in-out motion-reduce:transition-none",
        open && "rotate-180",
      )}
    />
  );

  return (
    <section
      ref={row}
      id={id}
      className={cn(
        "tray scroll-mt-[calc(var(--admin-notice,0px)+1rem)] rounded-lg bg-raised outline-2 -outline-offset-2 outline-seam",
        open && "outline",
        band && cn("border-t-4", band),
        className,
      )}
    >
      <div className="flex items-center gap-2 has-[>div]:pr-3 sm:has-[>div]:pr-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="group flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors duration-hover ease-out hover:bg-seam/30 focus-visible:outline-offset-[-2px] sm:px-5"
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
            {summary}
          </span>
          {changed && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-tag text-ink-muted">
              <span aria-hidden className="size-2 rounded-full bg-away" />
              <span className="max-sm:sr-only">non publié</span>
            </span>
          )}
          {!actions && chevron}
        </button>
        {actions && (
          <>
            <div className="flex shrink-0 gap-2">{actions}</div>
            {/* The chevron stays at the row's right edge, after the actions;
                the row's own button is the toggle for keyboards */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setOpen(!open)}
              className="-ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md"
            >
              {chevron}
            </button>
          </>
        )}
      </div>
      {/* Kept mounted while closed, so unpublished changes survive */}
      <div
        id={panelId}
        hidden={!open}
        className="border-t-2 border-seam px-4 pb-4 pt-5 sm:px-5 sm:pb-5"
      >
        <ChangedContext.Provider value={setChanged}>
          {children}
        </ChangedContext.Provider>
      </div>
    </section>
  );
};
