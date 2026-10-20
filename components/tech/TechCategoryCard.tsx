import { useTranslations } from "next-intl";

import { SoundOnPress } from "@/components/sound/SoundOnPress";
import {
  TypographyData,
  TypographyP,
  TypographyTitle,
} from "@/components/typography";
import type { TechCategoryInLocale } from "@/lib/content/types";

import { TechBadge } from "./TechBadge";

type TechCategoryCardProps = {
  category: TechCategoryInLocale;
};

/**
 * A bag of the loadout: a Tech category as a raised slot, its item count,
 * and its Techs as chips in a sunken well. Hovering the bag ticks and the
 * chips settle one after the other.
 */
export const TechCategoryCard: React.FC<TechCategoryCardProps> = ({
  category,
}) => {
  const t = useTranslations("How");

  return (
    <SoundOnPress cue={null} tick>
      <article className="group tray flex h-full flex-col gap-4 rounded-lg bg-raised p-4 sm:p-card">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <TypographyTitle as="h2" className="text-[1.375rem]">
              {category.name}
            </TypographyTitle>
            <TypographyData className="shrink-0 text-ink-muted">
              {t("items", { count: category.techs.length })}
            </TypographyData>
          </div>
          <TypographyP className="text-ink-muted [&:not(:first-child)]:mt-0">
            {category.description}
          </TypographyP>
        </div>
        <ul className="flex flex-1 flex-wrap content-start gap-2 rounded-md bg-ground p-3 shadow-[inset_0_2px_0_rgb(var(--ledge))]">
          {category.techs.map((tech, index) => (
            <li
              key={tech.id}
              className="transition-transform duration-hover ease-out [transition-delay:calc(var(--item)*30ms)] group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
              style={{ "--item": index } as React.CSSProperties}
            >
              <TechBadge tech={tech} className="px-3 py-1 text-label" />
            </li>
          ))}
        </ul>
      </article>
    </SoundOnPress>
  );
};
