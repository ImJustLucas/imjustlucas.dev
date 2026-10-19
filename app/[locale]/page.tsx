import { getTranslations } from "next-intl/server";

import { Download } from "lucide-react";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { Bold, TypographyH4, TypographyP } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Separator } from "@radix-ui/react-dropdown-menu";

export const generateMetadata = routeMetadata(ROUTES.me);

export default async function Home() {
  const t = await getTranslations("Home");
  const resumeLastUpdated = new Date(Date.UTC(2025, 4, 28));

  return (
    <div className="md:w-2/3 w-full">
      <PageHeader route={ROUTES.me} />
      <TypographyP>
        {t.rich("intro", {
          bold: (chunks) => <Bold>{chunks}</Bold>,
          br: () => <br />,
        })}
      </TypographyP>

      <Separator className="my-8" />

      <TypographyH4>{t("creativeMindsetTitle")}</TypographyH4>
      <TypographyP>{t("creativeMindset")}</TypographyP>

      <Separator className="my-8" />

      <div className="mt-4 flex items-center gap-4">
        <Button asChild>
          <a href="/pdf/cv-lucas.pdf" download>
            <Download className="mr-2 h-4 w-4" />
            {t("downloadResume")}
          </a>
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("resumeLastUpdated", { date: resumeLastUpdated })}
        </span>
      </div>

      <Separator className="my-8" />

      <TypographyH4>{t("faqTitle")}</TypographyH4>

      <div className="w-full max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b border-border">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all   [&[data-state=open]>svg]:rotate-180">
              {t("faq.whyImjustlucas.question")}
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 text-muted-foreground">
              {t("faq.whyImjustlucas.answer")}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b border-border">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all   [&[data-state=open]>svg]:rotate-180">
              {t("faq.favoriteLanguages.question")}
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 text-muted-foreground">
              {t("faq.favoriteLanguages.answer")}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-b border-border">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all   [&[data-state=open]>svg]:rotate-180">
              {t("faq.coffeeOrTea.question")}
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 text-muted-foreground">
              {t("faq.coffeeOrTea.answer")}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
