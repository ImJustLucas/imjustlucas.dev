import { getLocale } from "next-intl/server";

import { PageHeader, routeMetadata } from "@/components/page-header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ROUTES } from "@/config/routes";
import { getProjects } from "@/lib/content/server";

// Live GitHub star counts: regenerated every 24 hours, and on every deploy.
// Static, as the uncached GitHub fetch would otherwise make it dynamic.
export const dynamic = "force-static";
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.what);

export default async function What() {
  const projects = await getProjects(await getLocale());

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader route={ROUTES.what} />
      <ul className="grid gap-slot-gap md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <li key={project.title}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
