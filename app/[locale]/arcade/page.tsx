import { getTranslations } from "next-intl/server";

import { ArcadeFloor } from "@/components/arcade/ArcadeFloor";
import { routeMetadata } from "@/components/page-header";
import { TypographyHeadline, TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";

export const generateMetadata = routeMetadata(ROUTES.arcade);

/**
 * The Arcade: the client's game library, one cabinet per hobby. Each game
 * loads only here, in the browser.
 */
export default async function Arcade() {
  const [t, tRoutes] = await Promise.all([
    getTranslations("Arcade"),
    getTranslations("Routes"),
  ]);
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col">
      <header className="mb-6 flex flex-col gap-2">
        <TypographyHeadline>{tRoutes("arcade.title")}</TypographyHeadline>
        <TypographyP className="text-pretty text-[1.0625rem] font-medium text-ink-muted [&:not(:first-child)]:mt-0">
          {t("line")}
        </TypographyP>
      </header>
      <ArcadeFloor />
    </div>
  );
}
