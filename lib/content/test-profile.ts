/** A valid Profile document, for tests that need one but are not about it. */
export const testProfile = {
  links: {
    github: "https://github.com/ImJustLucas",
    linkedin: "https://www.linkedin.com/in/lucasbellier/",
    youtube: "https://www.youtube.com/channel/UCLw4N_gccAY1Y4K4S20IPog",
    instagram: "https://www.instagram.com/imjustlucas_/",
  },
  youtubeChannelId: "UCLw4N_gccAY1Y4K4S20IPog",
  discordUserId: "127063570616811520",
  resumes: {
    en: { asset: "/pdf/cv-lucas.pdf", lastUpdated: "2025-05-28" },
    fr: { asset: "/pdf/cv-lucas-fr.pdf", lastUpdated: "2025-10-07" },
  },
  summary: { en: "I build websites.", fr: "Je fais des sites." },
  availability: { en: "open to opportunities", fr: "ouvert aux opportunités" },
  languages: [
    {
      code: "fr",
      name: { en: "French", fr: "Français" },
      level: { en: "native", fr: "langue maternelle" },
    },
  ],
};
