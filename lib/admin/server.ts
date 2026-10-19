import { Effect } from "effect";

import { AdminAccess } from "@/lib/admin/admin-action";
import { CONTENT_REPOSITORY, ownerGithubId } from "@/lib/admin/config";
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
