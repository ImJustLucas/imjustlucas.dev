// Type-only view of content for React components, which never import Effect
// (ADR-0002). Every export here is erased at build time.
export type {
  AchievementInLocale,
  ExperienceInLocale,
  HobbyInLocale,
  ProjectInLocale,
  ResolvedExperience,
  ResolvedProject,
  ResolvedTechCategory,
  TechCategoryInLocale,
  Video,
} from "./catalog";
export type { LoadoutEntry } from "./loadout";
export type { Period } from "./period";
export type {
  Achievement,
  ContractType,
  Hobby,
  HobbyPose,
  LocalizedText,
  Profile,
  Rarity,
  Resume,
  Tech,
} from "./schema";
