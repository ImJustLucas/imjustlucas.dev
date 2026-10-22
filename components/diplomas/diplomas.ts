/**
 * Lucas's diplomas, defined once for the Experiences page's medals and the
 * recruiter mode. Diploma names are in the message dictionaries
 * (`Experiences.diplomas.<key>`); institutions are proper nouns.
 */
export const DIPLOMAS = [
  { key: "master", institution: "IIM", years: "2023 - 2025" },
  { key: "bachelor", institution: "Need For School", years: "2020 - 2023" },
  {
    key: "baccalaureate",
    institution: "Lycée Galilée, Franqueville St Pierre",
    years: "2019",
  },
] as const;

export type Diploma = (typeof DIPLOMAS)[number];
