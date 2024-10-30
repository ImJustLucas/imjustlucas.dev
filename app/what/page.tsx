import { ProjectCard } from "@/components/projects/ProjectCard";
import { TypographyH2 } from "@/components/typography";

import { projects } from "./config/projects";

export default function What() {
  return (
    <div className="">
      <TypographyH2 border={false}>What i&apos;ve done ?</TypographyH2>
      <div className="flex flex-wrap gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
