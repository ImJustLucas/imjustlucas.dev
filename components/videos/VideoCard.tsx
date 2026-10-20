import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import { Clock } from "lucide-react";

import { TypographyH3 } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Video } from "@/lib/content/types";

export function VideoCard({ video }: { video: Video }) {
  const t = useTranslations("Videos");
  const format = useFormatter();

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-0 relative h-48 w-full shrink-0 overflow-hidden rounded-t-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
          fill
        />
        {video.isNew && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            {t("new")}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <TypographyH3 className="mt-0 text-lg tracking-normal line-clamp-2">
          {video.title}
        </TypographyH3>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <time dateTime={video.publishedAt}>
            {format.dateTime(new Date(video.publishedAt), {
              dateStyle: "long",
            })}
          </time>
        </div>
        <Button variant="default" asChild>
          <a href={video.url} target="_blank" rel="noopener noreferrer">
            {t("watch")}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
