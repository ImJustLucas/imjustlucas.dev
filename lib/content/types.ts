// Type-only view of content for React components, which never import Effect
// (ADR-0002). Every export here is erased at build time.
export type {
  ExperienceInLocale,
  ProjectInLocale,
  ResolvedExperience,
  ResolvedProject,
  ResolvedTechCategory,
  TechCategoryInLocale,
  Video,
} from "./catalog";
export type { Period } from "./period";
export type {
  ContractType,
  LocalizedText,
  Profile,
  Resume,
  Tech,
} from "./schema";
