import { describe, expect, it } from "vitest";

import { adminAlerts, monthsBetween, parisDay } from "@/lib/admin/alerts";
import type { Content } from "@/lib/content/schema";
import { testProfile } from "@/lib/content/test-profile";

type Alerted = Parameters<typeof adminAlerts>[0];

const experience = (company: string, start: string) =>
  ({
    company,
    period: { start, end: "ongoing" },
  }) as Content["experiences"][number];

const project = (title: string, techs: ReadonlyArray<string>) =>
  ({ title, techs }) as Content["projects"][number];

const content = (
  resumes: { en: string; fr: string },
  experiences: Alerted["experiences"] = [],
  projects: Alerted["projects"] = [],
): Alerted => ({
  profile: {
    ...testProfile,
    resumes: {
      en: { ...testProfile.resumes.en, lastUpdated: resumes.en },
      fr: { ...testProfile.resumes.fr, lastUpdated: resumes.fr },
    },
  },
  experiences,
  projects,
});

describe("the Admin's alerts", () => {
  it("has nothing to say about recent Resumes and Projects with Techs", () => {
    expect(
      adminAlerts(
        content(
          { en: "2026-09-01", fr: "2026-05-01" },
          [],
          [project("Predi.GG", ["nextjs"])],
        ),
        "2026-10-21",
      ),
    ).toEqual([]);
  });

  it("flags a Resume older than six months", () => {
    expect(
      adminAlerts(
        content({ en: "2026-04-20", fr: "2026-04-21" }),
        "2026-10-21",
      ),
    ).toEqual([
      { kind: "stale-resume", locale: "en", lastUpdated: "2026-04-20" },
    ]);
  });

  it("flags a Resume older than the most recently started Experience", () => {
    expect(
      adminAlerts(
        content({ en: "2026-08-10", fr: "2026-09-02" }, [
          experience("Favikon", "2024-01"),
          experience("Bam Karaoke", "2026-09"),
        ]),
        "2026-10-21",
      ),
    ).toEqual([
      {
        kind: "stale-resume",
        locale: "en",
        lastUpdated: "2026-08-10",
        newerExperience: "Bam Karaoke",
      },
    ]);
  });

  it("does not count an Experience that has not started yet", () => {
    expect(
      adminAlerts(
        content({ en: "2026-09-01", fr: "2026-09-01" }, [
          experience("Next job", "2027"),
        ]),
        "2026-10-21",
      ),
    ).toEqual([]);
  });

  it("flags each Project with no Tech, by its stored position", () => {
    expect(
      adminAlerts(
        content(
          { en: "2026-10-01", fr: "2026-10-01" },
          [],
          [project("Qotum", ["react"]), project("Predi.GG", [])],
        ),
        "2026-10-21",
      ),
    ).toEqual([{ kind: "project-without-tech", index: 1, title: "Predi.GG" }]);
  });
});

describe("the Admin's dates", () => {
  it("counts whole calendar months between two days", () => {
    expect(monthsBetween("2025-05-28", "2026-10-21")).toBe(16);
    expect(monthsBetween("2025-05-21", "2026-10-21")).toBe(17);
    expect(monthsBetween("2026-10-01", "2026-10-21")).toBe(0);
  });

  it("reads today in Paris, where midnight comes before UTC's", () => {
    expect(parisDay(new Date("2026-10-20T22:30:00Z"))).toBe("2026-10-21");
  });
});
