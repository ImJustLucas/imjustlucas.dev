import { TechCard } from "@/components/tech-i-use/TechnologieCard";
import { TypographyH2, TypographyP } from "@/components/typography";

import { techCategories } from "./config/categories";

export default function What() {
  return (
    <div className="">
      <TypographyH2 border={false}>How i create my apps?</TypographyH2>
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
