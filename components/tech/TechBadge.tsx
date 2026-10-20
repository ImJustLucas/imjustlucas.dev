import { TypographyTag } from "@/components/typography";
import type { Tech } from "@/lib/content/types";
import { inkOn } from "@/lib/text-color-on";
import { cn } from "@/lib/utils";

type TechBadgeProps = {
  tech: Pick<Tech, "name" | "color">;
  className?: string;
};

/**
 * The one rendering of a Tech, as a chip: its name on its display colour in
 * the computed ink (Night or Cream), or, when neither reaches 4.5:1, an
 * outline in its colour.
 */
export const TechBadge: React.FC<TechBadgeProps> = ({ tech, className }) => {
  const ink = inkOn(tech.color);
  return (
    <TypographyTag
      className={cn(
        "inline-flex items-center rounded-full border-2 px-2.5 py-0.5",
        !ink && "text-ink",
        className,
      )}
      style={
        ink
          ? { backgroundColor: tech.color, borderColor: tech.color, color: ink }
          : { borderColor: tech.color }
      }
    >
      {tech.name}
    </TypographyTag>
  );
};
