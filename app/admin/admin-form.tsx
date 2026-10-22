"use client";

import {
  createContext,
  type FormEvent,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import {
  Check,
  ChevronDown,
  CircleAlert,
  LoaderCircle,
  RotateCw,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import { useMarkChanged } from "@/app/admin/entry-row";
import { INPUT } from "@/app/admin/field-style";
import { TypographyMuted, TypographyTitle } from "@/components/typography";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { cn } from "@/lib/utils";

/**
 * The form every Admin editor uses: it posts to an Admin Server Action with
 * the revision the page was read at. A refused save is explained in the form
 * (fields read their own error); a published one is announced by the Admin's
 * notice, which outlives the forms the editor re-renders after a save.
 */

type FormState = AdminActionResult | undefined;
export type AdminFormAction = (
  state: FormState,
  form: FormData,
) => Promise<AdminActionResult>;

/** What the notice says went live, e.g. "Predi.GG publié". */
const NoticeContext = createContext<(published: string | undefined) => void>(
  () => {},
);

/**
 * Wraps the Admin: shows the notice of the last save at the top of the
 * panel, above the editor, taking its own room so it never hides the entry
 * it names, and pinned while the panel scrolls. It goes at the next save, at
 * the next page or when dismissed.
 */
export const AdminNoticeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [published, setPublished] = useState<string>();
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setPublished(undefined);
  }
  return (
    <NoticeContext.Provider value={setPublished}>
      <div
        role="status"
        className={cn(
          "sticky top-0 z-30 mx-auto max-w-[56rem]",
          published && "mb-4",
        )}
      >
        {published && (
          <div className="float flex animate-page-in items-center gap-3 rounded-lg border-2 border-online-ink/60 bg-raised py-2.5 pl-3 pr-2">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-online text-on-bright">
              <Check aria-hidden className="size-[18px]" strokeWidth={2.5} />
            </span>
            <TypographyMuted className="min-w-0 flex-1 text-label text-ink">
              <span className="font-semibold">{published}.</span>{" "}
              <span className="text-ink-muted">
                En ligne dans environ une minute.
              </span>
            </TypographyMuted>
            <button
              type="button"
              onClick={() => setPublished(undefined)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors duration-hover hover:bg-seam/60 hover:text-ink"
            >
              <X aria-hidden className="size-4" />
              <span className="sr-only">Fermer</span>
            </button>
          </div>
        )}
      </div>
      {/* Rows reached by their address land below the pinned notice */}
      <div
        style={
          {
            "--admin-notice": published ? "5rem" : "0px",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </NoticeContext.Provider>
  );
};

const ResultContext = createContext<FormState>(undefined);

/** The error of `name` or of anything below it (`techs` for `techs.1`). */
const errorOf = (result: FormState, name: string) => {
  if (result?.kind !== "invalid") return undefined;
  const { fieldErrors } = result;
  return (
    fieldErrors[name] ??
    Object.entries(fieldErrors).find(([path]) =>
      path.startsWith(`${name}.`),
    )?.[1]
  );
};

/**
 * The save button: an outline ledge button at rest, the action fill on its
 * ledge once its form holds changes, so the one lit button on a page is the
 * one with something to publish (DESIGN.md, Admin).
 */
const SAVE_BUTTON =
  "ledge inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 px-5 text-label font-semibold [&_svg]:size-4";
const SAVE_AT_REST = "border-seam bg-ground text-ink";
const SAVE_CHANGED = "ledge-action border-action bg-action text-on-action";

/** A deletion: an outline button in the error colour, never filled. */
const DELETE_BUTTON =
  "ledge inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-seam bg-ground px-4 text-label text-busy-ink [&_svg]:size-4";

/** A small step (a move): a raised ledge button. */
const STEP_BUTTON =
  "ledge inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-ground px-3 text-label text-ink [&_svg]:size-4";

export const AdminForm: React.FC<{
  action: AdminFormAction;
  revision: string;
  submitLabel: string;
  /** Shown while the action runs; "Publication…" by default. */
  pendingLabel?: string;
  /** An icon before the label. */
  icon?: React.ReactNode;
  /** What the notice says once published; "Publié" by default. */
  published?: string;
  /** Asks before submitting, e.g. for a deletion. */
  confirmation?: string;
  /** Empties the form once published (forms that create an entry). */
  resetOnSave?: boolean;
  /**
   * `save` (default): the action fill, in a footer that stays in view while
   * the form scrolls; `delete`: a quiet outline in the error colour; `step`:
   * a small ledge button (a move).
   */
  tone?: "save" | "delete" | "step";
  /** A short form: its save button sits in line, with no pinned footer. */
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({
  action,
  revision,
  submitLabel,
  pendingLabel = "Publication…",
  icon,
  published = "Publié",
  confirmation,
  resetOnSave,
  tone = "save",
  inline,
  className,
  children,
}) => {
  const notify = useContext(NoticeContext);
  const markRow = useMarkChanged();
  const [changed, setChanged] = useState(false);
  const markChanged = (value: boolean) => {
    setChanged(value);
    markRow(value);
  };
  const form = useRef<HTMLFormElement>(null);
  const [result, formAction, pending] = useActionState(
    async (state: FormState, data: FormData) => {
      notify(undefined);
      const next = await action(state, data);
      if (next.kind === "saved") {
        notify(published);
        markChanged(false);
        if (resetOnSave) form.current?.reset();
      }
      return next;
    },
    undefined,
  );

  // A refused save takes the Owner to the first field it names
  useEffect(() => {
    if (result?.kind !== "invalid") return;
    form.current
      ?.querySelector<HTMLElement>("[aria-invalid=true]")
      ?.focus({ preventScroll: false });
  }, [result]);

  // Submitted by hand rather than through `action`, so that React does not
  // empty the fields when the save is refused.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmation && !window.confirm(confirmation)) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  const refused = !pending && result && result.kind !== "saved" && (
    <Refusal result={result} />
  );

  const button = (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={
        tone === "delete"
          ? DELETE_BUTTON
          : tone === "step"
            ? STEP_BUTTON
            : cn(SAVE_BUTTON, changed ? SAVE_CHANGED : SAVE_AT_REST)
      }
    >
      {pending ? (
        <LoaderCircle
          aria-hidden
          className="animate-spin motion-reduce:animate-none"
        />
      ) : tone === "delete" ? (
        (icon ?? <Trash2 aria-hidden />)
      ) : (
        icon
      )}
      {tone === "step" ? (
        // A move shows its arrow alone on narrow panels; the label stays its name
        <span className="max-lg:sr-only">
          {pending ? pendingLabel : submitLabel}
        </span>
      ) : pending ? (
        pendingLabel
      ) : (
        submitLabel
      )}
    </button>
  );

  return (
    <ResultContext.Provider value={result}>
      <form
        ref={form}
        onSubmit={submit}
        onInput={tone === "save" ? () => markChanged(true) : undefined}
        aria-busy={pending}
        className={cn(
          "flex flex-col",
          tone === "save" && !inline ? "gap-6" : "gap-3",
          className,
        )}
      >
        <input type="hidden" name="revision" value={revision} readOnly />
        {children}
        {tone === "save" && !inline ? (
          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t-2 border-seam bg-raised px-4 py-3 sm:-mx-5 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">{button}</div>
            {refused}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">{button}</div>
            {refused}
          </>
        )}
      </form>
    </ResultContext.Provider>
  );
};

/** Why nothing was published, in the Owner's words, and what to do. */
const Refusal: React.FC<{
  result: Exclude<AdminActionResult, { kind: "saved" }>;
}> = ({ result }) => {
  const conflict = result.kind === "conflict";
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md border-2 bg-ground px-3 py-2.5 text-label text-ink",
        conflict ? "border-away/70" : "border-busy-ink/60",
      )}
    >
      {conflict ? (
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-away text-on-bright">
          <TriangleAlert aria-hidden className="size-3" strokeWidth={2.5} />
        </span>
      ) : (
        <CircleAlert
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-busy-ink"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <TypographyMuted className="min-w-0 flex-[1_1_20rem] text-pretty text-ink">
          {refusal(result)}
        </TypographyMuted>
        {conflict && (
          // A plain navigation re-reads the editor at the branch's revision
          <a
            href=""
            className="ledge inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border-2 border-seam bg-raised px-3 text-label text-ink hover:bg-seam/40 [&_svg]:size-4"
          >
            <RotateCw aria-hidden />
            Recharger la page
          </a>
        )}
        {result.kind === "not-owner" && (
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/admin/auth/sign-in"
            className="ledge inline-flex h-9 shrink-0 items-center rounded-md border-2 border-seam bg-raised px-3 text-label text-ink hover:bg-seam/40"
          >
            Se reconnecter
          </a>
        )}
      </div>
    </div>
  );
};

const refusal = (result: Exclude<AdminActionResult, { kind: "saved" }>) => {
  switch (result.kind) {
    case "invalid":
      return "Rien n'a été publié : corrige les champs signalés.";
    case "refused":
      return result.reason;
    case "conflict":
      return "Rien n'a été publié : le contenu a changé sur GitHub depuis l'ouverture de cette page. Recharge la page puis recommence.";
    case "not-owner":
      return "Rien n'a été publié : seul le propriétaire du site peut modifier le contenu. Reconnecte-toi.";
    case "failed":
      return `Rien n'a été publié : ${result.reason.replace(/\.$/, "")}. Réessaie dans un instant.`;
  }
};

/** The error of field `name` in the enclosing `AdminForm`, if any. */
export const useFieldError = (name: string) =>
  errorOf(useContext(ResultContext), name);

export const FieldError: React.FC<{ name: string; id?: string }> = ({
  name,
  id,
}) => {
  const error = useFieldError(name);
  return error ? (
    <span id={id} className="flex items-start gap-1.5 text-label text-busy-ink">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {error}
    </span>
  ) : null;
};

/** A field's label: the name in ink, an optional hint in the muted ink. */
export const FieldLabel: React.FC<{
  label: React.ReactNode;
  hint?: string;
}> = ({ label, hint }) => (
  <span className="text-label text-ink">
    {label}
    {hint && <span className="font-normal text-ink-muted"> · {hint}</span>}
  </span>
);

export const AdminField: React.FC<{
  name: string;
  label: string;
  /** Shown instead of the label; the label stays the accessible name. */
  visualLabel?: React.ReactNode;
  hint?: string;
  defaultValue?: string;
  type?: "text" | "color" | "number" | "date";
  /** A text over several lines (still one value). */
  multiline?: boolean;
  placeholder?: string;
  /** For a number. */
  min?: number;
  className?: string;
}> = ({
  name,
  label,
  visualLabel,
  hint,
  type = "text",
  multiline,
  className,
  ...input
}) => {
  const error = useFieldError(name);
  const errorId = useId();
  const shared = {
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    ...input,
  };
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {visualLabel ? (
        <>
          <span className="sr-only">{label}</span>
          <span aria-hidden>{visualLabel}</span>
        </>
      ) : (
        <FieldLabel label={label} hint={hint} />
      )}
      {multiline ? (
        <textarea
          rows={3}
          className={cn(
            INPUT,
            "h-auto min-h-24 resize-y py-2.5 leading-relaxed [field-sizing:content]",
          )}
          {...shared}
        />
      ) : type === "color" ? (
        <input
          type="color"
          className={cn(
            INPUT,
            "w-16 cursor-pointer p-1 [&::-moz-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[5px] [&::-webkit-color-swatch]:border-0",
          )}
          {...shared}
        />
      ) : (
        <input
          type={type}
          className={cn(
            INPUT,
            (type === "number" || type === "date") && "tabular-nums",
          )}
          {...shared}
        />
      )}
      <FieldError name={name} id={errorId} />
    </label>
  );
};

/** A native select drawn as the Admin's input, with its own chevron. */
export const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
> = ({ invalid, className, children, ...select }) => (
  <span className={cn("relative block min-w-0", className)}>
    <select
      aria-invalid={invalid ? true : undefined}
      className={cn(INPUT, "cursor-pointer appearance-none pr-10")}
      {...select}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
    />
  </span>
);

/**
 * A choice among fixed `options` (value and French label). With no current
 * value, it starts on "Choisir…", which cannot be sent back as a choice.
 */
export const SelectField: React.FC<{
  name: string;
  label: string;
  options: ReadonlyArray<readonly [value: string, label: string]>;
  defaultValue?: string;
}> = ({ name, label, options, defaultValue }) => {
  const error = useFieldError(name);
  const errorId = useId();
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel label={label} />
      <Select
        name={name}
        defaultValue={defaultValue ?? ""}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      >
        {!defaultValue && (
          <option value="" disabled>
            Choisir…
          </option>
        )}
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <FieldError name={name} id={errorId} />
    </label>
  );
};

/** The Locale code in Data, the one uppercase string (DESIGN.md). */
const LocaleCode: React.FC<{ locale: "fr" | "en" }> = ({ locale }) => (
  <span className="inline-flex items-center gap-2 text-label text-ink">
    <span className="rounded-sm bg-ground px-1.5 font-mono text-data uppercase text-ink-muted">
      {locale}
    </span>
    {locale === "fr" ? "Français" : "Anglais"}
  </span>
);

/** A Localized text: one field per Locale, side by side from 640px. */
export const LocalizedField: React.FC<{
  name: string;
  label: string;
  hint?: string;
  defaultValue?: { en: string; fr: string };
  /** A text over several lines, e.g. a description. */
  multiline?: boolean;
  placeholder?: { en?: string; fr?: string };
}> = ({ name, label, hint, defaultValue, multiline, placeholder }) => (
  <fieldset className="flex min-w-0 flex-col gap-2">
    <legend className="mb-2">
      <FieldLabel label={label} hint={hint} />
    </legend>
    <div className="grid gap-3 lg:grid-cols-2">
      {(["fr", "en"] as const).map((locale) => (
        <AdminField
          key={locale}
          name={`${name}.${locale}`}
          label={`${label} (${locale.toUpperCase()})`}
          visualLabel={<LocaleCode locale={locale} />}
          defaultValue={defaultValue?.[locale]}
          multiline={multiline}
          placeholder={placeholder?.[locale]}
        />
      ))}
    </div>
  </fieldset>
);

/** A group of fields under a small title, parted from the next by space. */
export const FieldGroup: React.FC<{
  title: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, className, children }) => (
  <div className={cn("flex flex-col gap-4", className)}>
    <TypographyTitle
      as="h4"
      className="flex items-center gap-3 font-sans text-tag text-ink-muted"
    >
      {title}
      <span aria-hidden className="h-0.5 flex-1 rounded-full bg-seam" />
    </TypographyTitle>
    {children}
  </div>
);

/** A yes-or-no field as a switch-like checkbox row. */
export const FlagField: React.FC<{
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}> = ({ name, label, hint, defaultChecked }) => (
  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border-2 border-seam bg-ground px-3 py-2 transition-colors duration-hover hover:border-ink-muted/40 has-[:checked]:border-action-ink/70">
    <input
      type="checkbox"
      name={name}
      defaultChecked={defaultChecked}
      className="peer sr-only"
    />
    <span
      aria-hidden
      className="relative h-6 w-10 shrink-0 rounded-full bg-seam transition-colors duration-hover peer-checked:bg-action peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action-ink after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-ink-muted after:transition-transform after:duration-hover after:ease-out peer-checked:after:translate-x-4 peer-checked:after:bg-on-action motion-reduce:after:transition-none"
    />
    <span className="flex flex-col">
      <span className="text-label text-ink">{label}</span>
      {hint && (
        <span className="text-label font-normal text-ink-muted">{hint}</span>
      )}
    </span>
  </label>
);
