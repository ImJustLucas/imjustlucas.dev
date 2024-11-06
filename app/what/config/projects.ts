import { Project } from "@/types/project";

export const projects: Project[] = [
  {
    title: "Riders Fund",
    date: "October 2024",
    image: "/images/projects/riders-fund.png",
    wip: true,
    description: "A platform to help riders in need of financial assistance.",
    techs: [
      { name: "React", color: "bg-blue-400 text-white" },
      { name: "Next.js", color: "bg-black text-white" },
      {
        name: "Shadcn/ui",
        color: "bg-purple-500 text-white",
      },
      {
        name: "Tailwind CSS",

        color: "bg-teal-400 text-white",
      },
    ],
    links: {},
    openSource: false,
  },

  {
    title: "Qotum",
    date: "2024 - now",
    image: "/images/projects/qotum.png",
    wip: true,
    description: "Qotum - The smartest way to respond to your ratings with AI.",
    techs: [
      { name: "Next.js", color: "bg-black text-white" },
      {
        name: "NestJS",
        color: "bg-red-500 text-white",
      },
    ],
    links: {},
    openSource: false,
  },

  {
    title: "Next 13 Boilerplate",
    date: "November 2023",
    image: "/images/projects/next-13-boilerplate.png",
    description:
      "💙 Magnificent Next.js 13 boilerplate with Pages router, TypeScript, ...",
    techs: [
      { name: "React", color: "bg-blue-400 text-white" },
      { name: "Next.js", color: "bg-black text-white" },
      {
        name: "Styled Components",
        color: "bg-pink-500 text-white",
      },
    ],
    links: {
      github: "https://github.com/ImJustLucas/Next-13-Boilerplate",
      external: "https://next-13-boilerplate.imjustlucas.dev/",
    },
    openSource: true,
    stars: 16,
  },

  {
    title: "Bun Elysia Boilerplate",
    date: "May 2024",
    image: "/images/projects/bun-elysia-boilerplate.png",
    description: "🩶 Gorgeous Bun-Elysia boilerplate with TypeScript",
    techs: [
      { name: "Bun", color: "bg-stone-200 text-white" },
      {
        name: "Elysia.js",
        color: "bg-sky-400 text-white",
      },
      {
        name: "Typescript",
        color: "bg-blue-500 text-white",
      },
    ],
    links: {
      github: "https://github.com/ImJustLucas/bun-elysia-boilerplate",
    },
    openSource: true,
    stars: 25,
  },
];
