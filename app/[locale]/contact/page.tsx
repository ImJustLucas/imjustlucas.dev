import { getTranslations } from "next-intl/server";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { TypographyH3, TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { getProfile } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.contact);

const DESTINATIONS = ["northAmerica", "asia", "oceania"] as const;

const externalLink = (href: string) => {
  const ExternalLink = (chunks: React.ReactNode) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {chunks}
    </a>
  );
  return ExternalLink;
};

export default async function Contact() {
  const [{ links }, t] = await Promise.all([
    getProfile(),
    getTranslations("Contact"),
  ]);
  const linkedin = externalLink(links.linkedin);

  return (
    <div className="md:w-2/3 w-full">
      <PageHeader route={ROUTES.contact} />
      <TypographyP>{t.rich("intro", { linkedin })}</TypographyP>
      <TypographyH3>{t("inspirationTitle")}</TypographyH3>
      <TypographyP>
        {t.rich("inspiration", {
          phineas: externalLink("https://github.com/phineas/phineas.io"),
          antoinek: externalLink("https://antoinek.fr"),
        })}
      </TypographyP>
      <TypographyH3>{t("vieTitle")}</TypographyH3>
      <TypographyP>{t.rich("vie", { linkedin })}</TypographyP>
      <TypographyP>{t("destinationsTitle")}</TypographyP>
      <ol className="list-decimal pl-6">
        {DESTINATIONS.map((destination) => (
          <li key={destination}>{t(`destinations.${destination}`)}</li>
        ))}
      </ol>
    </div>
  );
}
