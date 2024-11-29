import {
  TypographyH2,
  TypographyP,
  TypographySmall,
} from "@/components/typography";
import { VideoCardBadge } from "@/components/VideoCard";
import { videos } from "@/app/videos/config/videos";

export default function VideosPage() {
  return (
    <div className="w-full">
      <TypographyH2 border={false}>youtube videos</TypographyH2>

      {videos.length === 0 ? (
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
          {videos.map((video) => (
            <VideoCardBadge key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
