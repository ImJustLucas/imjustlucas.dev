/**
 * The site's public address and its Owner's names, as search engines should
 * know them (docs/seo.md).
 *
 * The address is the one Vercel serves: `imjustlucas.dev` redirects
 * permanently to `www.imjustlucas.dev`, so canonical and alternate URLs, the
 * sitemap and structured data all name the `www` host, never a URL that
 * redirects.
 */
export const SITE_URL = new URL("https://www.imjustlucas.dev");

/** The Owner's real name, the one people search for. */
export const OWNER_NAME = "Lucas Bellier";

/** The Owner's handle, the site's name and the name on his social profiles. */
export const OWNER_HANDLE = "ImJustLucas";

/** Where the Owner lives, for the Person in structured data. */
export const OWNER_LOCALITY = { city: "Paris", countryCode: "FR" } as const;
