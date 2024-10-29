interface TimelineEvent {
  date: string;
  title: string;
  contract: string;
  link: string;
  description: string;
}

export const timeline: TimelineEvent[] = [
  {
    date: "2023 - Today",
    title: "Favikon - Fullstack Developer",
    contract: "Work-study contract",
    link: "https://favikon.com",
    description:
      "Creation of an innovative SaaS, to optimize influencer marketing strategies 💜",
  },
  {
    date: "2021 - 2023",
    title: "The Tricks Network - Fullstack Developer",
    contract: "Work-study contract",
    link: "https://thetricksnetwork.com",
    description:
      "Creation of a social network intended for extreme sports on web and mobile platforms 🤙",
  },
  {
    date: "2021",
    title: "TNYTR",
    contract: "Internship contract",
    link: "https://tony.tnytr.me/",
    description:
      "First professional experience, creation of a website for a cascadevent",
  },
];
