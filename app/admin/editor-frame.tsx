import { Plus } from "lucide-react";

import { EntryRow } from "@/app/admin/entry-row";
import {
  TypographyData,
  TypographyHeadline,
  TypographyMuted,
  TypographyTitle,
} from "@/components/typography";
import { cn } from "@/lib/utils";

/** The id of an editor's "new entry" row, which `#new` opens. */
export const NEW_ENTRY = "new";

/**
 * An editor's page (DESIGN.md, Admin): a compact banner with the title,
 * one line on how the site shows these entries, the count, and "Ajouter",
 * which opens the new entry's row; then the entries.
 */
export const EditorPage: React.FC<{
  title: string;
  intro: React.ReactNode;
  /** e.g. "9 Projects"; none for a single document like the Profile. */
  count?: string;
  /** e.g. "Ajouter un Project"; none when entries are not created here. */
  addLabel?: string;
  children: React.ReactNode;
}> = ({ title, intro, count, addLabel, children }) => (
  <div className="mx-auto flex max-w-[56rem] flex-col gap-8">
    <header className="tray flex flex-wrap items-end justify-between gap-x-6 gap-y-4 rounded-lg border-2 border-seam bg-raised p-4 sm:p-6 md:px-7 md:py-5">
      <div className="min-w-0 flex-[1_1_22rem]">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <TypographyHeadline>{title}</TypographyHeadline>
          {count && (
            <TypographyData className="text-ink-muted">{count}</TypographyData>
          )}
        </div>
        <TypographyMuted className="mt-2 max-w-[65ch] text-pretty text-label font-normal text-ink-muted">
          {intro}
        </TypographyMuted>
      </div>
      {addLabel && (
        <a
          href={`#${NEW_ENTRY}`}
          className="ledge inline-flex h-11 shrink-0 items-center gap-2 rounded-md border-2 border-seam bg-ground px-4 text-label text-ink [&_svg]:size-4"
        >
          <Plus aria-hidden />
          {addLabel}
        </a>
      )}
    </header>
    {children}
  </div>
);

/** A titled list of entry rows, 12px apart. */
export const EntryList: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <section className={cn("flex flex-col gap-3", className)}>
    {title && <TypographyTitle className="mb-1">{title}</TypographyTitle>}
    {children}
  </section>
);

/** The row that creates an entry: dashed until it is opened. */
export const NewEntryRow: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <EntryRow
    id={NEW_ENTRY}
    className="bg-transparent shadow-none outline outline-dashed has-[[aria-expanded=true]]:bg-raised has-[[aria-expanded=true]]:shadow-[var(--tray)]"
    summary={
      <>
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-seam/70 text-ink">
          <Plus aria-hidden className="size-4" />
        </span>
        <span className="text-label font-semibold text-ink">{label}</span>
        {hint && (
          <span className="text-label font-normal text-ink-muted">{hint}</span>
        )}
      </>
    }
  >
    {children}
  </EntryRow>
);

/** The title of an entry in its closed row. */
export const EntryName: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="min-w-0 truncate font-display text-title text-ink">
    {children}
  </span>
);

/** A quiet fact in a closed row (a period, a year, a count). */
export const EntryFact: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <TypographyData className="whitespace-nowrap text-ink-muted">
    {children}
  </TypographyData>
);

/** An outlined tag in a closed row (WIP, a contract type, "accueil 1"). */
export const EntryTag: React.FC<{
  children: React.ReactNode;
  tone?: "plain" | "live" | "warning";
}> = ({ children, tone = "plain" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-tag",
      tone === "plain" && "border-2 border-seam text-ink",
      tone === "live" && "bg-online text-on-bright",
      tone === "warning" && "bg-away text-on-bright",
    )}
  >
    {children}
  </span>
);

/** The delete form's place, under the entry's form. */
export const DangerZone: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-seam pt-4">
    <TypographyMuted className="text-label font-normal text-ink-muted">
      Supprimer publie aussi, après confirmation.
    </TypographyMuted>
    {children}
  </div>
);
