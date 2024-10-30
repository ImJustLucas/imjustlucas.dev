"use client";

import React from "react";
import Image from "next/image";

import { ExternalLink, Github, Star } from "lucide-react";

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
import type { Project } from "@/types/project";

import { LinkButton } from "../ui/link-button";

type ProjectType = {
  project: Project;
};

export const ProjectCard: React.FC<ProjectType> = ({ project }) => {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl max-w-sm h-[500px] flex flex-col">
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        <Image
          src={project.image || "/placeholder.svg?height=200&width=400"}
          alt="Project Image"
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300"
        />
      </div>

      <CardHeader className="flex-none relative z-10">
        <CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </CardTitle>
        <CardDescription>{project.date}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto relative z-10">
        <p className="mb-4 line-clamp-3">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.techs.map((tech, index) => (
            <Badge
              key={index}
              className={`text-sm py-1 px-2 transition-all duration-300 ${tech.color} group-hover:shadow-lg group-hover:scale-105`}
            >
              {tech.name}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between flex-none bg-card/80 backdrop-blur-sm relative z-[5]">
        {project.openSource && (
          <LinkButton
            href={project.links.github || "https://github.com/imjustlucas"}
            variant="outline"
            size="sm"
            className="group-hover:border-primary/50 transition-colors"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
            {project.stars && (
              <>
                <span className="ml-1">{project.stars}</span>
                <Star className="ml-2 h-4 w-4" />
              </>
            )}
          </LinkButton>
        )}
        {project.links.external && (
          <Button
            className="ml-auto group-hover:bg-primary/90 transition-colors"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
