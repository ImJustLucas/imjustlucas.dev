import { useTranslations } from "next-intl";

import { TypographyTag } from "@/components/typography";
import type { Rarity } from "@/lib/content/types";
import { cn } from "@/lib/utils";

import { RARITY_STYLE } from "./rarity-style";

/** A rarity tag: the rarity's fill with Night text, full radius. */
export function RarityTag({
  rarity,
  className,
}: {
  rarity: Rarity;
  className?: string;
}) {
  const t = useTranslations("Rarity");
  return (
    <TypographyTag
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-night",
        RARITY_STYLE[rarity].tag,
        className,
      )}
    >
      {t(rarity)}
    </TypographyTag>
  );
}
