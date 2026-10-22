import { Context, Data, Effect, Layer, Schedule, Schema } from "effect";

import { fetchExternalText } from "./external-source";

/** GitHub did not return a star count for this repository. */
export class GitHubStarsUnavailable extends Data.TaggedError(
  "GitHubStarsUnavailable",
)<{
  readonly repository: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The star counts of public GitHub repositories, by repository link
 * (`https://github.com/<owner>/<repository>`). An external source consumed
 * only by the content catalog.
 */
export class GitHubStars extends Context.Service<
  GitHubStars,
  {
    readonly count: (
      repository: string,
    ) => Effect.Effect<number, GitHubStarsUnavailable>;
  }
>()("content/GitHubStars") {
  /**
   * Reads `stargazers_count` from the public GitHub REST API, with the token
   * when one is configured (`GITHUB_TOKEN`: 5,000 requests an hour instead
   * of 60 per IP address, which a build alone can exhaust). Any failure is
   * `GitHubStarsUnavailable`.
   */
  static readonly layer = (token: string | undefined) =>
    Layer.succeed(GitHubStars, {
      count: (repository) =>
        fetchExternalText(
          `https://api.github.com/repos${new URL(repository).pathname}`,
          {
            accept: "application/vnd.github+json",
            "user-agent": "imjustlucas.dev",
            "x-github-api-version": "2022-11-28",
            ...(token ? { authorization: `bearer ${token}` } : {}),
          },
        ).pipe(
          Effect.flatMap(Schema.decodeUnknownEffect(RepositoryResponse)),
          Effect.map((body) => body.stargazers_count),
          Effect.timeout("5 seconds"),
          Effect.retry({
            times: 2,
            schedule: Schedule.exponential("200 millis"),
          }),
          Effect.mapError(
            (cause) =>
              new GitHubStarsUnavailable({
                repository,
                message: `GitHub stars unavailable for ${repository}: ${cause.message}`,
                cause,
              }),
          ),
        ),
    });

  /** Fixed star counts by repository link; fails for any other repository. */
  static readonly layerTest = (counts: Readonly<Record<string, number>>) =>
    Layer.succeed(GitHubStars, {
      count: (repository) =>
        Object.hasOwn(counts, repository)
          ? Effect.succeed(counts[repository]!)
          : Effect.fail(
              new GitHubStarsUnavailable({
                repository,
                message: `GitHub stars unavailable for ${repository}`,
              }),
            ),
    });
}

/** `GET /repos/{owner}/{repo}`, of which only the star count is read. */
const RepositoryResponse = Schema.fromJsonString(
  Schema.Struct({ stargazers_count: Schema.Number }),
);
