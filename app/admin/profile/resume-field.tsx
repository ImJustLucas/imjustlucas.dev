"use client";

import type { ChangeEvent } from "react";

import { FieldError, useFieldError } from "@/app/admin/admin-form";
import { RESUME_MAX_BYTES } from "@/lib/admin/resume-pdf";
import { cn } from "@/lib/utils";

/**
 * Picks the PDF that replaces a Locale's Resume. Too heavy a file is stopped
 * here, before it exceeds the Server Action's body limit; the action checks
 * it again.
 */
export const ResumeField: React.FC = () => {
  const error = useFieldError("file");
  const check = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.setCustomValidity(
      file && file.size > RESUME_MAX_BYTES
        ? "PDF trop lourd : 4 Mo au maximum"
        : "",
    );
    input.reportValidity();
  };
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Nouveau PDF (4 Mo au maximum)</span>
      <input
        type="file"
        name="file"
        accept="application/pdf"
        required
        onChange={check}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-md border border-input bg-background px-3 py-2",
          error && "border-destructive",
        )}
      />
      <FieldError name="file" />
    </label>
  );
};
