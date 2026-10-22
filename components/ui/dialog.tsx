"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import * as DialogPrimitive from "@radix-ui/react-dialog";

/**
 * The client's modal window (shadcn's Dialog on Radix): focus kept inside,
 * the client inert and dimmed by the frame colour behind it, Escape and a
 * press outside close it. Placement and size are the caller's.
 */
const Dialog = DialogPrimitive.Root;

const DialogTitle = DialogPrimitive.Title;

const DialogDescription = DialogPrimitive.Description;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-frame/75 animate-fade-in", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 rounded-lg border-2 border-seam bg-raised text-ink shadow-[var(--float),var(--tray)] focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle };
