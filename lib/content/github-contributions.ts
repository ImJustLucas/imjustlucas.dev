import { Context, Data, Effect, Layer, Schedule, Schema } from "effect";

import { fetchExternalText } from "./external-source";
import type { ContributionDay, ContributionHistory } from "./player-level";

/** GitHub did not return the Contributions of this account. */
export class GitHubContributionsUnavailable extends Data.TaggedError(
  "GitHubContributionsUnavailable",
)<{
  readonly login: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * The Contributions of a GitHub account, by login: every one since the
 * account was opened, and the last year day by day. An external source
 * consumed only by the content catalog.
 */
export class GitHubContributions extends Context.Service<
  GitHubContributions,
  {
    /** None when no token is configured: the Level is then not shown. */
    readonly history: (
      login: string,
    ) => Effect.Effect<
      ContributionHistory | undefined,
      GitHubContributionsUnavailable
    >;
  }
>()("content/GitHubContributions") {
  /**
   * Reads GitHub's GraphQL API, which needs a token (`GITHUB_TOKEN`; a
   * fine-grained token with no permission reads public Contributions).
   * Without one, there is no history; any failure is
   * `GitHubContributionsUnavailable`.
   */
  static readonly layer = (token: string | undefined) =>
    Layer.succeed(GitHubContributions, {
      history: (login) =>
        token
          ? readHistory(token, login).pipe(
              Effect.timeout("5 seconds"),
              Effect.retry({
                times: 2,
                schedule: Schedule.exponential("200 millis"),
              }),
              Effect.mapError(
                (cause) =>
                  new GitHubContributionsUnavailable({
                    login,
                    message: `GitHub Contributions unavailable for ${login}: ${cause.message}`,
                    cause,
                  }),
              ),
            )
          : Effect.succeed(undefined),
    });

  /** Fixed histories by login; fails for any other account. */
  static readonly layerTest = (
    histories: Readonly<Record<string, ContributionHistory>>,
  ) =>
    Layer.succeed(GitHubContributions, {
      history: (login) =>
        Object.hasOwn(histories, login)
          ? Effect.succeed(histories[login]!)
          : Effect.fail(
              new GitHubContributionsUnavailable({
                login,
                message: `GitHub Contributions unavailable for ${login}`,
              }),
            ),
    });
}

const INTENSITY = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

/** The account's Contribution years and its last year, day by day. */
const CalendarResponse = Schema.Struct({
  data: Schema.Struct({
    user: Schema.Struct({
      contributionsCollection: Schema.Struct({
        contributionYears: Schema.Array(Schema.Number),
        contributionCalendar: Schema.Struct({
          weeks: Schema.Array(
            Schema.Struct({
              contributionDays: Schema.Array(
                Schema.Struct({
                  date: Schema.String,
                  contributionCount: Schema.Number,
                  contributionLevel: Schema.Literals(
                    Object.keys(INTENSITY) as Array<keyof typeof INTENSITY>,
                  ),
                }),
              ),
            }),
          ),
        }),
      }),
    }),
  }),
});

/** Each year's total, one alias per year (`y2024`). */
const YearsResponse = Schema.Struct({
  data: Schema.Struct({
    user: Schema.Record(
      Schema.String,
      Schema.Struct({
        contributionCalendar: Schema.Struct({
          totalContributions: Schema.Number,
        }),
      }),
    ),
  }),
});

const CALENDAR_QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionYears
      contributionCalendar {
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

/** One collection per year: GitHub counts at most a year per collection. */
const yearsQuery = (years: ReadonlyArray<number>) => `query ($login: String!) {
  user(login: $login) {
${years
  .map(
    (year) =>
      `    y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") { contributionCalendar { totalContributions } }`,
  )
  .join("\n")}
  }
}`;

const graphql = <S extends Schema.Top>(
  token: string,
  query: string,
  login: string,
  response: S,
) =>
  fetchExternalText(
    "https://api.github.com/graphql",
    {
      authorization: `bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "imjustlucas.dev",
    },
    JSON.stringify({ query, variables: { login } }),
  ).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Schema.fromJsonString(response))),
  );

const readHistory = (token: string, login: string) =>
  Effect.gen(function* () {
    const calendar = yield* graphql(
      token,
      CALENDAR_QUERY,
      login,
      CalendarResponse,
    );
    const { contributionYears, contributionCalendar } =
      calendar.data.user.contributionsCollection;
    const years = contributionYears.filter(Number.isInteger);
    const totals =
      years.length === 0
        ? { data: { user: {} } }
        : yield* graphql(token, yearsQuery(years), login, YearsResponse);
    const days = contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map(
        (day): ContributionDay => ({
          date: day.date,
          count: day.contributionCount,
          intensity: INTENSITY[day.contributionLevel],
        }),
      ),
    );
    return {
      total: Object.values(totals.data.user).reduce(
        (sum, year) => sum + year.contributionCalendar.totalContributions,
        0,
      ),
      days,
    } satisfies ContributionHistory;
  });
