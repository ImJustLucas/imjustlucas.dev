import Image from "next/image";

import { ExternalLink, FolderCode, Github, Star } from "lucide-react";

import { TechBadge } from "@/components/tech/TechBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPeriod } from "@/lib/content/format-period";
import type { ResolvedProject } from "@/lib/content/types";

type ProjectCardProps = {
  project: ResolvedProject;
};

// English until the Projects page is translated (#16).
export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl max-w-sm h-[500px] flex flex-col">
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="384px"
            className="object-cover object-top transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <FolderCode aria-hidden className="h-12 w-12" />
          </div>
        )}
      </div>

      <CardHeader className="flex-none relative z-10">
        <CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </CardTitle>
        <CardDescription>
          <span className="text-sm">{formatPeriod(project.period, "en")}</span>
          {project.wip && (
            <Badge className="ml-2 text-xs bg-yellow-400 text-black hover:bg-yellow-400 ">
              WIP
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto relative z-10">
        <p className="mb-4 line-clamp-3">{project.description.en}</p>
        <div className="flex flex-wrap gap-2">
          {project.techs.map((tech) => (
            <TechBadge key={tech.id} tech={tech} />
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between flex-none bg-card/80 backdrop-blur-sm relative z-[5]">
        {project.repository && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="group-hover:border-primary/50 transition-colors"
          >
            <a
              href={project.repository}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
              GitHub
              {project.stars !== undefined && (
                <>
                  <span className="ml-1">{project.stars}</span>
                  <Star aria-hidden />
                </>
              )}
            </a>
          </Button>
        )}
        {project.externalLink && (
          <Button
            asChild
            size="sm"
            className="ml-auto group-hover:bg-primary/90 transition-colors"
          >
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title}`}
            >
              <ExternalLink />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
