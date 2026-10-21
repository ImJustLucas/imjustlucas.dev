"use client";

import { useId } from "react";

import { FieldError, FieldLabel, useFieldError } from "@/app/admin/admin-form";
import type { Rarity } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * The Rarities, labelled in French, from the most common, with how each
 * chip shows its colour (DESIGN.md, The Rarity Is Data Rule: the colour
 * marks the Rarity the entry has, here the one chosen).
 */
const RARITIES: ReadonlyArray<{
  value: Rarity;
  label: string;
  disc: string;
  chosen: string;
}> = [
  {
    value: "common",
    label: "commun",
    disc: "bg-common",
    chosen: "has-[:checked]:border-common has-[:checked]:bg-common",
  },
  {
    value: "rare",
    label: "rare",
    disc: "bg-rare",
    chosen: "has-[:checked]:border-rare has-[:checked]:bg-rare",
  },
  {
    value: "epic",
    label: "épique",
    disc: "bg-epic",
    chosen: "has-[:checked]:border-epic has-[:checked]:bg-epic",
  },
  {
    value: "legendary",
    label: "légendaire",
    disc: "bg-legendary",
    chosen: "has-[:checked]:border-legendary has-[:checked]:bg-legendary",
  },
];

/**
 * The Rarity of a Project or an Achievement, as four chips. None is chosen
 * on a new entry, and none is sent until one is.
 */
export const RarityField: React.FC<{ defaultValue?: Rarity }> = ({
  defaultValue,
}) => {
  const error = useFieldError("rarity");
  const errorId = useId();
  return (
    <fieldset
      className="flex min-w-0 flex-col gap-1.5"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1.5">
        <FieldLabel label="Rareté" />
      </legend>
      <div className="flex flex-wrap gap-2">
        {RARITIES.map(({ value, label, disc, chosen }) => (
          <label
            key={value}
            className={cn(
              "group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-seam bg-ground px-3.5 text-label text-ink transition-colors duration-hover hover:border-ink-muted/40 has-[:checked]:text-on-bright",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action-ink",
              error && "border-busy-ink",
              chosen,
            )}
          >
            <input
              type="radio"
              name="rarity"
              value={value}
              defaultChecked={defaultValue === value}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "size-2.5 rounded-full ring-2 ring-seam group-has-[:checked]:ring-on-bright/30",
                disc,
              )}
            />
            {label}
          </label>
        ))}
      </div>
      <FieldError name="rarity" id={errorId} />
    </fieldset>
  );
};
