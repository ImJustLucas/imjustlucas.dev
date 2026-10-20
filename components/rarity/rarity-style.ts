import type { Rarity } from "@/lib/content/types";

/**
 * The Rarity Is Data Rule: a rarity colour appears only on an item whose
 * rarity says so, as its 2px frame, 4px top band and tag.
 */
export const RARITY_STYLE: {
  readonly [R in Rarity]: { frame: string; band: string; tag: string };
} = {
  common: {
    frame: "border-common-ink/70 dark:border-common/70",
    band: "bg-common",
    tag: "bg-common",
  },
  rare: { frame: "border-rare", band: "bg-rare", tag: "bg-rare" },
  epic: { frame: "border-epic", band: "bg-epic", tag: "bg-epic" },
  legendary: {
    frame: "border-legendary",
    band: "bg-legendary",
    tag: "bg-legendary",
  },
};
