import { openEditor } from "@/lib/admin/admin-action";
import { adminAlerts } from "@/lib/admin/alerts";

/**
 * The Admin home's read of the content branch: how much each editor holds,
 * the Resumes' dates and the alerts for `today` (`YYYY-MM-DD`, Europe/Paris).
 */
export const openOverview = (today: string) =>
  openEditor((content) => ({
    counts: {
      techs: content.techs.length,
      projects: content.projects.length,
      featured: content.projects.filter((p) => p.featured !== undefined).length,
      experiences: content.experiences.length,
      ongoing: content.experiences.filter((e) => e.period.end === "ongoing")
        .length,
      achievements: content.achievements.length,
      hobbies: content.hobbies.length,
    },
    resumes: {
      en: content.profile.resumes.en.lastUpdated,
      fr: content.profile.resumes.fr.lastUpdated,
    },
    alerts: adminAlerts(content, today),
  }));
