import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import { Play, Youtube } from "lucide-react";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import {
  TypographyData,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { Video } from "@/lib/content/types";

/**
 * A replay tile: the thumbnail leads, a round play disc rises onto it on
 * hover, then the title, the date (with the "new" tag on the latest Video)
 * and an outline button to watch it on YouTube.
 */
export function VideoCard({ video }: { video: Video }) {
  const t = useTranslations("Videos");
  const format = useFormatter();

  return (
    <SoundOnPress cue={null} tick>
      <article className="group tray flex h-full flex-col gap-4 rounded-lg bg-raised p-4 sm:p-card sm:pt-4">
        {/* The same link as the button below, for the mouse; skipped by
            keyboards and screen readers */}
        <SoundOnPress>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden
            className="group/thumb relative block aspect-video overflow-hidden rounded-md bg-ground"
          >
            {/* Seen while the thumbnail loads, never a black box */}
            <span className="absolute inset-0 bg-seam/40 motion-safe:animate-skeleton" />
            <Image
              src={video.thumbnail}
              alt=""
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full border-2 border-seam bg-ground text-ink shadow-[0_4px_0_rgb(var(--ledge))] transition-[opacity,transform,box-shadow] duration-hover ease-out group-active/thumb:!translate-y-[var(--press-depth)] group-active/thumb:shadow-[0_calc(4px-var(--press-depth))_0_rgb(var(--ledge))] group-active/thumb:duration-press [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 motion-reduce:!translate-y-0 motion-reduce:transition-opacity">
                <Play className="ml-0.5 size-6 fill-current" />
              </span>
            </span>
          </a>
        </SoundOnPress>

        <TypographyTitle as="h2" className="line-clamp-2">
          {video.title}
        </TypographyTitle>

        <div className="-mt-2 flex items-center gap-2 text-ink-muted">
          <TypographyData as="time" dateTime={video.publishedAt}>
            {format.dateTime(new Date(video.publishedAt), {
              dateStyle: "long",
            })}
          </TypographyData>
          {video.isNew && (
            <TypographyTag className="rounded-full bg-online px-2 py-0.5 text-on-bright">
              {t("new")}
            </TypographyTag>
          )}
        </div>

        <div className="mt-auto pt-2">
          <SoundOnPress>
            <Button asChild variant="outline">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("watchTitle", { title: video.title })}
              >
                <Youtube aria-hidden />
                {t("watch")}
              </a>
            </Button>
          </SoundOnPress>
        </div>
      </article>
    </SoundOnPress>
  );
}
