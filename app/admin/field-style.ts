/** Styles the Admin's fields share, plain code so server components read them too. */

/**
 * The Admin's input: 44px, the ground colour pressed into the raised row,
 * a 2px seam border that turns the error colour on a field error, and Body
 * size so phones do not zoom in on focus.
 */
export const INPUT =
  "h-11 w-full min-w-0 rounded-md border-2 border-seam bg-ground px-3 text-base text-ink transition-colors duration-hover ease-out placeholder:text-ink-muted/75 hover:border-ink-muted/40 aria-[invalid=true]:border-busy-ink";
