import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { ArrowLeft } from "lucide-react";

import { projectMetadata } from "@/components/projects/project-metadata";
import { ProjectInspect } from "@/components/projects/ProjectInspect";
import { SoundOnPress } from "@/components/sound/SoundOnPress";
import { SECONDARY_LINK } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { getProject, getProjectSlugs } from "@/lib/content/server";
import { cn } from "@/lib/utils";

// Live GitHub star count, like the inventory: regenerated every 24 hours,
// and on every deploy.
export const dynamic = "force-static";
export const revalidate = 86400;

/** One page per Project, in every Locale. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const generateMetadata = projectMetadata;

/**
 * A Project's own page, what a shared link or a reload shows: its inspect
 * screen, with a way back to the inventory. Pressed on the inventory, the
 * same screen opens as a window over it instead (`@modal/(.)[slug]`).
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const [project, t] = await Promise.all([
    getProject(locale, slug),
    getTranslations("ProjectPage"),
  ]);
  if (!project) notFound();

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
      <SoundOnPress>
        <Link
          href={ROUTES.what.path}
          className={cn(
            SECONDARY_LINK,
            "inline-flex items-center gap-2 self-start text-label",
          )}
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("back")}
        </Link>
      </SoundOnPress>
      <ProjectInspect project={project} headingLevel="h1" />
    </div>
  );
}
