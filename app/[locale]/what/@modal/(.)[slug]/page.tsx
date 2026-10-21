import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { X } from "lucide-react";

import { projectMetadata } from "@/components/projects/project-metadata";
import { ProjectInspect } from "@/components/projects/ProjectInspect";
import {
  ProjectWindow,
  ProjectWindowClose,
} from "@/components/projects/ProjectWindow";
import { getProject, getProjectSlugs } from "@/lib/content/server";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const generateMetadata = projectMetadata;

/** The id of the window's title, naming the dialog. */
const TITLE_ID = "project-window-title";

/**
 * A Project's page, intercepted when its card is pressed on the inventory:
 * the same inspect screen as a window over the inventory, which stays
 * where it was. A reload or a shared link shows the page itself.
 */
export default async function ProjectWindowPage({
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
    <ProjectWindow titleId={TITLE_ID}>
      <ProjectInspect
        project={project}
        headingLevel="h2"
        titleId={TITLE_ID}
        className="min-h-[calc(100dvh-12px)] rounded-b-none border-b-0 md:min-h-0 md:rounded-b-lg md:border-b-2 max-md:rounded-t-xl"
        closeControl={
          <ProjectWindowClose label={t("close", { title: project.title })}>
            <X aria-hidden />
          </ProjectWindowClose>
        }
      />
    </ProjectWindow>
  );
}
