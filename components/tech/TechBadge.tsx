import { Badge } from "@/components/ui/badge";
import type { Tech } from "@/lib/content/types";
import { textColorOn } from "@/lib/text-color-on";
import { cn } from "@/lib/utils";

type TechBadgeProps = {
  tech: Pick<Tech, "name" | "color">;
  className?: string;
};

/** The one rendering of a Tech: its name on its display colour. */
export const TechBadge: React.FC<TechBadgeProps> = ({ tech, className }) => (
  <Badge
    className={cn("text-sm py-1 px-2", className)}
    style={{ backgroundColor: tech.color, color: textColorOn(tech.color) }}
  >
    {tech.name}
  </Badge>
);
