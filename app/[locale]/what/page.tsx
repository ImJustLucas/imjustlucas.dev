import { getLocale, getTranslations } from "next-intl/server";

import { PageBanner, routeMetadata } from "@/components/page-header";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectInventory } from "@/components/projects/ProjectInventory";
import { ROUTES } from "@/config/routes";
import { loadout } from "@/lib/content/loadout";
import { getProjects } from "@/lib/content/server";

// Live GitHub star counts: regenerated every 24 hours, and on every deploy.
// Static, as the uncached GitHub fetch would otherwise make it dynamic.
export const dynamic = "force-static";
export const revalidate = 86400;

export const generateMetadata = routeMetadata(ROUTES.what);

/** The inventory: every Project, sortable and filterable by the loadout of Techs they use. */
export default async function What() {
  const locale = await getLocale();
  const [projects, t] = await Promise.all([
    getProjects(locale),
    getTranslations("Projects"),
  ]);

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-section">
      <PageBanner
        route={ROUTES.what}
        intro={t("intro")}
        pose="coding"
        poseAlt={t("chibiAlt")}
      />
      <ProjectInventory
        loadout={loadout(projects)}
        items={projects.map((project) => ({
          key: project.title,
          title: project.title,
          rarity: project.rarity,
          techIds: project.techs.map((tech) => tech.id),
          card: <ProjectCard project={project} />,
        }))}
      />
    </div>
  );
}
