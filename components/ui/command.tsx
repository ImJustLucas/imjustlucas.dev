"use client";

import * as React from "react";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * shadcn's Command on cmdk, drawn in the client's vocabulary: a combobox
 * (the field) over a listbox of 44px rows, the chosen row taking the action
 * fill on its ledge like the active tab. cmdk keeps the keyboard, the
 * selection and `aria-activedescendant`.
 */
const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn("flex size-full flex-col text-ink", className)}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

/** The field: the Admin's input (ground, 2px seam border), with a search mark. */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-md border-2 border-seam bg-ground px-3 transition-colors duration-hover ease-out focus-within:border-action-ink/70">
    <Search aria-hidden className="size-5 shrink-0 text-ink-muted" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent text-base text-ink caret-action-ink outline-none placeholder:text-ink-muted/75",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("overflow-y-auto overscroll-contain", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

/** A section, headed by a lowercase Tag in the muted ink, like the theme menu's. */
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-tag [&_[cmdk-group-heading]]:text-ink-muted [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

/**
 * A 44px row: an 18px line icon, the label, details pushed right. The
 * chosen row (keyboard or pointer) takes the action fill on its 3px action
 * ledge, `on-action` text.
 */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "group/item flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-label text-ink outline-none transition-[background-color,color,box-shadow] duration-hover ease-out [&_svg]:shrink-0",
      "data-[selected=true]:bg-action data-[selected=true]:text-on-action data-[selected=true]:shadow-[0_3px_0_rgb(var(--action-ledge))]",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export { Command, CommandGroup, CommandInput, CommandItem, CommandList };
