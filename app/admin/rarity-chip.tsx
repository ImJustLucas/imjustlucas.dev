import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { TypographyTag } from "@/components/typography";
import type { Rarity } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import fr from "@/messages/fr.json";

/** The site's rarity tag, labelled in French, for an entry's closed row. */
export const RarityChip: React.FC<{ rarity: Rarity }> = ({ rarity }) => (
  <TypographyTag
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-on-bright",
      RARITY_STYLE[rarity].tag,
    )}
  >
    {fr.Rarity[rarity]}
  </TypographyTag>
);
