import { getLocale, getTranslations } from "next-intl/server";

import { DiplomaTable } from "@/components/diplomas/AllDiplomas";
import { PageHeader, routeMetadata } from "@/components/page-header";
import {
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { formatPeriod } from "@/lib/content/format-period";
import { getExperiences } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.experiences);

export default async function Experiences() {
  const locale = await getLocale();
  const [experiences, t] = await Promise.all([
    getExperiences(locale),
    getTranslations("Experiences"),
  ]);

  return (
    <div className="">
      <PageHeader route={ROUTES.experiences} />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("professionalTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <div
                key={`${experience.company} ${experience.period.start}`}
                className="flex"
              >
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  {index !== experiences.length - 1 && (
                    <div className="w-0.5 h-full bg-border" />
                  )}
                </div>
                <a href={experience.link}>
                  <div>
                    <TypographyP>
                      {formatPeriod(experience.period, locale)}
                    </TypographyP>
                    <TypographyH4>
                      {experience.company} - {experience.role}
                    </TypographyH4>
                    <TypographySmall>
                      {t(`contractTypes.${experience.contractType}`)}
                    </TypographySmall>
                    <TypographyMuted>{experience.description}</TypographyMuted>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <TypographyH3>{t("diplomasTitle")}</TypographyH3>
      <DiplomaTable />
    </div>
  );
}
