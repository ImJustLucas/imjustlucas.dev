import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import {
  ArrowLeft,
  ArrowRight,
  Download,
  Github,
  Globe,
  Languages,
  Linkedin,
  MapPin,
} from "lucide-react";

import { DIPLOMAS } from "@/components/diplomas/diplomas";
import { routeMetadata } from "@/components/page-header";
import { PrintButton } from "@/components/recruiter/PrintButton";
import {
  SECONDARY_LINK,
  TypographyData,
  TypographyHeadline,
  TypographyMuted,
  TypographyP,
  TypographyTitle,
} from "@/components/typography";
import { Button, buttonVariants } from "@/components/ui/button";
import { projectPath, ROUTES } from "@/config/routes";
import { OWNER_NAME, SITE_URL } from "@/config/site";
import { localizedPath } from "@/i18n/alternates";
import { Link } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { formatPeriod } from "@/lib/content/format-period";
import { loadout } from "@/lib/content/loadout";
import {
  getExperiences,
  getFeaturedProjects,
  getProfile,
  getProjects,
  getResume,
} from "@/lib/content/server";
import { cvStructuredData, jsonLdScript } from "@/lib/seo/structured-data";
import { cn } from "@/lib/utils";

// The skills come from every Project and the selected ones carry live star
// counts: regenerated daily like the Projects page, and on every deploy.
export const dynamic = "force-static";
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.cv);

/** How many Techs the skills show: the loadout's most used, not all of it. */
const SKILLS_SHOWN = 12;

const LANGUAGES = [
  { key: "french", code: "fr" },
  { key: "english", code: "en" },
] as const;

/** A link as a resume prints it: no scheme, no `www.`, no trailing slash. */
const shownUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * The recruiter mode: the player profile as one sober page, outside the
 * client. Who Lucas is, his experience, selected Projects, skills, education
 * and languages, all read from the content; no game chrome, no sound. The
 * print stylesheet lays it out on A4 for "Save as PDF".
 */
export default async function RecruiterMode() {
  const locale = await getLocale();
  const [t, tMetadata, tDiplomas, tContracts, tLocale, tLayout] =
    await Promise.all([
      getTranslations("Recruiter"),
      getTranslations("Metadata"),
      getTranslations("Experiences.diplomas"),
      getTranslations("Experiences.contractTypes"),
      getTranslations("LocaleSwitcher"),
      getTranslations("Layout"),
    ]);
  const [profile, resume, experiences, projects, featured] = await Promise.all([
    getProfile(),
    getResume(locale),
    getExperiences(locale),
    getProjects(locale),
    getFeaturedProjects(locale),
  ]);

  const techs = loadout(projects).map((entry) => entry.tech.name);
  const skills = techs.slice(0, SKILLS_SHOWN);
  const otherLocale: Locale =
    routing.locales.find((other) => other !== locale) ?? routing.defaultLocale;
  const pageUrl = new URL(localizedPath(ROUTES.cv.path, locale), SITE_URL);
  const links = [
    {
      icon: Globe,
      label: t("website"),
      href: new URL(localizedPath("/", locale), SITE_URL).href,
    },
    { icon: Linkedin, label: "LinkedIn", href: profile.links.linkedin },
    { icon: Github, label: "GitHub", href: profile.links.github },
  ];

  const structuredData = cvStructuredData({
    locale,
    profile,
    jobTitle: tMetadata("jobTitle"),
    description: tMetadata("description"),
    worksFor: experiences
      .filter((experience) => experience.period.end === "ongoing")
      .map((experience) => ({
        name: experience.company,
        url: experience.link,
      })),
    alumniOf: DIPLOMAS.map((diploma) => diploma.institution),
    knowsAbout: techs,
    knowsLanguage: LANGUAGES.map((language) => language.code),
  });

  return (
    <div
      data-cv-page
      className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 text-ink sm:px-6 sm:py-10 print:max-w-none print:p-0"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
      />

      {/* The way back to the game, and what a recruiter does with the page */}
      <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 print:hidden">
        <Link
          href={ROUTES.me.path}
          className={cn(
            SECONDARY_LINK,
            "group inline-flex items-center gap-1.5 py-2.5 text-label font-medium",
          )}
        >
          <ArrowLeft
            aria-hidden
            className="size-4 transition-transform duration-hover ease-out group-hover:-translate-x-0.5 motion-reduce:transition-none"
          />
          {t("back")}
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={ROUTES.cv.path}
            locale={otherLocale}
            hrefLang={otherLocale}
            className={buttonVariants({ variant: "ghost", className: "px-3" })}
          >
            <Languages aria-hidden />
            {tLocale("switch")}
          </Link>
          <Button asChild variant="outline">
            <a href={resume.asset} download>
              <Download aria-hidden />
              {t("downloadResume")}
            </a>
          </Button>
          <PrintButton label={t("print")} />
        </div>
      </nav>

      <article className="tray flex flex-col gap-8 rounded-lg border-2 border-seam bg-raised p-5 sm:p-8 md:p-10 print:gap-6 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <Image
              src="/images/chibi-avatar-64x64.png"
              alt={tLayout("avatarAlt")}
              width={64}
              height={64}
              priority
              className="size-14 shrink-0 rounded-full bg-ground ring-2 ring-seam sm:size-16"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <TypographyHeadline as="h1">{OWNER_NAME}</TypographyHeadline>
              <TypographyMuted className="text-pretty text-[1.0625rem] font-medium">
                {t("headline")}
              </TypographyMuted>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <TypographyMuted className="inline-flex min-h-8 w-fit items-center gap-2 rounded-full border-2 border-seam bg-ground px-3 py-1 font-medium leading-tight text-ink">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full bg-online"
              />
              {t("availability")}
            </TypographyMuted>
            <ul
              aria-label={t("linksTitle")}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-label text-ink-muted"
            >
              <li className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4" />
                {t("location")}
              </li>
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label}: ${shownUrl(link.href)}`}
                    className={cn(
                      SECONDARY_LINK,
                      "inline-flex items-center gap-1.5 py-1 font-medium",
                    )}
                  >
                    <link.icon aria-hidden className="size-4 shrink-0" />
                    {shownUrl(link.href)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <TypographyP className="max-w-[65ch] text-pretty text-ink [&:not(:first-child)]:mt-0">
            {t("summary")}
          </TypographyP>
        </header>

        <div className="grid gap-10 border-t-2 border-seam pt-8 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-12 print:grid-cols-[minmax(0,1fr)_12.5rem] print:gap-8 print:pt-6">
          <div className="flex min-w-0 flex-col gap-10 print:gap-6">
            <Section id="experience" title={t("experienceTitle")}>
              <ol className="flex flex-col gap-6 print:gap-4">
                {experiences.map((experience) => (
                  <li
                    key={`${experience.company} ${experience.period.start}`}
                    className="flex break-inside-avoid flex-col gap-1"
                  >
                    <Entry
                      title={
                        <a
                          href={experience.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={SECONDARY_LINK}
                        >
                          {experience.company}
                        </a>
                      }
                      period={formatPeriod(experience.period, locale)}
                    />
                    <TypographyMuted className="text-ink">
                      {experience.role}
                      <span className="text-ink-muted">
                        {" · "}
                        {tContracts(experience.contractType)}
                      </span>
                    </TypographyMuted>
                    <Description>{experience.description}</Description>
                  </li>
                ))}
              </ol>
            </Section>

            {featured.length > 0 && (
              <Section
                id="projects"
                title={t("projectsTitle")}
                aside={
                  <Link
                    href={ROUTES.what.path}
                    className={cn(
                      SECONDARY_LINK,
                      "group inline-flex items-center gap-1 py-1 text-label font-medium print:hidden",
                    )}
                  >
                    {t("allProjects")}
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-hover ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </Link>
                }
              >
                <ul className="flex flex-col gap-6 print:gap-4">
                  {featured.map((project) => (
                    <li
                      key={project.slug}
                      className="flex break-inside-avoid flex-col gap-1"
                    >
                      <Entry
                        title={
                          <Link
                            href={projectPath(project.slug)}
                            className={SECONDARY_LINK}
                          >
                            {project.title}
                          </Link>
                        }
                        period={formatPeriod(project.period, locale)}
                      />
                      {project.role && (
                        <TypographyMuted className="text-ink">
                          {project.role}
                        </TypographyMuted>
                      )}
                      <Description>{project.description}</Description>
                      <TypographyMuted>
                        {project.techs.map((tech) => tech.name).join(" · ")}
                      </TypographyMuted>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <aside className="flex flex-col gap-10 print:gap-6">
            {skills.length > 0 && (
              <Section id="skills" title={t("skillsTitle")}>
                <TypographyMuted className="-mt-2">
                  {t("skillsNote")}
                </TypographyMuted>
                <ul className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border-2 border-seam px-2.5 py-0.5 text-tag text-ink"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section id="education" title={t("educationTitle")}>
              <ol className="flex flex-col gap-4">
                {DIPLOMAS.map((diploma) => (
                  <li
                    key={diploma.key}
                    className="flex break-inside-avoid flex-col gap-0.5"
                  >
                    <span className="text-label font-semibold text-ink">
                      {tDiplomas(diploma.key)}
                    </span>
                    <span className="text-label text-ink-muted">
                      {diploma.institution}
                    </span>
                    <TypographyData className="text-ink-muted">
                      {diploma.years}
                    </TypographyData>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="languages" title={t("languagesTitle")}>
              <dl className="flex flex-col gap-2">
                {LANGUAGES.map((language) => (
                  <div key={language.key} className="flex flex-col">
                    <dt className="text-label font-semibold text-ink">
                      {t(`languages.${language.key}`)}
                    </dt>
                    <dd className="text-label text-ink-muted">
                      {t(`languages.${language.key}Level`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          </aside>
        </div>

        {/* On paper, where to find the page that stays current */}
        <TypographyMuted className="hidden border-t-2 border-seam pt-4 print:block">
          {t("liveVersion", { url: shownUrl(pageUrl.href) })}
        </TypographyMuted>
      </article>
    </div>
  );
}

function Section({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 print:gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <TypographyTitle as="h2" id={id}>
          {title}
        </TypographyTitle>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** An entry's name and Period, on one line while it fits. */
function Entry({ title, period }: { title: React.ReactNode; period: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <TypographyTitle as="h3" className="text-[1rem]">
        {title}
      </TypographyTitle>
      <TypographyData className="text-ink-muted">{period}</TypographyData>
    </div>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return (
    <TypographyP className="text-pretty text-ink-muted [&:not(:first-child)]:mt-0">
      {children}
    </TypographyP>
  );
}
