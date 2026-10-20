import { getLocale, getTranslations } from "next-intl/server";

import { ArrowRight, Download, Linkedin } from "lucide-react";

import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import { AchievementSlot } from "@/components/home/AchievementSlot";
import { BannerChibi } from "@/components/home/BannerChibi";
import { Faq } from "@/components/home/Faq";
import { Hobbies } from "@/components/home/Hobbies";
import { routeMetadata } from "@/components/page-header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import {
  TypographyData,
  TypographyDisplay,
  TypographyMuted,
  TypographyP,
  TypographyTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import {
  getAchievements,
  getExperiences,
  getFeaturedProjects,
  getHobbies,
  getProfile,
  getResume,
} from "@/lib/content/server";
import type {
  AchievementInLocale,
  ExperienceInLocale,
  Rarity,
} from "@/lib/content/types";
import { cn } from "@/lib/utils";

// Live GitHub star counts on the featured Projects: regenerated every 24
// hours, and on every deploy. Static, as the uncached GitHub fetch would
// otherwise make it dynamic.
export const dynamic = "force-static";
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.me);

const FAQ = ["whyImjustlucas", "favoriteLanguages", "coffeeOrTea"] as const;
const RARITY_RANK: Record<Rarity, number> = {
  legendary: 3,
  epic: 2,
  rare: 1,
  common: 0,
};

/** The player profile: banner, achievements, inventory, about, FAQ, goodbye. */
export default async function Home() {
  const locale = await getLocale();
  const [t, resume, profile, experiences, achievements, featured, hobbies] =
    await Promise.all([
      getTranslations("Home"),
      getResume(locale),
      getProfile(),
      getExperiences(locale),
      getAchievements(locale),
      getFeaturedProjects(locale),
      getHobbies(locale),
    ]);

  const team = experiences
    .filter((experience) => experience.period.end === "ongoing")
    .slice(0, 3);
  // With two or three, the rarest comes first and is the largest.
  const showcase = [...achievements]
    .sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity])
    .slice(0, 3);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      {/* Banner */}
      <section
        aria-labelledby="greeting"
        className="tray relative overflow-hidden rounded-lg border-2 border-seam bg-raised"
      >
        <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-5 p-4 sm:p-6 md:min-h-[340px] md:grid-cols-[minmax(200px,260px)_1fr] md:grid-rows-[auto_auto_1fr_auto] md:gap-x-8 md:gap-y-4 md:p-7">
          <div className="relative self-center md:row-span-4 md:self-end">
            {/* The chibi's stage: a soft disc he stands in front of */}
            <span
              aria-hidden
              className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
            />
            <BannerChibi className="aspect-square w-full" />
          </div>

          <TypographyDisplay
            id="greeting"
            className="min-w-0 self-center max-sm:text-[1.875rem] md:self-end md:pt-4"
          >
            {t("greeting")}
          </TypographyDisplay>
          <TypographyP className="col-span-2 text-[1.0625rem] font-medium text-ink-muted md:col-span-1 md:col-start-2 md:text-[1.25rem] [&:not(:first-child)]:mt-0">
            {t("role")}
          </TypographyP>

          <CurrentTeam team={team} />

          <div className="col-span-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:col-span-1 md:col-start-2 md:self-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <SoundOnPress cue="confirm">
                <Button
                  asChild
                  variant="play"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <a href={resume.asset} download>
                    <Download aria-hidden className="!size-5" />
                    {t("downloadResume")}
                  </a>
                </Button>
              </SoundOnPress>
              <TypographyData
                as="time"
                dateTime={resume.lastUpdated}
                className="text-center text-ink-muted sm:text-left"
              >
                {t("resumeLastUpdated", { date: new Date(resume.lastUpdated) })}
              </TypographyData>
            </div>
            <SoundOnPress>
              <Button asChild variant="outline" className="sm:ml-2">
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin aria-hidden />
                  LinkedIn
                </a>
              </Button>
            </SoundOnPress>
          </div>
        </div>
      </section>

      {/* Achievement showcase */}
      {showcase.length > 0 && (
        <section aria-labelledby="achievements" className="flex flex-col gap-4">
          <TypographyTitle id="achievements">
            {t("achievementsTitle")}
          </TypographyTitle>
          <Showcase achievements={showcase} />
        </section>
      )}

      {/* Inventory, featured */}
      <section aria-labelledby="inventory" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <TypographyTitle id="inventory">
            {t("inventoryTitle")}
          </TypographyTitle>
          <SeeInventory label={t("seeInventory")} />
        </div>
        {featured.length > 0 && (
          <ul className="grid gap-slot-gap md:grid-cols-2 xl:grid-cols-3">
            {featured.map((project) => (
              <li key={project.title}>
                <ProjectCard
                  project={project}
                  headingLevel="h3"
                  imageSizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* About */}
      <section
        aria-labelledby="about"
        className="grid gap-slot-gap lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="tray flex flex-col gap-3 rounded-lg bg-raised p-5 md:p-card">
          <TypographyTitle id="about">{t("aboutTitle")}</TypographyTitle>
          <TypographyTitle as="h3" className="text-base text-ink-muted">
            {t("creativeMindsetTitle")}
          </TypographyTitle>
          <TypographyP className="[&:not(:first-child)]:mt-0">
            {t("creativeMindset")}
          </TypographyP>
        </div>
        {hobbies.length > 0 && (
          <div className="tray flex flex-col gap-4 rounded-lg bg-raised p-5 md:p-card">
            <TypographyTitle as="h3">{t("hobbiesTitle")}</TypographyTitle>
            <Hobbies hobbies={hobbies} />
          </div>
        )}
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="flex flex-col gap-4">
        <TypographyTitle id="faq">{t("faqTitle")}</TypographyTitle>
        <Faq
          entries={FAQ.map((id) => ({
            id,
            question: t(`faq.${id}.question`),
            answer: t(`faq.${id}.answer`),
          }))}
        />
      </section>

      {/* Goodbye */}
      <section
        aria-label={t("goodbye")}
        className="flex flex-col items-center gap-4 pb-4 text-center"
      >
        <ChibiSprite
          pose="goodbye"
          alt={t("goodbyeAlt")}
          sizes="144px"
          className="size-32 md:size-36"
        />
        <TypographyTitle as="p" className="max-w-[28ch]">
          {t("goodbye")}
        </TypographyTitle>
        <SoundOnPress>
          <Button asChild>
            <Link href={ROUTES.contact.path}>
              {t("sayHi")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </SoundOnPress>
      </section>
    </div>
  );
}

/** Who Lucas plays for right now: his ongoing Experiences, or chilling. */
async function CurrentTeam({
  team,
}: {
  team: ReadonlyArray<ExperienceInLocale>;
}) {
  const t = await getTranslations("Home");
  return (
    <div className="col-span-2 flex flex-col gap-2 md:col-span-1 md:col-start-2 md:self-start">
      <span className="text-label text-ink-muted">{t("currentTeam")}</span>
      {team.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {team.map((experience) => (
            <li
              key={experience.company}
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-seam bg-ground pl-2.5 pr-4 text-label text-ink"
            >
              {experience.emoji && (
                <span aria-hidden className="text-base leading-none">
                  {experience.emoji}
                </span>
              )}
              {experience.company}
              <span className="sr-only">, {experience.role}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3">
          <ChibiSprite
            pose="chilling"
            alt={t("chillingAlt")}
            sizes="64px"
            className="size-16 shrink-0"
          />
          <TypographyMuted className="text-ink">
            {t("chilling")}
          </TypographyMuted>
        </div>
      )}
    </div>
  );
}

/** One wide slot for a single achievement; up to three, rarest first. */
function Showcase({
  achievements,
}: {
  achievements: ReadonlyArray<AchievementInLocale>;
}) {
  const single = achievements.length === 1;
  return (
    <ul
      className={cn(
        single
          ? "flex"
          : "flex snap-x snap-mandatory gap-slot-gap overflow-x-auto pb-2 md:grid md:grid-cols-[2fr_1fr_1fr] md:overflow-visible md:pb-0",
      )}
    >
      {achievements.map((achievement) => (
        <li
          key={achievement.name}
          className={cn(
            single ? "w-full" : "w-[85%] shrink-0 snap-start md:w-auto",
          )}
        >
          <AchievementSlot achievement={achievement} wide={single} />
        </li>
      ))}
    </ul>
  );
}

function SeeInventory({ label }: { label: string }) {
  return (
    <SoundOnPress>
      <Link
        href={ROUTES.what.path}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-label text-action-ink underline decoration-link-line decoration-2 underline-offset-4 transition-colors duration-hover ease-out dark:text-ink dark:hover:text-action-ink"
      >
        {label}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </SoundOnPress>
  );
}
