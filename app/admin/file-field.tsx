"use client";

import { type ChangeEvent, useEffect, useId, useRef, useState } from "react";

import { FileText, ImageUp } from "lucide-react";

import { FieldError, FieldLabel, useFieldError } from "@/app/admin/admin-form";
import {
  UPLOAD_MAX_BYTES,
  uploadField,
  type UploadKind,
} from "@/lib/admin/upload";
import { cn } from "@/lib/utils";

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} Ko`
    : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;

/**
 * Uploads a file of `kind` with the rest of its form. Too heavy a file is
 * stopped here, before it exceeds the Server Action's body limit; the action
 * checks it again (`lib/admin/upload.ts`). The file in place, then the one
 * picked, shows beside the picker.
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
  const errorId = useId();
  const { accept, hint, tooHeavy } = uploadField(kind);
  const [picked, setPicked] = useState<{ name: string; size: number }>();
  const [preview, setPreview] = useState<string>();

  const input = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  // A form emptied after a save forgets the picked file
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const forget = () => {
      setPicked(undefined);
      setPreview(undefined);
    };
    form.addEventListener("reset", forget);
    return () => form.removeEventListener("reset", forget);
  }, []);

  const check = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.setCustomValidity(
      file && file.size > UPLOAD_MAX_BYTES ? tooHeavy : "",
    );
    input.reportValidity();
    setPicked(file && { name: file.name, size: file.size });
    setPreview(
      file && kind === "image" ? URL.createObjectURL(file) : undefined,
    );
  };

  const shown = preview ?? (kind === "image" ? current : undefined);
  const Icon = kind === "image" ? ImageUp : FileText;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel label={label} hint={hint} />
      <div className="flex min-w-0 items-stretch gap-3">
        {kind === "image" && (
          <span className="flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-seam bg-ground sm:w-36">
            {shown ? (
              // A local preview or a site path: no optimisation needed
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shown}
                alt=""
                className="size-full object-cover object-top"
              />
            ) : (
              <Icon aria-hidden className="size-5 text-ink-muted" />
            )}
          </span>
        )}
        <label
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-seam bg-ground px-3 py-2.5 transition-colors duration-hover hover:border-ink-muted/50",
            "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action-ink",
            error && "border-solid border-busy-ink",
          )}
        >
          <input
            ref={input}
            type="file"
            name={name}
            accept={accept}
            required={required}
            onChange={check}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="sr-only"
          />
          <span
            aria-hidden
            className="ledge inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-raised px-3 text-label text-ink [&_svg]:size-4"
          >
            <Icon />
            {picked ? "Changer" : "Choisir"}
          </span>
          <span className="min-w-0 flex-1 text-label">
            {picked ? (
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-ink">{picked.name}</span>
                <span className="font-mono text-data text-ink-muted">
                  {size(picked.size)} · publié avec le reste
                </span>
              </span>
            ) : current ? (
              <span className="flex min-w-0 flex-col">
                <span className="text-ink-muted">Fichier actuel</span>
                <span className="truncate font-mono text-data text-ink">
                  {current}
                </span>
              </span>
            ) : (
              <span className="text-ink-muted">
                {required ? "Aucun fichier choisi" : "Aucun fichier"}
              </span>
            )}
          </span>
        </label>
      </div>
      <FieldError name={name} id={errorId} />
    </div>
  );
};
