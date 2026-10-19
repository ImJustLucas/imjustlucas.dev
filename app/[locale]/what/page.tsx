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
  const projects = await getProjects();

  return (
    <div className="">
      <PageHeader route={ROUTES.what} />
      <div className="flex flex-wrap gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
