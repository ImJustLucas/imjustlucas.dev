import {
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { timeline } from "./config/timeline";

export default function Experiences() {
  return (
    <div className="">
      <TypographyH2 border={false}>My experiences</TypographyH2>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Professional Experiences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  {index !== timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border" />
                  )}
                </div>
                <a href={event.link}>
                  <div>
                    <TypographyP>{event.date}</TypographyP>
                    <TypographyH4>{event.title}</TypographyH4>
                    <TypographySmall>{event.contract}</TypographySmall>
                    <TypographyMuted>{event.description}</TypographyMuted>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <TypographyH3>Diplomas</TypographyH3>
    </div>
  );
}
