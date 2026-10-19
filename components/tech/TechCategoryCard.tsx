import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ResolvedTechCategory } from "@/lib/content/types";

import { TechBadge } from "./TechBadge";

type TechCategoryCardProps = {
  category: ResolvedTechCategory;
};

// English until Locales exist (#16).
export const TechCategoryCard: React.FC<TechCategoryCardProps> = ({
  category,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{category.name.en}</CardTitle>
        <CardDescription>{category.description.en}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.techs.map((tech) => (
            <TechBadge key={tech.id} tech={tech} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
