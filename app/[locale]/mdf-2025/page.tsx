import { useTranslations } from "next-intl";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { ROUTES } from "@/config/routes";

import MasterDevScene from "./components/master-dev-scene";

export const generateMetadata = routeMetadata(ROUTES.mdf2025);

export default function MasterDevFrance2025Page() {
  const t = useTranslations("Mdf2025");

  return (
    <div className="w-full h-full">
      <PageHeader route={ROUTES.mdf2025} />
      <div className="relative w-full h-[600px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-800 via-indigo-600 to-purple-500">
        <MasterDevScene />
      </div>
      <div className="mt-6 text-muted-foreground">
        <p>{t("winner")}</p>
      </div>
    </div>
  );
}
