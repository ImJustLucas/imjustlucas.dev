// Type-only view of content for React components, which never import Effect
// (ADR-0002). Every export here is erased at build time.
export type {
  AchievementInLocale,
  ExperienceInLocale,
  HobbyInLocale,
  PatchInLocale,
  ProjectEntry,
  ProjectInLocale,
  RecruiterInLocale,
  ResolvedExperience,
  ResolvedProject,
  Video,
} from "./catalog";
export type { LoadoutEntry } from "./loadout";
export type { Period } from "./period";
export type { ContributionDay, PlayerLevel } from "./player-level";
export type {
  Achievement,
  ContractType,
  Hobby,
  HobbyPose,
  LocalizedText,
  Patch,
  PatchEntry,
  PatchTag,
  Profile,
  Rarity,
  Resume,
  SpokenLanguage,
  Tech,
} from "./schema";
