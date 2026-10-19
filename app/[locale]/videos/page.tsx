import { getTranslations } from "next-intl/server";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { TypographyP, TypographySmall } from "@/components/typography";
import { VideoCard } from "@/components/videos/VideoCard";
import { ROUTES } from "@/config/routes";
import { getProfile, getVideos } from "@/lib/content/server";

/** Videos are read from the channel at build time, then once a day. */
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.videos);

export default async function VideosPage() {
  const [videos, profile, t] = await Promise.all([
    getVideos(),
    getProfile(),
    getTranslations("Videos"),
  ]);

  return (
    <div className="w-full">
      <PageHeader route={ROUTES.videos} />

      {videos.length === 0 ? (
        <TypographyP>
          {t("empty")}
          <br />
          <TypographySmall>
            {t.rich("subscribe", {
              link: (chunks) => (
                <a
                  href={profile.links.youtube}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </TypographySmall>
        </TypographyP>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
