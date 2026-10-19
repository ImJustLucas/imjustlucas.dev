"use client";

import type { ChangeEvent } from "react";

import { FieldError, useFieldError } from "@/app/admin/admin-form";
import {
  UPLOAD_MAX_BYTES,
  uploadField,
  type UploadKind,
} from "@/lib/admin/upload";
import { cn } from "@/lib/utils";

/**
 * Uploads a file of `kind` with the rest of its form. Too heavy a file is
 * stopped here, before it exceeds the Server Action's body limit; the action
 * checks it again (`lib/admin/upload.ts`).
 */
export const FileField: React.FC<{
  name: string;
  kind: UploadKind;
  label: string;
  /** The file currently in place, if any. */
  current?: string;
  required?: boolean;
}> = ({ name, kind, label, current, required }) => {
  const error = useFieldError(name);
  const { accept, hint, tooHeavy } = uploadField(kind);
  const check = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.setCustomValidity(
      file && file.size > UPLOAD_MAX_BYTES ? tooHeavy : "",
    );
    input.reportValidity();
  };
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label} ({hint})
      </span>
      {current && (
        <span className="text-muted-foreground">
          Fichier actuel : {current}
        </span>
      )}
      <input
        type="file"
        name={name}
        accept={accept}
        required={required}
        onChange={check}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-md border border-input bg-background px-3 py-2",
          error && "border-destructive",
        )}
      />
      <FieldError name={name} />
    </label>
  );
};
