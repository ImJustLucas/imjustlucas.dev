import { getLocale, getTranslations } from "next-intl/server";

import { Download } from "lucide-react";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { Bold, TypographyH4, TypographyP } from "@/components/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/config/routes";
import { getResume } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.me);

export default async function Home() {
  const locale = await getLocale();
  const [t, resume] = await Promise.all([
    getTranslations("Home"),
    getResume(locale),
  ]);

  return (
    <div className="md:w-2/3 w-full">
      <PageHeader route={ROUTES.me} />
      <TypographyP>
        {t.rich("intro", {
          bold: (chunks) => <Bold>{chunks}</Bold>,
          br: () => <br />,
        })}
      </TypographyP>

      <Separator className="my-8 h-0" />

      <TypographyH4>{t("creativeMindsetTitle")}</TypographyH4>
      <TypographyP>{t("creativeMindset")}</TypographyP>

      <Separator className="my-8 h-0" />

      <div className="mt-4 flex items-center gap-4">
        <Button asChild>
          <a href={resume.asset} download>
            <Download className="mr-2 h-4 w-4" />
            {t("downloadResume")}
          </a>
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("resumeLastUpdated", { date: new Date(resume.lastUpdated) })}
        </span>
      </div>

      <Separator className="my-8 h-0" />

      <TypographyH4>{t("faqTitle")}</TypographyH4>

      <div className="w-full max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              {t("faq.whyImjustlucas.question")}
            </AccordionTrigger>
            <AccordionContent>
              {t("faq.whyImjustlucas.answer")}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              {t("faq.favoriteLanguages.question")}
            </AccordionTrigger>
            <AccordionContent>
              {t("faq.favoriteLanguages.answer")}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>{t("faq.coffeeOrTea.question")}</AccordionTrigger>
            <AccordionContent>{t("faq.coffeeOrTea.answer")}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
