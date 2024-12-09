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
    title: "Une journée avec un développeur web étudiant | vlog dev",
    thumbnail: "/images/videos/Video1.png",
    url: "https://youtu.be/xzs5jgJWWVU",
    publishedAt: "24-11-2024",
    new: false,
  },
  {
    id: "2",
    title:
      "On upgrade (un peu) mon setup | Une journée en télétravail d’un alternant",
    thumbnail: "/images/videos/Video2.png",
    url: "https://youtu.be/xpul90E3VXM?si=kiqaWnQCWnTRpoH8",
    publishedAt: "8-12-2024",
    new: true,
  },
];
