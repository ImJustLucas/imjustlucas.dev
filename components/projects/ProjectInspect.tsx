import { useLocale, useTranslations } from "next-intl";

import { ExternalLink, Github, Star } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { ProjectViewer } from "@/components/projects/ProjectViewer";
import { RARITY_STYLE } from "@/components/rarity/rarity-style";
import { RarityTag } from "@/components/rarity/RarityTag";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { TechBadge } from "@/components/tech/TechBadge";
import {
  TypographyData,
  TypographyHeadline,
  TypographyMuted,
  TypographyP,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { formatPeriod } from "@/lib/content/format-period";
import type { ProjectInLocale } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type ProjectInspectProps = {
  project: ProjectInLocale;
  /** `h1` on the Project's page, `h2` in the window over the inventory. */
  headingLevel: "h1" | "h2";
  /** The title's id, naming the window. */
  titleId?: string;
  /** Beside the title: the window's close button. */
  closeControl?: React.ReactNode;
  className?: string;
};

/** A long text's paragraphs: separated by a blank line. */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/**
 * A Project's inspect screen: the item in its rarity frame, its title and
 * tags across the top, its screenshots on the left, its stats beside them
 * (what it is, who Lucas was on it, its loadout, its links), and its lore
 * below when the Owner wrote some. Shared by the Project's page and the
 * window over the inventory.
 */
export function ProjectInspect({
  project,
  headingLevel,
  titleId,
  closeControl,
  className,
}: ProjectInspectProps) {
  const t = useTranslations("ProjectPage");
  const tProjects = useTranslations("Projects");
  const locale = useLocale();
  const rarity = RARITY_STYLE[project.rarity];
  const images = [
    ...(project.image ? [project.image] : []),
    ...project.gallery,
  ];
  const lore = (
    [
      ["context", project.context],
      ["built", project.built],
      ["outcome", project.outcome],
    ] as const
  ).filter((entry): entry is [(typeof entry)[0], string] => !!entry[1]);

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "tray relative flex flex-col overflow-clip rounded-lg border-2 bg-raised",
        rarity.frame,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1 shrink-0", rarity.band)} />
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
        <header
          className={cn(
            "flex items-start gap-4",
            // In the window, the close button stays in reach on phones
            closeControl &&
              "max-md:sticky max-md:top-0 max-md:z-10 max-md:bg-raised max-md:pb-3 max-sm:-mx-4 max-sm:-mt-4 max-sm:px-4 max-sm:pt-4 sm:max-md:-mx-6 sm:max-md:-mt-6 sm:max-md:px-6 sm:max-md:pt-6",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <TypographyHeadline
              as={headingLevel}
              id={titleId}
              className="break-words"
            >
              {project.title}
            </TypographyHeadline>
            <div className="flex flex-wrap items-center gap-2 text-ink-muted">
              <RarityTag rarity={project.rarity} />
              {project.wip && (
                <TypographyTag className="rounded-full border-2 border-seam px-2 text-ink">
                  {tProjects("wip")}
                </TypographyTag>
              )}
              <TypographyData className="ml-1">
                {formatPeriod(project.period, locale)}
              </TypographyData>
            </div>
          </div>
          {closeControl}
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
          <ProjectViewer
            title={project.title}
            images={images}
            sizes="(min-width: 1280px) 600px, (min-width: 1024px) 55vw, 100vw"
          />

          <div className="flex min-w-0 flex-col gap-6">
            <TypographyP className="text-pretty text-[1.0625rem] text-ink-muted">
              {project.description}
            </TypographyP>

            {/* The item's holder: Lucas, and who he was on it */}
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
                />
                {/* It illustrates the name beside it */}
                <ChibiSprite
                  pose="coding"
                  alt=""
                  sizes="64px"
                  className="aspect-square w-full"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <TypographyTitle as="p">{t("holder")}</TypographyTitle>
                {(project.role || project.wip) && (
                  <TypographyMuted className="text-pretty">
                    {project.role ?? t("stillOn")}
                  </TypographyMuted>
                )}
              </div>
            </div>

            {project.techs.length > 0 && (
              <div className="flex flex-col gap-2">
                <TypographyTag
                  id={`${project.slug}-loadout`}
                  className="text-ink-muted"
                >
                  {tProjects("loadout")}
                </TypographyTag>
                <ul
                  aria-labelledby={`${project.slug}-loadout`}
                  className="flex flex-wrap gap-1.5"
                >
                  {project.techs.map((tech) => (
                    <li key={tech.id}>
                      <TechBadge tech={tech} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.externalLink || project.repository) && (
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
                {project.externalLink && (
                  <SoundOnPress cue="confirm">
                    <Button
                      asChild
                      variant="play"
                      className="font-sans text-label"
                    >
                      <a
                        href={project.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("visit")}
                        <ExternalLink aria-hidden />
                        <span className="sr-only">{t("newTab")}</span>
                      </a>
                    </Button>
                  </SoundOnPress>
                )}
                {project.repository && (
                  <SoundOnPress>
                    <Button asChild variant="outline">
                      <a
                        href={project.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github aria-hidden />
                        {tProjects("github")}
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
                              {tProjects("stars", { count: project.stars })}
                            </span>
                          </>
                        )}
                        <span className="sr-only">{t("newTab")}</span>
                      </a>
                    </Button>
                  </SoundOnPress>
                )}
              </div>
            )}
          </div>
        </div>

        {lore.length > 0 && (
          <div className="flex flex-col gap-8 border-t-2 border-seam pt-6 lg:pt-8">
            {lore.map(([key, text]) => (
              <section
                key={key}
                className="grid gap-3 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-8"
              >
                <TypographyTitle as={headingLevel === "h1" ? "h2" : "h3"}>
                  {t(key)}
                </TypographyTitle>
                <div>
                  {paragraphs(text).map((paragraph, i) => (
                    <TypographyP
                      key={i}
                      className="text-pretty [&:not(:first-child)]:mt-4"
                    >
                      {paragraph}
                    </TypographyP>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
