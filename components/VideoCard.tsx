import Image from "next/image";
import Link from "next/link";

import { Clock } from "lucide-react";

import type { YouTubeVideo } from "@/app/videos/config/videos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function VideoCardBadge({ video }: { video: YouTubeVideo }) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-0 relative h-48 w-full shrink-0 overflow-hidden rounded-t-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-auto object-cover"
          layout="fill"
          objectFit="cover"
        />
        {video.new && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            New
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <h3 className="text-lg font-semibold line-clamp-2">{video.title}</h3>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{video.publishedAt}</span>
        </div>
        <Button key={video.url} variant="default" asChild>
          <Link href={video.url} target="_blank" rel="noopener noreferrer">
            Watch Now!
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
