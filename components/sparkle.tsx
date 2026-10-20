import { cn } from "@/lib/utils";

/** Lucas's hand tattoo: a four-point star with slightly concave sides. */
export const SPARKLE_PATH =
  "M12 1.5C12.9 8.4 15.6 11.1 22.5 12C15.6 12.9 12.9 15.6 12 22.5C11.1 15.6 8.4 12.9 1.5 12C8.4 11.1 11.1 8.4 12 1.5Z";

/**
 * The site's one ornament: outlined, as tattooed (the frame's backdrop tile
 * draws it the same way in CSS), or filled, as the mark of legendary items.
 */
export function Sparkle({
  filled = false,
  className,
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-4", className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 1 : 1.6}
      strokeLinejoin="round"
    >
      <path d={SPARKLE_PATH} />
    </svg>
  );
}
