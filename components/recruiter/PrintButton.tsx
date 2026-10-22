"use client";

import { Printer } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The recruiter mode's one action: the browser's print dialog, where "Save
 * as PDF" gives the A4 the print stylesheet lays out. Silent, like the rest
 * of the page.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        buttonVariants(),
        "ledge-action bg-action text-on-action hover:bg-action",
      )}
    >
      <Printer aria-hidden />
      {label}
    </button>
  );
}
