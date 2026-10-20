import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Slot } from "@radix-ui/react-slot";

/**
 * The client's buttons (DESIGN.md, Buttons): chunky controls on a ledge that
 * sink when pressed. `play` is the one Tangerine primary action of a screen;
 * `default` is the Velvet ledge button; `ghost` and `link` have no ledge
 * because they are not raised controls.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-label disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "ledge bg-raised text-ink hover:bg-seam/40",
        play: "ledge ledge-tangerine bg-tangerine font-display text-play text-night",
        destructive: "ledge bg-busy-ink text-cream dark:text-night",
        outline: "ledge border-2 border-seam bg-ground text-ink",
        secondary: "ledge bg-raised text-ink hover:bg-seam/40",
        ghost:
          "text-ink transition-colors duration-hover ease-out hover:bg-seam/60",
        link: "text-tangerine-ink underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3",
        lg: "h-[52px] px-6",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
