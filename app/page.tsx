import { Download } from "lucide-react";

import {
  Bold,
  TypographyH2,
  TypographyH4,
  TypographyP,
} from "@/components/typography";
import { Button } from "@/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Separator } from "@radix-ui/react-dropdown-menu";

export default function Home() {
  return (
    <div className="md:w-2/3 w-full">
      <TypographyH2 border={false}>Who am i?</TypographyH2>
      <TypographyP>
        Yoooo, I&apos;m <Bold>Lucas</Bold>! <br />A french software developer
        based in the heart of Paris, France, with a focus on crafting
        high-quality websites and applications.
      </TypographyP>
      <Separator className="my-8" />

      <TypographyH4>Creative Mindset</TypographyH4>
      <TypographyP>
        I love tackling projects with a creative approach. My process usually
        starts with a good brainstorming session, lots of inspiration-hunting,
        and diving deep into the latest tech tools. Whether it’s building from
        scratch or refining an existing idea, I aim to create with both quality
        and originality in mind.
      </TypographyP>

      <Separator className="my-8" />

      <div className="mt-4 flex items-center gap-4">
        <Button asChild>
          <a href="/pdf/CV Lucas 12-05-2025.pdf" download>
            <Download className="mr-2 h-4 w-4" />
            Download my resume
          </a>
        </Button>
        <span className="text-sm text-muted-foreground">
          Last updated: May 12, 2025
        </span>
      </div>

      <Separator className="my-8" />

      <TypographyH4>FAQ</TypographyH4>

      <div className="w-full max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b border-border">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all   [&[data-state=open]>svg]:rotate-180">
              Why imjustlucas?
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 text-muted-foreground">
              It&apos;s my reminder to keep it real and stay humble, no matter
              where I go in my career.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b border-border">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all   [&[data-state=open]>svg]:rotate-180">
              Favorite languages?
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 text-muted-foreground">
              JavaScript and TypeScript. JavaScript for its versatility and
              dynamic nature, and TypeScript for adding that extra layer of type
              safety and structure. Together, they&apos;re the perfect duo for
              building robust applications!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-b border-border">
            <AccordionTrigger className="flex justify-between items-center py-4 font-medium transition-all   [&[data-state=open]>svg]:rotate-180">
              Coffee or tea?
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4 text-muted-foreground">
              Definitely coffee. Paris runs on it, after all!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
