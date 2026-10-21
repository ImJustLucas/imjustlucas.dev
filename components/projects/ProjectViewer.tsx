"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { FolderCode } from "lucide-react";

import { useSounds } from "@/components/sound/SoundProvider";
import { cn } from "@/lib/utils";

type ProjectViewerProps = {
  title: string;
  /** The main image, then the gallery, in order; none: the placeholder. */
  images: ReadonlyArray<string>;
  /** `sizes` of the screen for the layout it sits in. */
  sizes: string;
};

/**
 * The inspect screen's viewer: a 16:9 screen showing one screenshot, and,
 * when there are several, a strip of thumbnails to pick from, the one shown
 * ringed in the action ink.
 */
export function ProjectViewer({ title, images, sizes }: ProjectViewerProps) {
  const t = useTranslations("ProjectPage");
  const tProjects = useTranslations("Projects");
  const { play } = useSounds();
  const [shown, setShown] = useState(0);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-md bg-ground">
        {images.length > 0 ? (
          // Every image stacked and loaded, so picking one crossfades
          images.map((image, i) => (
            <Image
              key={image}
              src={image}
              alt={
                images.length > 1
                  ? `${t("screenshot", { title })} · ${t("screenshotNumber", {
                      number: i + 1,
                      total: images.length,
                    })}`
                  : t("screenshot", { title })
              }
              aria-hidden={i !== shown}
              fill
              priority={i === 0}
              sizes={sizes}
              className={cn(
                "object-cover object-top transition-opacity duration-hover ease-out",
                i === shown ? "opacity-100" : "opacity-0",
              )}
            />
          ))
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
            <FolderCode aria-hidden className="size-12" />
            <span className="text-label">{tProjects("noImage")}</span>
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul
          aria-label={t("screenshots", { title })}
          className="flex flex-wrap gap-2"
        >
          {images.map((thumbnail, i) => (
            <li key={thumbnail}>
              <button
                type="button"
                aria-label={t("showScreenshot", { number: i + 1 })}
                aria-pressed={i === shown}
                onPointerEnter={() => play("tick")}
                onClick={() => {
                  if (i === shown) return;
                  play("press");
                  setShown(i);
                }}
                className={cn(
                  "relative block aspect-video w-20 overflow-hidden rounded-md border-2 bg-ground transition-[border-color,opacity] duration-hover ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-ink sm:w-24",
                  i === shown
                    ? "border-action-ink"
                    : "border-seam opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
