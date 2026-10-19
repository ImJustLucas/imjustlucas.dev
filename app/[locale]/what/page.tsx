import { PageHeader, routeMetadata } from "@/components/page-header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ROUTES } from "@/config/routes";

import { projects } from "./config/projects";

export const generateMetadata = routeMetadata(ROUTES.what);

export default function What() {
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
