"use client";

import { FieldError } from "@/app/admin/admin-form";
import type { Tech } from "@/lib/content/types";

/**
 * Picks a Tech category's Techs among the existing ones. The Techs already in
 * it come first, in their display order, which a save keeps.
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
  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="mb-1 font-medium">Techs</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {ordered.map((tech) => (
          <label key={tech.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="techs"
              value={tech.id}
              defaultChecked={selected.includes(tech.id)}
            />
            {tech.name}
          </label>
        ))}
      </div>
      <FieldError name="techs" />
    </fieldset>
  );
};
