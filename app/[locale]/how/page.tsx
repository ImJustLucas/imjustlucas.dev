import { PageHeader, routeMetadata } from "@/components/page-header";
import { TechCategoryCard } from "@/components/tech/TechCategoryCard";
import { TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { getTechCategories } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.how);

export default async function How() {
  const techCategories = await getTechCategories();

  return (
    <div className="">
      <PageHeader route={ROUTES.how} />
      <TypographyP>
        I leverage cutting-edge technologies to build robust and scalable
        applications. Here&apos;s an overview of my technical expertise:
      </TypographyP>
      <div className="grid grid-cols-1 md:grid-cols-2 pt-4 gap-6">
        {techCategories.map((category) => (
          <TechCategoryCard key={category.name.en} category={category} />
        ))}
      </div>
    </div>
  );
}
