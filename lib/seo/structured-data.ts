import {
  OWNER_HANDLE,
  OWNER_LOCALITY,
  OWNER_NAME,
  SITE_URL,
} from "@/config/site";
import { localizedPath } from "@/i18n/alternates";
import type { Locale } from "@/i18n/routing";
import type { Profile } from "@/lib/content/types";

const PERSON_ID = new URL("/#person", SITE_URL).href;
const WEBSITE_ID = new URL("/#website", SITE_URL).href;

/**
 * The home page's structured data (schema.org JSON-LD): the Owner as a
 * `Person`, under his real name and his handle, tied to his social profiles
 * (the Profile's links, so search engines join them to the site), and the
 * site as a `WebSite` he authors. `jobTitle` and `description` are in the
 * page's Locale.
 */
export function homeStructuredData({
  locale,
  profile,
  jobTitle,
  description,
}: {
  locale: Locale;
  profile: Profile;
  jobTitle: string;
  description: string;
}) {
  const home = new URL(localizedPath("/", locale), SITE_URL).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: OWNER_NAME,
        alternateName: OWNER_HANDLE,
        url: home,
        image: new URL("/images/chibi/banner-day.webp", SITE_URL).href,
        jobTitle,
        description,
        address: {
          "@type": "PostalAddress",
          addressLocality: OWNER_LOCALITY.city,
          addressCountry: OWNER_LOCALITY.countryCode,
        },
        sameAs: Object.values(profile.links),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: OWNER_HANDLE,
        alternateName: OWNER_NAME,
        url: home,
        inLanguage: locale,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
    ],
  };
}

/**
 * Structured data as the text of a `<script type="application/ld+json">`:
 * `<` is escaped so no content can close the script element.
 */
export const jsonLdScript = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");
