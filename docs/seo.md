# Search (SEO)

Read before touching page metadata, the site's address, the sitemap, `robots.txt`, structured data or the link preview image.

The site must come up for "Lucas Bellier", "Lucas Bellier développeur" and "ImJustLucas". Before this work the real name appeared only in the Resume PDF, so a search for it showed LinkedIn, then the PDF, and never the site itself.

## What the site does

- **Address** — `SITE_URL` in `config/site.ts` is the address Vercel serves: `https://www.imjustlucas.dev` (the apex `imjustlucas.dev` redirects there with a 308). It is the `metadataBase` of the Locale layout, so every canonical URL, hreflang alternate, preview image URL, the sitemap and the structured data name the `www` host, never a URL that redirects. If the primary domain ever changes in Vercel, change `SITE_URL` with it.
- **Names** — `OWNER_NAME` ("Lucas Bellier") and `OWNER_HANDLE` ("ImJustLucas") in `config/site.ts`, for code. Visible texts carry the name through the message dictionaries: `Metadata.siteName` ("Lucas Bellier (ImJustLucas)") ends every page title, `Metadata.homeTitle` is the home's whole title, `Metadata.description` and every `Routes.*.description` name Lucas Bellier, and the home banner's `h1` (`Home.greeting`) says it.
- **Page metadata** — `routeMetadata` (`components/page-header`) gives each page its title, description, canonical URL and hreflang alternates (`i18n/alternates.ts`), and the same title, description and URL to Open Graph and X cards. A page's `openGraph` replaces the Locale layout's whole, so it carries the inherited preview image on. A Project's page gets the same from `projectMetadata` (`components/projects/project-metadata.ts`), with its own title and description, and its screenshot as the preview image when it has one.
- **Structured data** — the home renders one JSON-LD script (`lib/seo/structured-data.ts`): a `Person` (name, handle as `alternateName`, URL, job title and description in the Locale, Paris address, `sameAs` = every link of the Profile, read from `content/profile.json`) and a `WebSite` authored by that Person. Adding a social link to the Profile adds it to `sameAs`. The recruiter mode (`/cv`, titled "CV" / "resume (CV)" for the query "Lucas Bellier CV") renders a `ProfilePage` whose `mainEntity` is the same `Person` (same `@id`), with what a resume adds: `worksFor` (the ongoing Experiences), `alumniOf` (the diplomas' schools), `knowsAbout` (every Tech of the loadout, though the page shows only the 12 most used) and `knowsLanguage`.
- **Sitemap** — `app/sitemap.ts` serves `/sitemap.xml`: every Route of `ROUTES` and every Project's page (`/what/<slug>`, from `getProjectSlugs()`) in every Locale, each with its alternates. The Admin is no Route, so it is never listed.
- **robots.txt** — `app/robots.ts`: everything may be crawled but `/admin` and `/api`; it names the sitemap. The Admin layout also sets `noindex, nofollow`, and the 404 page `noindex`.
- **Link preview** — `app/[locale]/opengraph-image.tsx` draws the 1200×630 card per Locale at build time: the banner chibi (`public/images/og/chibi-banner.png`, a PNG of `banner-day.webp`, as the renderer cannot decode WebP) on his stage, the handle, the name in Unbounded, the role (`Home.role`) and the address. Unbounded and Geist come from Google Fonts at build; if they cannot be read the card falls back to the renderer's Geist. `proxy.ts` lets `/<locale>/opengraph-image` through (`LOCALE_FILES`) rather than serving it as an unknown path.

## Checking

After `next build`: `.next/server/app/en.html` and `fr.html` hold the title, description, canonical, alternates, `og:*`/`twitter:*` tags and the JSON-LD; `.next/server/app/sitemap.xml.body` and `robots.txt.body` the two files; `.next/server/app/<locale>/opengraph-image.body` the preview PNG. Online: [Rich Results Test](https://search.google.com/test/rich-results) for the JSON-LD, and any link preview debugger for the card.

## What the Owner does himself

Google only ranks what it has crawled, and it ties a name to a site through the other sites that say so. None of this can be done from the code.

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console))
   - Add a **Domain** property for `imjustlucas.dev` and verify it with the DNS TXT record Google gives (at the DNS provider of the domain). A Domain property covers `www` and the apex.
   - **Sitemaps**: submit `https://www.imjustlucas.dev/sitemap.xml`.
   - **URL Inspection**: inspect `https://www.imjustlucas.dev/fr` and `https://www.imjustlucas.dev/en`, then **Request indexing** for each. Do the same after any change to the home's title or text.
   - A few days later, check **Pages** (indexed vs. excluded) and **Performance** for the queries "lucas bellier", "lucas bellier développeur" and "imjustlucas".
2. **Same name everywhere, linking back** — each profile in the Profile's links (the `sameAs` of the structured data) should show the name "Lucas Bellier" and link to `https://www.imjustlucas.dev`:
   - **LinkedIn**: Contact info → Website; and the site as a Featured link.
   - **GitHub**: Name "Lucas Bellier", Website `https://www.imjustlucas.dev`.
   - **YouTube**: channel description and the channel's links.
   - **Instagram**: name field "Lucas Bellier", bio link.
   - Profiles that already rank for the name do too: Malt (`malt.fr/profile/imjustlucas`), hello.cv, and the IIM article on the MasterDevFrance 2025 win (ask the school to link the site).
3. **The Resume PDFs** — Google indexes them: `/pdf/cv-lucas.pdf` ranked second for "lucas bellier" on 2026-10-21, right after LinkedIn. Keep them indexable, but give each PDF a document title with the name in the tool that exports them: the English one has none, the French one is "CV FR Lucas 07-10-2025"; "CV Lucas Bellier, développeur fullstack" (en: "Resume Lucas Bellier, fullstack developer") reads better as a search result. Once the home ranks, it should come above them.
