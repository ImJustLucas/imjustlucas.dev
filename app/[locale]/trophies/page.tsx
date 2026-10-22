import { getTranslations } from "next-intl/server";

import { PageBanner, routeMetadata } from "@/components/page-header";
import { TrophyCabinet } from "@/components/trophies/TrophyCabinet";
import { ROUTES } from "@/config/routes";

export const generateMetadata = routeMetadata(ROUTES.trophies);

/**
 * The visitor's Trophies (docs/trophies.md), as a game client's trophy
 * screen: the count, then one shelf per rarity. The progress lives in the
 * visitor's browser, so the screen is static and fills in on the client.
 */
export default async function TrophiesPage() {
  const t = await getTranslations("Trophies");
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <PageBanner
        route={ROUTES.trophies}
        intro={t("intro")}
        pose="trophy"
        poseAlt={t("chibiAlt")}
      />
      <div className="flex flex-col gap-3">
        <TrophyCabinet />
      </div>
    </div>
  );
}
