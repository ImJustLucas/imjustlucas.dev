"use client";

import { useId, useRef, useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import {
  AdminField,
  FieldError,
  FieldLabel,
  Select,
  useFieldError,
} from "@/app/admin/admin-form";
import { PATCH_TAG_LABEL } from "@/app/admin/patch-notes/patch-tag";
import { TypographyData } from "@/components/typography";
import type { PatchEntry, PatchTag } from "@/lib/content/types";

type Line = { readonly id: number; readonly entry?: PatchEntry };

/**
 * A Patch's lines: each a tag and its text in both Locales, posted as
 * `entries.<i>.tag` and `entries.<i>.text.<locale>` in display order, so a
 * refused save points at the right line. Lines are added at the end and
 * removed in place; a removal counts as a change of the form.
 */
export const PatchEntriesField: React.FC<{
  defaultValue?: ReadonlyArray<PatchEntry>;
}> = ({ defaultValue = [] }) => {
  const nextId = useRef(Math.max(defaultValue.length, 1));
  const [lines, setLines] = useState<ReadonlyArray<Line>>(() =>
    defaultValue.length > 0
      ? defaultValue.map((entry, id) => ({ id, entry }))
      : [{ id: 0 }],
  );
  const list = useRef<HTMLOListElement>(null);

  const add = () => {
    const id = nextId.current++;
    setLines((current) => [...current, { id }]);
    // The new line's first field, once rendered
    requestAnimationFrame(() =>
      list.current
        ?.querySelector<HTMLElement>(`[data-line="${id}"] select`)
        ?.focus(),
    );
  };

  const remove = (id: number, button: HTMLButtonElement) => {
    // The form marks itself changed on input; a removal types nothing
    button.form?.dispatchEvent(new Event("input", { bubbles: true }));
    setLines((current) => current.filter((line) => line.id !== id));
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
        <FieldLabel
          label="Lignes"
          hint="regroupées par étiquette sur le site"
        />
        <TypographyData className="text-ink-muted">
          {lines.length}
        </TypographyData>
      </legend>
      <ol ref={list} className="flex flex-col gap-3">
        {lines.map((line, i) => (
          <li
            key={line.id}
            data-line={line.id}
            className="grid gap-3 rounded-md border-2 border-seam bg-ground/40 p-3 sm:grid-cols-[9.5rem_1fr_auto] sm:items-start"
          >
            <TagSelect index={i} defaultValue={line.entry?.tag} />
            <div className="grid min-w-0 gap-3 lg:grid-cols-2">
              {(["fr", "en"] as const).map((locale) => (
                <AdminField
                  key={locale}
                  name={`entries.${i}.text.${locale}`}
                  label={`Ligne ${i + 1} (${locale.toUpperCase()})`}
                  visualLabel={
                    <span className="inline-flex items-center gap-2 text-label text-ink">
                      <span className="rounded-sm bg-ground px-1.5 font-mono text-data uppercase text-ink-muted">
                        {locale}
                      </span>
                      {locale === "fr" ? "Français" : "Anglais"}
                    </span>
                  }
                  defaultValue={line.entry?.text[locale]}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={(event) => remove(line.id, event.currentTarget)}
              disabled={lines.length === 1}
              className="inline-flex size-11 items-center justify-center self-end rounded-md text-ink-muted transition-colors duration-hover hover:bg-seam/60 hover:text-busy-ink disabled:pointer-events-none disabled:opacity-40 max-sm:justify-self-end"
            >
              <Trash2 aria-hidden className="size-4" />
              <span className="sr-only">Retirer la ligne {i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
      <FieldError name="entries" />
      <button
        type="button"
        onClick={add}
        className="ledge inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md bg-ground px-3 text-label text-ink [&_svg]:size-4"
      >
        <Plus aria-hidden />
        Ajouter une ligne
      </button>
    </fieldset>
  );
};

const TagSelect: React.FC<{ index: number; defaultValue?: PatchTag }> = ({
  index,
  defaultValue = "new",
}) => {
  const name = `entries.${index}.tag`;
  const error = useFieldError(name);
  const errorId = useId();
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel label="Étiquette" />
      <Select
        name={name}
        defaultValue={defaultValue}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      >
        {Object.entries(PATCH_TAG_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <FieldError name={name} id={errorId} />
    </label>
  );
};
