import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

type TechProps = {
  category: {
    name: string;
    description: string;
    techs: {
      name: string;
      color: string;
    }[];
  };
};

export const TechCard: React.FC<TechProps> = ({ category }) => {
  return (
    <Card key={category.name} className="overflow-hidden">
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.techs.map((tech) => (
            <Badge
              key={tech.name}
              className={`text-sm py-1 px-2 ${tech.color}`}
            >
              {tech.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
