// Type-only view of content for React components, which never import Effect
// (ADR-0002). Every export here is erased at build time.
export type { ResolvedTechCategory } from "./catalog";
export type { LocalizedText, Tech } from "./schema";
