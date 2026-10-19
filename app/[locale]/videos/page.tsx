import { getTranslations } from "next-intl/server";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { TypographyP, TypographySmall } from "@/components/typography";
import { VideoCard } from "@/components/videos/VideoCard";
import { ROUTES } from "@/config/routes";
import { getVideos } from "@/lib/content/server";

/** Videos are read from the channel at build time, then once a day. */
// Static, as the uncached feed fetch would otherwise make it dynamic.
export const dynamic = "force-static";
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.videos);

export default async function VideosPage() {
  const [videos, t] = await Promise.all([
    getVideos(),
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
                  href="https://youtube.com/@imjustlucas"
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
