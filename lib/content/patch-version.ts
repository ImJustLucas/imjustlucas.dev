/**
 * Patch versions, `<season>.<patch>` with an optional hotfix number, e.g.
 * `2.4` or `2.4.1`. The season is the first number: Season 1 is the first
 * portfolio, Season 2 the Player Profile. Plain code, no Effect import, so
 * components and the Admin use it too.
 */

/** A version: whole numbers without leading zeros, so each has one spelling. */
export const PATCH_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)(\.(0|[1-9]\d*))?$/;

const numbers = (version: string) => {
  const [season = 0, patch = 0, hotfix = 0] = version.split(".").map(Number);
  return [season, patch, hotfix] as const;
};

/** The season a version belongs to: its first number. */
export const seasonOf = (version: string) => numbers(version)[0];

/**
 * Newest first: by season, then patch, then hotfix (`2.4` comes before
 * `2.4.1`, its hotfix).
 */
export const byVersionNewestFirst = (a: string, b: string) => {
  const [x, y] = [numbers(a), numbers(b)];
  return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
};

/**
 * The version a new patch most likely takes after `latest`: the next patch
 * of its season (`2.4` and `2.4.1` give `2.5`); `1.0` when there is none.
 */
export const nextVersion = (latest: string | undefined) => {
  if (latest === undefined || !PATCH_VERSION.test(latest)) return "1.0";
  const [season, patch] = numbers(latest);
  return `${season}.${patch + 1}`;
};
