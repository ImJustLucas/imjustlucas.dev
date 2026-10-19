"use client";

import {
  createContext,
  type FormEvent,
  startTransition,
  useActionState,
  useContext,
  useRef,
  useState,
} from "react";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
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

const PUBLISHED =
  "Publié. La modification sera en ligne dans environ une minute.";

const NoticeContext = createContext<(notice: string | undefined) => void>(
  () => {},
);

/** Wraps the Admin: shows the notice of the last save, above the editor. */
export const AdminNoticeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notice, setNotice] = useState<string>();
  return (
    <NoticeContext.Provider value={setNotice}>
      {notice && (
        <div
          role="status"
          className="sticky top-0 z-10 mx-auto mb-6 max-w-4xl rounded-md border border-green-600/40 bg-background px-4 py-3"
        >
          <TypographyMuted className="text-green-600">{notice}</TypographyMuted>
        </div>
      )}
      {children}
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

export const AdminForm: React.FC<{
  action: AdminFormAction;
  revision: string;
  submitLabel: string;
  /** Asks before submitting, e.g. for a deletion. */
  confirmation?: string;
  /** Empties the form once published (forms that create an entry). */
  resetOnSave?: boolean;
  destructive?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({
  action,
  revision,
  submitLabel,
  confirmation,
  resetOnSave,
  destructive,
  className,
  children,
}) => {
  const notify = useContext(NoticeContext);
  const form = useRef<HTMLFormElement>(null);
  const [result, formAction, pending] = useActionState(
    async (state: FormState, data: FormData) => {
      notify(undefined);
      const next = await action(state, data);
      if (next.kind === "saved") {
        notify(PUBLISHED);
        if (resetOnSave) form.current?.reset();
      }
      return next;
    },
    undefined,
  );

  // Submitted by hand rather than through `action`, so that React does not
  // empty the fields when the save is refused.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmation && !window.confirm(confirmation)) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <ResultContext.Provider value={result}>
      <form
        ref={form}
        onSubmit={submit}
        className={cn("flex flex-col gap-3", className)}
      >
        <input type="hidden" name="revision" value={revision} readOnly />
        {children}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="sm"
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
          >
            {pending ? "Publication…" : submitLabel}
          </Button>
          {!pending && result && result.kind !== "saved" && (
            <div role="alert">
              <TypographyMuted className="text-destructive">
                {refusal(result)}
              </TypographyMuted>
            </div>
          )}
        </div>
      </form>
    </ResultContext.Provider>
  );
};

/** Why nothing was published, in the Owner's words. */
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
      return `Rien n'a été publié : ${result.reason}`;
  }
};

/** The error of field `name` in the enclosing `AdminForm`, if any. */
export const useFieldError = (name: string) =>
  errorOf(useContext(ResultContext), name);

export const FieldError: React.FC<{ name: string }> = ({ name }) => {
  const error = useFieldError(name);
  return error ? (
    <TypographyMuted className="text-destructive">{error}</TypographyMuted>
  ) : null;
};

export const AdminField: React.FC<{
  name: string;
  label: string;
  defaultValue?: string;
  type?: "text" | "color";
  placeholder?: string;
  className?: string;
}> = ({ name, label, type = "text", className, ...input }) => {
  const error = useFieldError(name);
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-md border border-input bg-background px-3 py-2",
          type === "color" && "h-10 w-16 p-1",
          error && "border-destructive",
        )}
        {...input}
      />
      <FieldError name={name} />
    </label>
  );
};

/** A Localized text: one field per Locale, side by side. */
export const LocalizedField: React.FC<{
  name: string;
  label: string;
  defaultValue?: { en: string; fr: string };
}> = ({ name, label, defaultValue }) => (
  <fieldset className="grid gap-3 sm:grid-cols-2">
    <legend className="sr-only">{label}</legend>
    <AdminField
      name={`${name}.fr`}
      label={`${label} (FR)`}
      defaultValue={defaultValue?.fr}
    />
    <AdminField
      name={`${name}.en`}
      label={`${label} (EN)`}
      defaultValue={defaultValue?.en}
    />
  </fieldset>
);
