import { ROUTES } from "@/config/routes";
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

type PersonInput = {
  locale: Locale;
  profile: Profile;
  jobTitle: string;
  description: string;
};

/**
 * The Owner as a schema.org `Person`, under his real name and his handle,
 * tied to his social profiles (the Profile's links, so search engines join
 * them to the site). `jobTitle` and `description` are in the page's Locale.
 */
const person = ({ locale, profile, jobTitle, description }: PersonInput) => ({
  "@type": "Person",
  "@id": PERSON_ID,
  name: OWNER_NAME,
  alternateName: OWNER_HANDLE,
  url: new URL(localizedPath("/", locale), SITE_URL).href,
  image: new URL("/images/chibi/banner-day.webp", SITE_URL).href,
  jobTitle,
  description,
  address: {
    "@type": "PostalAddress",
    addressLocality: OWNER_LOCALITY.city,
    addressCountry: OWNER_LOCALITY.countryCode,
  },
  sameAs: Object.values(profile.links),
});

/**
 * The home page's structured data (schema.org JSON-LD): the Owner as a
 * `Person` and the site as a `WebSite` he authors.
 */
export function homeStructuredData(input: PersonInput) {
  const home = new URL(localizedPath("/", input.locale), SITE_URL).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      person(input),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: OWNER_HANDLE,
        alternateName: OWNER_NAME,
        url: home,
        inLanguage: input.locale,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
    ],
  };
}

/**
 * The recruiter mode's structured data: a `ProfilePage` about the same
 * `Person`, with what a resume says of him: the teams he works for now, his
 * schools, his skills and his languages.
 */
export function cvStructuredData(
  input: PersonInput & {
    worksFor: ReadonlyArray<{ name: string; url: string }>;
    alumniOf: ReadonlyArray<string>;
    knowsAbout: ReadonlyArray<string>;
    knowsLanguage: ReadonlyArray<string>;
  },
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: new URL(localizedPath(ROUTES.cv.path, input.locale), SITE_URL).href,
    inLanguage: input.locale,
    mainEntity: {
      ...person(input),
      worksFor: input.worksFor.map(({ name, url }) => ({
        "@type": "Organization",
        name,
        url,
      })),
      alumniOf: input.alumniOf.map((name) => ({
        "@type": "EducationalOrganization",
        name,
      })),
      knowsAbout: input.knowsAbout,
      knowsLanguage: input.knowsLanguage,
    },
  };
}

/**
 * Structured data as the text of a `<script type="application/ld+json">`:
 * `<` is escaped so no content can close the script element.
 */
export const jsonLdScript = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");
