import { Effect } from "effect";

import { openAchievementsEditor } from "@/lib/admin/achievements";
import type { AdminActionResult } from "@/lib/admin/action-result";
import { AdminAccess, type AdminAction } from "@/lib/admin/admin-action";
import { contentRepository, ownerGithubId } from "@/lib/admin/config";
import { openExperiencesEditor } from "@/lib/admin/experiences";
import { openHobbiesEditor } from "@/lib/admin/hobbies";
import { openOverview } from "@/lib/admin/overview";
import { openProfileEditor } from "@/lib/admin/profile";
import { openProjectsEditor } from "@/lib/admin/projects";
import { sessionIdentities } from "@/lib/admin/session";
import { openTechsEditor } from "@/lib/admin/techs";
import { makeGitHubRepository } from "@/lib/content/repository-github";

import "server-only";

/**
 * Entry point for Admin pages and Server Actions, and the only place
 * `app/admin/` runs the Admin's Effect code: against the signed-in session
 * and the GitHub content repository, opened with the Owner's token. It
 * returns plain data (ADR-0002).
 */
const run = <A, E>(effect: Effect.Effect<A, E, AdminAccess>): Promise<A> =>
  Effect.runPromise(
    Effect.provide(
      effect,
      AdminAccess.layer({
        identities: sessionIdentities,
        ownerGithubId: ownerGithubId(),
        repositoryFor: (owner) =>
          makeGitHubRepository({
            ...contentRepository(),
            token: owner.accessToken,
          }),
      }),
    ),
  );

/**
 * Runs any Admin action (e.g. `createTech` from `lib/admin/techs.ts`) on
 * `input`, for a Server Action.
 */
export const runAdminAction = <I>(
  action: (input: I) => AdminAction,
  input: I,
): Promise<AdminActionResult> => run(action(input));

/** Reads the Techs editor's content from the content branch, with its revision. */
export const getTechsEditor = () => run(openTechsEditor);

/** Reads the Experiences editor's content from the content branch, with its revision. */
export const getExperiencesEditor = () => run(openExperiencesEditor);

/** Reads the Projects editor's content from the content branch, with its revision. */
export const getProjectsEditor = () => run(openProjectsEditor);

/** Reads the Profile editor's content from the content branch, with its revision. */
export const getProfileEditor = () => run(openProfileEditor);

/** Reads the Achievements editor's content from the content branch, with its revision. */
export const getAchievementsEditor = () => run(openAchievementsEditor);

/** Reads the Hobbies editor's content from the content branch, with its revision. */
export const getHobbiesEditor = () => run(openHobbiesEditor);

/**
 * Reads the Admin home's overview of the content branch (counts, Resume
 * dates, alerts) for `today` (`YYYY-MM-DD`, Europe/Paris).
 */
export const getOverview = (today: string) => run(openOverview(today));
