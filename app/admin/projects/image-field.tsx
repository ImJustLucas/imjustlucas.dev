"use client";

import type { ChangeEvent } from "react";

import { FieldError, useFieldError } from "@/app/admin/admin-form";
import {
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_IMAGE_TYPES,
} from "@/lib/admin/project-image";
import { cn } from "@/lib/utils";

/**
 * Uploads a Project's image with the rest of its form; left empty, the
 * Project keeps its image. Too heavy a file is stopped here, before it
 * exceeds the Server Action's body limit; the action checks it again.
 */
export const ProjectImageField: React.FC<{ current?: string }> = ({
  current,
}) => {
  const error = useFieldError("image");
  const check = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.setCustomValidity(
      file && file.size > PROJECT_IMAGE_MAX_BYTES
        ? "Image trop lourde : 4 Mo au maximum"
        : "",
    );
    input.reportValidity();
  };
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {current ? "Remplacer l'image" : "Image"} (PNG, JPEG, WebP ou AVIF, 4 Mo
        au maximum)
      </span>
      {current && (
        <span className="text-muted-foreground">Actuelle : {current}</span>
      )}
      <input
        type="file"
        name="image"
        accept={PROJECT_IMAGE_TYPES}
        onChange={check}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-md border border-input bg-background px-3 py-2",
          error && "border-destructive",
        )}
      />
      <FieldError name="image" />
    </label>
  );
};
