import { getTranslations } from "next-intl/server";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { PageBanner, routeMetadata } from "@/components/page-header";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { SECONDARY_LINK, TypographyP } from "@/components/typography";
import { VideoCard } from "@/components/videos/VideoCard";
import { ROUTES } from "@/config/routes";
import { getProfile, getVideos } from "@/lib/content/server";

/** Videos are read from the channel at build time, then once a day. */
// Static, as the uncached feed fetch would otherwise make it dynamic.
export const dynamic = "force-static";
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.videos);

/** The replays: the channel's Videos, newest first, or the empty slot. */
export default async function VideosPage() {
  const [videos, profile, t] = await Promise.all([
    getVideos(),
    getProfile(),
    getTranslations("Videos"),
  ]);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <PageBanner
        route={ROUTES.videos}
        intro={t("intro")}
        pose="series"
        poseAlt={t("chibiAlt")}
      />

      {videos.length === 0 ? (
        <div className="tray flex flex-col items-center gap-5 rounded-lg bg-raised p-6 text-center sm:flex-row sm:p-card sm:text-left">
          <div className="relative size-32 shrink-0 sm:size-36">
            <span
              aria-hidden
              className="absolute inset-[6%] rounded-full bg-ground"
            />
            <ChibiSprite
              pose="chilling"
              alt={t("emptyAlt")}
              sizes="144px"
              className="size-full"
            />
          </div>
          <div className="flex flex-col gap-3">
            <TypographyP>{t("empty")}</TypographyP>
            <TypographyP className="text-ink-muted [&:not(:first-child)]:mt-0">
              {t.rich("subscribe", {
                link: (chunks) => (
                  <SoundOnPress>
                    <a
                      href={profile.links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={SECONDARY_LINK}
                    >
                      {chunks}
                    </a>
                  </SoundOnPress>
                ),
              })}
            </TypographyP>
          </div>
        </div>
      ) : (
        <ul className="grid gap-slot-gap md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
