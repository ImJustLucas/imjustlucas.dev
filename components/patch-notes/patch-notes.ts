/** What the patch notes page and its rows share; plain code. */

/** A patch's address on the page, e.g. `v2-9-1` for 2.9.1 (`#v2-9-1`). */
export const patchAnchor = (version: string) =>
  `v${version.replaceAll(".", "-")}`;

/** A patch day (`YYYY-MM-DD`) at noon UTC: the same calendar day in Paris. */
export const patchDay = (date: string) => new Date(`${date}T12:00:00Z`);
