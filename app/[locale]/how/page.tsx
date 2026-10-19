import { getLocale, getTranslations } from "next-intl/server";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { TechCategoryCard } from "@/components/tech/TechCategoryCard";
import { TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { getTechCategories } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.how);

export default async function How() {
  const locale = await getLocale();
  const [techCategories, t] = await Promise.all([
    getTechCategories(locale),
    getTranslations("How"),
  ]);

  return (
    <div className="">
      <PageHeader route={ROUTES.how} />
      <TypographyP>{t("intro")}</TypographyP>
      <div className="grid grid-cols-1 md:grid-cols-2 pt-4 gap-6">
        {techCategories.map((category) => (
          <TechCategoryCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
