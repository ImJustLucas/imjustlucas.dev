import { videos } from "@/app/videos/config/videos";
import { PageHeader, routeMetadata } from "@/components/page-header";
import { TypographyP, TypographySmall } from "@/components/typography";
import { VideoCardBadge } from "@/components/VideoCard";
import { ROUTES } from "@/config/routes";

export const generateMetadata = routeMetadata(ROUTES.videos);

export default function VideosPage() {
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const sortedVideos = [...videos].sort((a, b) => {
    const dateA = parseDate(a.publishedAt);
    const dateB = parseDate(b.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="w-full">
      <PageHeader route={ROUTES.videos} />

      {sortedVideos.length === 0 ? (
        <TypographyP>
          Cette section est un peu vide pour le moment. Je prévois de commencer
          à faire des vidéos sur le développement logiciel, le lifestyle, la vie
          en général et d&apos;autres sujets qui m&apos;intéressent. Gardez un
          œil sur cette page 🤓
          <br />
          <TypographySmall>
            Psst, vous pouvez vous abonner à ma chaîne{" "}
            <a
              href="https://youtube.com/@imjustlucas"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              ici
            </a>
          </TypographySmall>
        </TypographyP>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {sortedVideos.map((video) => (
            <VideoCardBadge key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
