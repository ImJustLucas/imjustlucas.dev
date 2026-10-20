import { getLocale, getTranslations } from "next-intl/server";

import { PageBanner, routeMetadata } from "@/components/page-header";
import { TechCategoryCard } from "@/components/tech/TechCategoryCard";
import { ROUTES } from "@/config/routes";
import { getTechCategories } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.how);

/** The loadout: each Tech category a bag of Techs, in the Owner's order. */
export default async function How() {
  const locale = await getLocale();
  const [techCategories, t] = await Promise.all([
    getTechCategories(locale),
    getTranslations("How"),
  ]);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <PageBanner
        route={ROUTES.how}
        intro={t("intro")}
        pose="coding"
        poseAlt={t("chibiAlt")}
      />
      {/* An odd last bag takes the full row */}
      <ul className="grid gap-slot-gap lg:grid-cols-2 lg:[&>li:last-child:nth-child(odd)]:col-span-2">
        {techCategories.map((category) => (
          <li key={category.name}>
            <TechCategoryCard category={category} />
          </li>
        ))}
      </ul>
    </div>
  );
}
