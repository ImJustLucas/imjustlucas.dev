import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/site";

/** `/robots.txt`: everything but the Admin may be crawled; where the sitemap is. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
    host: SITE_URL.host,
  };
}
