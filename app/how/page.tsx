import { PageHeader, routeMetadata } from "@/components/page-header";
import { TechCard } from "@/components/tech-i-use/TechCard";
import { TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";

import { techCategories } from "./config/categories";

export const generateMetadata = routeMetadata(ROUTES.how);

export default function What() {
  return (
    <div className="">
      <PageHeader route={ROUTES.how} />
      <TypographyP>
        I leverage cutting-edge technologies to build robust and scalable
        applications. Here&apos;s an overview of my technical expertise:
      </TypographyP>
      <div className="grid grid-cols-1 md:grid-cols-2 pt-4 gap-6">
        {techCategories.map((category) => (
          <TechCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
