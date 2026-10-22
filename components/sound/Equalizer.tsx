import { cn } from "@/lib/utils";

/**
 * Three bars while music plays (Lucas's Spotify, the radio); still under
 * reduced motion, and still when `playing` is false.
 */
export function Equalizer({
  playing = true,
  className,
}: {
  playing?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("flex h-3 shrink-0 items-end gap-[2px]", className)}
    >
      {[0, 0.25, 0.5].map((delay) => (
        <span
          key={delay}
          className={cn(
            "h-full w-[2px] origin-bottom scale-y-50 rounded-full bg-current",
            playing && "motion-safe:animate-equalizer",
          )}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
