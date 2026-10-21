"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Check } from "lucide-react";

import { FieldError, FieldLabel, useFieldError } from "@/app/admin/admin-form";
import type { Tech } from "@/lib/content/types";
import { inkOn } from "@/lib/text-color-on";
import { cn } from "@/lib/utils";

/**
 * Picks a Project's Techs among the existing ones, as chips: a picked Tech
 * is drawn as on the site (its colour with the computed ink), the others as
 * outlines. The Techs already picked come first, in their display order,
 * which a save keeps.
 */
export const TechPicker: React.FC<{
  techs: ReadonlyArray<Tech>;
  selected?: ReadonlyArray<string>;
}> = ({ techs, selected = [] }) => {
  const byId = new Map<string, Tech>(techs.map((tech) => [tech.id, tech]));
  const ordered = [
    ...selected.flatMap((id) => byId.get(id) ?? []),
    ...techs.filter((tech) => !selected.includes(tech.id)),
  ];
  const [picked, setPicked] = useState(
    () => new Set(selected.filter((id) => byId.has(id))),
  );
  const error = useFieldError("techs");
  const errorId = useId();
  const box = useRef<HTMLFieldSetElement>(null);

  // A form emptied after a save picks nothing again
  useEffect(() => {
    const form = box.current?.form;
    if (!form) return;
    const forget = () => setPicked(new Set());
    form.addEventListener("reset", forget);
    return () => form.removeEventListener("reset", forget);
  }, []);

  return (
    <fieldset
      ref={box}
      className="flex min-w-0 flex-col gap-1.5"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1.5 flex w-full items-baseline justify-between gap-3">
        <FieldLabel label="Techs" />
        {picked.size === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-label text-ink-muted">
            <span aria-hidden className="size-2 rounded-full bg-away" />
            Aucune : le Project sort des filtres
          </span>
        ) : (
          <span className="font-mono text-data text-ink-muted">
            {picked.size} sur {techs.length}
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-2">
        {ordered.map((tech) => {
          const on = picked.has(tech.id);
          const ink = inkOn(tech.color);
          return (
            <label
              key={tech.id}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 text-tag transition-colors duration-hover",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action-ink",
                !on &&
                  "border-seam bg-ground text-ink hover:border-ink-muted/40",
                on && !ink && "text-ink",
              )}
              style={
                on
                  ? ink
                    ? {
                        backgroundColor: tech.color,
                        borderColor: tech.color,
                        color: ink,
                      }
                    : { borderColor: tech.color }
                  : undefined
              }
            >
              <input
                type="checkbox"
                name="techs"
                value={tech.id}
                defaultChecked={selected.includes(tech.id)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setPicked((ids) => {
                    const next = new Set(ids);
                    if (checked) next.add(tech.id);
                    else next.delete(tech.id);
                    return next;
                  });
                }}
                className="sr-only"
              />
              {on ? (
                <Check aria-hidden className="size-3.5" strokeWidth={3} />
              ) : (
                <span
                  aria-hidden
                  className="size-2.5 rounded-full ring-2 ring-seam"
                  style={{ backgroundColor: tech.color }}
                />
              )}
              {tech.name}
            </label>
          );
        })}
      </div>
      <FieldError name="techs" id={errorId} />
    </fieldset>
  );
};
