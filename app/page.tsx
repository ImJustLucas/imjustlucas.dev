import { Download } from "lucide-react";

import {
  Bold,
  TypographyH2,
  TypographyH4,
  TypographyP,
} from "@/components/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="md:w-2/3 w-full">
      <TypographyH2 border={false}>Who am i?</TypographyH2>
      <TypographyP>
        Yoooo, I&apos;m <Bold>Lucas</Bold>! <br />A french software developer
        based in the heart of Paris, France, with a focus on crafting
        high-quality websites and applications.
      </TypographyP>

      <Separator className="my-8 h-0" />

      <TypographyH4>Creative Mindset</TypographyH4>
      <TypographyP>
        I love tackling projects with a creative approach. My process usually
        starts with a good brainstorming session, lots of inspiration-hunting,
        and diving deep into the latest tech tools. Whether it&apos;s building
        from scratch or refining an existing idea, I aim to create with both
        quality and originality in mind.
      </TypographyP>

      <Separator className="my-8 h-0" />

      <div className="mt-4 flex items-center gap-4">
        <Button asChild>
          <a href="/pdf/cv-lucas.pdf" download>
            <Download className="mr-2 h-4 w-4" />
            Download my resume
          </a>
        </Button>
        <span className="text-sm text-muted-foreground">
          Last updated: May 28, 2025
        </span>
      </div>

      <Separator className="my-8 h-0" />

      <TypographyH4>FAQ</TypographyH4>

      <div className="w-full max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Why imjustlucas?</AccordionTrigger>
            <AccordionContent>
              It&apos;s my reminder to keep it real and stay humble, no matter
              where I go in my career.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Favorite languages?</AccordionTrigger>
            <AccordionContent>
              JavaScript and TypeScript. JavaScript for its versatility and
              dynamic nature, and TypeScript for adding that extra layer of type
              safety and structure. Together, they&apos;re the perfect duo for
              building robust applications!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Coffee or tea?</AccordionTrigger>
            <AccordionContent>
              Definitely coffee. Paris runs on it, after all!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
