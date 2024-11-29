export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  new: boolean;
  publishedAt: string;
}
export const videos: YouTubeVideo[] = [
  {
    id: "1",
    title: "Comment j'ai créé mon Portfolio avec Next.js",
    thumbnail: "/images/videos/Video1.png",
    url: "https://youtu.be/xzs5jgJWWVU",
    publishedAt: "13/11/2024",
    new: true,
  },
];
