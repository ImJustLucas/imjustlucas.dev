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
    title: "EP01: Une journée dans la vie d'un développeur web étudiant",
    thumbnail: "/images/videos/Video1.png",
    url: "https://youtu.be/xzs5jgJWWVU",
    publishedAt: "24-11-2024",
    new: false,
  },
  {
    id: "2",
    title:
      "EP02: Une journée dans la vie d'un développeur web étudiant | On upgrade (un peu) mon setup",
    thumbnail: "/images/videos/Video2.png",
    url: "https://youtu.be/xpul90E3VXM?si=kiqaWnQCWnTRpoH8",
    publishedAt: "8-12-2024",
    new: false,
  },
  {
    id: "3",
    title:
      "Comment devenir développeur web ? Mes études et mon parcours d'étudiant",
    thumbnail: "/images/videos/Video3.png",
    url: "https://youtu.be/xpul90E3VXM?si=kiqaWnQCWnTRpoH8",
    publishedAt: "22-12-2024",
    new: false,
  },
  {
    id: "4",
    title:
      "EP03: Une journée dans la vie d'un développeur web étudiant | Mes objectif pour 2025",
    thumbnail: "/images/videos/Video4.png",
    url: "https://youtu.be/xpul90E3VXM?si=kiqaWnQCWnTRpoH8",
    publishedAt: "5-01-2026",
    new: true,
  },
];
