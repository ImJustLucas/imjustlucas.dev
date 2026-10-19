import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import { CONTENT_REPOSITORY, ownerGithubId } from "@/lib/admin/config";
import * as experiences from "@/lib/admin/experiences";
import * as profile from "@/lib/admin/profile";
import * as projects from "@/lib/admin/projects";
import { sessionIdentities } from "@/lib/admin/session";
import * as techs from "@/lib/admin/techs";
import { makeGitHubRepository } from "@/lib/content/repository-github";

import "server-only";

/**
 * Entry point for Admin pages and Server Actions: runs the Admin's Effect
 * code against the signed-in session and the GitHub content repository,
 * opened with the Owner's token, and returns plain data (ADR-0002).
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
            ...CONTENT_REPOSITORY,
            token: owner.accessToken,
          }),
      }),
    ),
  );

type InputOf<F> = F extends (input: infer I) => unknown ? I : never;

/** Reads the Techs editor's content from `main`, with its revision. */
export const getTechsEditor = () => run(techs.openTechsEditor);

export const saveTechs = {
  createTech: (input: InputOf<typeof techs.createTech>) =>
    run(techs.createTech(input)),
  updateTech: (input: InputOf<typeof techs.updateTech>) =>
    run(techs.updateTech(input)),
  deleteTech: (input: InputOf<typeof techs.deleteTech>) =>
    run(techs.deleteTech(input)),
  createTechCategory: (input: InputOf<typeof techs.createTechCategory>) =>
    run(techs.createTechCategory(input)),
  updateTechCategory: (input: InputOf<typeof techs.updateTechCategory>) =>
    run(techs.updateTechCategory(input)),
  deleteTechCategory: (input: InputOf<typeof techs.deleteTechCategory>) =>
    run(techs.deleteTechCategory(input)),
};

/** Reads the Experiences editor's content from `main`, with its revision. */
export const getExperiencesEditor = () =>
  run(experiences.openExperiencesEditor);

export const saveExperiences = {
  createExperience: (input: InputOf<typeof experiences.createExperience>) =>
    run(experiences.createExperience(input)),
  updateExperience: (input: InputOf<typeof experiences.updateExperience>) =>
    run(experiences.updateExperience(input)),
  deleteExperience: (input: InputOf<typeof experiences.deleteExperience>) =>
    run(experiences.deleteExperience(input)),
};

/** Reads the Projects editor's content from `main`, with its revision. */
export const getProjectsEditor = () => run(projects.openProjectsEditor);

export const saveProjects = {
  createProject: (input: InputOf<typeof projects.createProject>) =>
    run(projects.createProject(input)),
  updateProject: (input: InputOf<typeof projects.updateProject>) =>
    run(projects.updateProject(input)),
  deleteProject: (input: InputOf<typeof projects.deleteProject>) =>
    run(projects.deleteProject(input)),
};

/** Reads the Profile editor's content from `main`, with its revision. */
export const getProfileEditor = () => run(profile.openProfileEditor);

export const saveProfile = {
  updateProfile: (input: InputOf<typeof profile.updateProfile>) =>
    run(profile.updateProfile(input)),
  uploadResume: (input: InputOf<typeof profile.uploadResume>) =>
    run(profile.uploadResume(input)),
};
