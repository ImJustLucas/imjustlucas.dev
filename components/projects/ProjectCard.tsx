import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { ExternalLink, FolderCode, Github, Star } from "lucide-react";

import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { RarityTag } from "@/components/rarity/RarityTag";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { TechBadge } from "@/components/tech/TechBadge";
import {
  TypographyData,
  TypographyP,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { projectPath } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { formatPeriod } from "@/lib/content/format-period";
import type { ProjectInLocale } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: ProjectInLocale;
  /** The heading level in the page's outline. */
  headingLevel?: "h2" | "h3";
  /** `sizes` of the screenshot for the grid it sits in. */
  imageSizes?: string;
};

/**
 * An item card: a Project framed by its rarity (2px frame, 4px top band,
 * tag), its screenshot, what it is, its Tech loadout as chips, and its
 * links, with the live GitHub star count when there is one. The whole card
 * opens the Project's page (its title is the link, stretched over the
 * card); on the inventory, as a window over it.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  headingLevel = "h2",
  imageSizes = "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw",
}) => {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const rarity = RARITY_STYLE[project.rarity];

  return (
    <SoundOnPress cue={null} tick>
      <article
        className={cn(
          "tray group relative flex h-full flex-col overflow-hidden rounded-lg border-2 bg-raised",
          rarity.frame,
        )}
      >
        <span aria-hidden className={cn("h-1 shrink-0", rarity.band)} />
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-card sm:pt-4">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-ground">
            {project.image ? (
              <Image
                src={project.image}
                alt=""
                fill
                sizes={imageSizes}
                className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
                <FolderCode aria-hidden className="size-10" />
                <span className="text-label">{t("noImage")}</span>
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <TypographyTitle as={headingLevel} className="min-w-0">
              <SoundOnPress cue="toggleOn">
                <Link
                  href={projectPath(project.slug)}
                  className="rounded-sm decoration-2 underline-offset-4 after:absolute after:inset-0 after:rounded-[14px] group-hover:underline focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-action-ink"
                >
                  {project.title}
                </Link>
              </SoundOnPress>
            </TypographyTitle>
            <RarityTag rarity={project.rarity} className="mt-0.5 shrink-0" />
          </div>

          <div className="-mt-2 flex items-center gap-2 text-ink-muted">
            <TypographyData>
              {formatPeriod(project.period, locale)}
            </TypographyData>
            {project.wip && (
              <TypographyTag className="rounded-full border-2 border-seam px-2 text-ink">
                {t("wip")}
              </TypographyTag>
            )}
          </div>

          <TypographyP className="line-clamp-3 text-ink-muted [&:not(:first-child)]:mt-0">
            {project.description}
          </TypographyP>

          {project.techs.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {project.techs.map((tech) => (
                <li key={tech.id}>
                  <TechBadge tech={tech} />
                </li>
              ))}
            </ul>
          )}

          {(project.repository || project.externalLink) && (
            // Above the stretched link to the Project's page
            <div className="relative z-10 mt-auto flex items-center gap-2 pt-2">
              {project.repository && (
                <SoundOnPress>
                  <Button asChild variant="outline">
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github aria-hidden />
                      {t("github")}
                      {project.stars !== undefined && (
                        <>
                          <span
                            aria-hidden
                            className="ml-1 inline-flex items-center gap-1 text-ink-muted"
                          >
                            <Star className="!size-3.5 fill-current" />
                            <TypographyData>{project.stars}</TypographyData>
                          </span>
                          <span className="sr-only">
                            {t("stars", { count: project.stars })}
                          </span>
                        </>
                      )}
                    </a>
                  </Button>
                </SoundOnPress>
              )}
              {project.externalLink && (
                <SoundOnPress>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="ml-auto"
                  >
                    <a
                      href={project.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("open", { title: project.title })}
                    >
                      <ExternalLink aria-hidden />
                    </a>
                  </Button>
                </SoundOnPress>
              )}
            </div>
          )}
        </div>
      </article>
    </SoundOnPress>
  );
};
