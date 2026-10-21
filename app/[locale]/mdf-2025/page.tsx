import { getLocale, getTranslations } from "next-intl/server";

import { ArrowLeft } from "lucide-react";

import { routeMetadata } from "@/components/page-header";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { SECONDARY_LINK } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { getAchievements } from "@/lib/content/server";
import { cn } from "@/lib/utils";

import MasterDevScene from "./components/master-dev-scene";
import { UnlockBanner } from "./components/unlock-banner";

export const generateMetadata = routeMetadata(ROUTES.mdf2025);

/**
 * The reward screen of the legendary achievement: the unlock banner, then
 * the trophy in its showcase, where the visitor throws coins at the cheque.
 */
export default async function MasterDevFrance2025Page() {
  const locale = await getLocale();
  const [achievements, t] = await Promise.all([
    getAchievements(locale),
    getTranslations("Mdf2025"),
  ]);
  const achievement = achievements.find(
    ({ link }) => link === ROUTES.mdf2025.path,
  );

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <UnlockBanner year={achievement?.year ?? 2025} />

      <section aria-label={t("showcase")}>
        <MasterDevScene />
      </section>

      <SoundOnPress>
        <Link
          href={ROUTES.me.path}
          className={cn(
            SECONDARY_LINK,
            "group inline-flex min-h-11 items-center gap-2 self-start text-label",
          )}
        >
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform duration-hover ease-out group-hover:-translate-x-1 motion-reduce:transition-none"
          />
          {t("back")}
        </Link>
      </SoundOnPress>
    </div>
  );
}
