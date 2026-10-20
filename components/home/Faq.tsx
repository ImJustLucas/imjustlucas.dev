"use client";

import { useSounds } from "@/components/sound/SoundProvider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** The FAQ as Velvet accordion rows; opening and closing play the toggle. */
export function Faq({
  entries,
}: {
  entries: ReadonlyArray<{ id: string; question: string; answer: string }>;
}) {
  const { play } = useSounds();
  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={(value) => play(value ? "toggleOn" : "toggleOff")}
      className="flex max-w-[72ch] flex-col gap-3"
    >
      {entries.map((entry) => (
        <AccordionItem key={entry.id} value={entry.id}>
          <AccordionTrigger>{entry.question}</AccordionTrigger>
          <AccordionContent>{entry.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
