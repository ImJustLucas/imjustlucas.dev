import { Project } from "@/types/project";

export const projects: Project[] = [
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
    title: "Tricks",
    date: "2021 - 2023",
    image: "/images/projects/tricks.png",
    wip: false,
    description:
      "Creation of a social network intended for extreme sports on web and mobile platforms 🤙",
    techs: [
      { name: "Nuxt.js", color: "bg-green-400 text-white" },
      {
        name: "Strapi",
        color: "bg-purple-600 text-white",
      },
    ],
    links: {
      external: "https://tonytrancard.fr/projects_side/thetricksnetwork",
    },
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
    stars: 32,
  },
];
