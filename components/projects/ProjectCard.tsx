"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { Project } from "@/types/project";

import { LinkButton } from "../ui/link-button";

type ProjectType = {
  project: Project;
};

export const ProjectCard: React.FC<ProjectType> = ({ project }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setOffset({ x: x * 20, y: y * 20 });
    };

    cardRef.current?.addEventListener("mousemove", handleMouseMove);
    return () =>
      cardRef.current?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Card
      ref={cardRef}
      className="relative overflow-hidden transition-all duration-300 hover:shadow-xl max-w-sm h-[500px] flex flex-col"
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        <Image
          src={project.image || "/placeholder.svg?height=200&width=400"}
          alt="Project Image"
          layout="fill"
          objectFit="cover"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(1.1)`,
          }}
          className="transition-transform duration-300"
        />
      </div>
      <CardHeader className="flex-none">
        <CardTitle className="text-2xl font-bold line-clamp-1">
          {project.title}
        </CardTitle>
        <CardDescription>{project.date}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <p className="mb-4 line-clamp-3">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.techs.map((tech, index) => (
            <Badge key={index} className={`text-sm py-1 px-2 ${tech.color}`}>
              {tech.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between flex-none  bg-card">
        {project.openSource && (
          <LinkButton
            href={project.links.github || "https://github.com/imjustlucas"}
            variant="outline"
            size="sm"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
            {project.stars && (
              <>
                <span className="ml-1">{project.stars}</span>
                <Star className="ml-2 h-4 w-4 " />
              </>
            )}
          </LinkButton>
        )}
        {project.links.external && (
          <Button className="ml-auto" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
