import { getLocale, getTranslations } from "next-intl/server";

import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

import { Diplomas } from "@/components/diplomas/AllDiplomas";
import { PageBanner, routeMetadata } from "@/components/page-header";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import {
  SECONDARY_LINK,
  TypographyData,
  TypographyP,
  TypographyTag,
  TypographyTitle,
} from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { formatPeriod } from "@/lib/content/format-period";
import { getExperiences } from "@/lib/content/server";
import type { ExperienceInLocale } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export const generateMetadata = routeMetadata(ROUTES.experiences);

/** The career path: Experiences as stops on a track, then the diplomas. */
export default async function Experiences() {
  const locale = await getLocale();
  const [experiences, t] = await Promise.all([
    getExperiences(locale),
    getTranslations("Experiences"),
  ]);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <PageBanner
        route={ROUTES.experiences}
        intro={t("intro")}
        pose="coffee"
        poseAlt={t("chibiAlt")}
      />

      <section aria-labelledby="career" className="flex flex-col gap-4">
        <TypographyTitle id="career">{t("professionalTitle")}</TypographyTitle>
        <ol className="flex flex-col gap-4">
          {experiences.map((experience, index) => (
            <Stop
              key={`${experience.company} ${experience.period.start}`}
              experience={experience}
              index={index}
              last={index === experiences.length - 1}
              // Two current teams in a row: the track between them is lit too
              litTrack={
                experience.period.end === "ongoing" &&
                experiences[index + 1]?.period.end === "ongoing"
              }
            />
          ))}
        </ol>
      </section>

      <section aria-labelledby="diplomas" className="flex flex-col gap-4">
        <TypographyTitle id="diplomas">{t("diplomasTitle")}</TypographyTitle>
        <Diplomas />
      </section>
    </div>
  );
}

/**
 * One stop of the path: the company's disc on the track (lit Online while
 * ongoing, as on the home banner's current team), and its slot. On arrival
 * each stop pops on as the track reaches it.
 */
async function Stop({
  experience,
  index,
  last,
  litTrack,
}: {
  experience: ExperienceInLocale;
  index: number;
  last: boolean;
  litTrack: boolean;
}) {
  const locale = await getLocale();
  const [t, tHome] = await Promise.all([
    getTranslations("Experiences"),
    getTranslations("Home"),
  ]);
  const ongoing = experience.period.end === "ongoing";

  return (
    <li
      className="group relative grid grid-cols-[44px_minmax(0,1fr)] gap-3 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-5"
      style={{ "--stop": index } as React.CSSProperties}
    >
      {!last && (
        // The track to the next stop, from under this disc into the gap
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-4 left-[20px] top-11 w-1 origin-top animate-track-draw rounded-full [animation-delay:calc(var(--stop)*160ms+120ms)] motion-reduce:animate-none sm:left-[26px] sm:top-14",
            litTrack ? "bg-online" : "bg-seam",
          )}
        />
      )}
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex size-11 animate-stop-pop items-center justify-center rounded-full border-2 bg-ground [animation-delay:calc(var(--stop)*160ms)] motion-reduce:animate-none sm:size-14",
          ongoing ? "border-online" : "border-seam",
        )}
      >
        <span className="text-xl leading-none transition-transform duration-release ease-pop group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none sm:text-2xl">
          {experience.emoji ?? (
            <BriefcaseBusiness className="size-5 text-ink-muted sm:size-6" />
          )}
        </span>
        {ongoing && (
          <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-[3px] border-ground bg-online motion-safe:animate-breathe" />
        )}
      </span>

      <SoundOnPress cue={null} tick>
        <article className="tray flex min-w-0 flex-col gap-2 rounded-lg bg-raised p-4 sm:p-card">
          <div className="flex flex-wrap items-center gap-2 text-ink-muted">
            <TypographyData>
              {formatPeriod(experience.period, locale)}
            </TypographyData>
            {ongoing && (
              <TypographyTag className="rounded-full bg-online px-2 py-0.5 text-on-bright">
                {tHome("currentTeam")}
              </TypographyTag>
            )}
          </div>
          <TypographyTitle as="h3" className="text-[1.375rem]">
            <SoundOnPress>
              <a
                href={experience.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  SECONDARY_LINK,
                  "decoration-[3px] underline-offset-[6px]",
                )}
              >
                {experience.company}
                <ArrowUpRight
                  aria-hidden
                  className="ml-1.5 inline-block size-5 align-[-0.1em] transition-transform duration-hover ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </a>
            </SoundOnPress>
          </TypographyTitle>
          <div className="-mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-ink">{experience.role}</span>
            <TypographyTag className="rounded-full border-2 border-seam px-2 text-ink">
              {t(`contractTypes.${experience.contractType}`)}
            </TypographyTag>
          </div>
          <TypographyP className="text-ink-muted [&:not(:first-child)]:mt-0">
            {experience.description}
          </TypographyP>
        </article>
      </SoundOnPress>
    </li>
  );
}
