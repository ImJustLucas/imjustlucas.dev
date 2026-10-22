"use client";

import { useRef, useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import {
  AdminField,
  FieldError,
  FieldLabel,
  LocalizedField,
} from "@/app/admin/admin-form";
import { TypographyData } from "@/components/typography";
import type { SpokenLanguage } from "@/lib/content/types";

type Row = { readonly id: number; readonly language?: SpokenLanguage };

/**
 * The languages the recruiter mode lists: each a code, its name and Lucas's
 * level in both Locales, posted as `languages.<i>.code`,
 * `languages.<i>.name.<locale>` and `languages.<i>.level.<locale>` in display
 * order, so a refused save points at the right row. Rows are added at the end
 * and removed in place; a removal counts as a change of the form.
 */
export const LanguagesField: React.FC<{
  defaultValue: ReadonlyArray<SpokenLanguage>;
}> = ({ defaultValue }) => {
  const nextId = useRef(defaultValue.length);
  const [rows, setRows] = useState<ReadonlyArray<Row>>(() =>
    defaultValue.map((language, id) => ({ id, language })),
  );
  const list = useRef<HTMLOListElement>(null);

  const add = () => {
    const id = nextId.current++;
    setRows((current) => [...current, { id }]);
    // The new row's first field, once rendered
    requestAnimationFrame(() =>
      list.current
        ?.querySelector<HTMLElement>(`[data-row="${id}"] input`)
        ?.focus(),
    );
  };

  const remove = (id: number, button: HTMLButtonElement) => {
    // The form marks itself changed on input; a removal types nothing
    button.form?.dispatchEvent(new Event("input", { bubbles: true }));
    setRows((current) => current.filter((row) => row.id !== id));
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
        <FieldLabel label="Langues" hint="dans l'ordre de la page" />
        <TypographyData className="text-ink-muted">
          {rows.length}
        </TypographyData>
      </legend>
      <ol ref={list} className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <li
            key={row.id}
            data-row={row.id}
            className="grid gap-4 rounded-md border-2 border-seam bg-ground/40 p-3 sm:grid-cols-[7rem_1fr_auto] sm:items-start"
          >
            <AdminField
              name={`languages.${i}.code`}
              label="Code"
              hint="fr, en…"
              defaultValue={row.language?.code}
              placeholder="en"
            />
            <div className="flex min-w-0 flex-col gap-4">
              <LocalizedField
                name={`languages.${i}.name`}
                label={`Langue ${i + 1}`}
                defaultValue={row.language?.name}
                placeholder={{ fr: "Anglais", en: "English" }}
              />
              <LocalizedField
                name={`languages.${i}.level`}
                label="Niveau"
                defaultValue={row.language?.level}
                placeholder={{ fr: "professionnel", en: "professional" }}
              />
            </div>
            <button
              type="button"
              onClick={(event) => remove(row.id, event.currentTarget)}
              className="inline-flex size-11 items-center justify-center self-end rounded-md text-ink-muted transition-colors duration-hover hover:bg-seam/60 hover:text-busy-ink max-sm:justify-self-end"
            >
              <Trash2 aria-hidden className="size-4" />
              <span className="sr-only">Retirer la langue {i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
      <FieldError name="languages" />
      <button
        type="button"
        onClick={add}
        className="ledge inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md bg-ground px-3 text-label text-ink [&_svg]:size-4"
      >
        <Plus aria-hidden />
        Ajouter une langue
      </button>
    </fieldset>
  );
};
