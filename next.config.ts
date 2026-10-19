import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { ROUTES } from "./config/routes";
import { routing } from "./i18n/routing";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // 404 page for URLs outside Locale routing (`app/global-not-found.tsx`).
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      new URL("https://cdn.discordapp.com/**"),
      new URL("https://i.scdn.co/**"),
    ],
  },
  async redirects() {
    // Legacy unprefixed URLs go permanently to their English equivalent. These
    // run before the proxy, which would otherwise pick a Locale per browser.
    return Object.values(ROUTES)
      .filter((route) => route.path !== "/")
      .map((route) => ({
        source: `${route.path}/:path*`,
        destination: `/${routing.defaultLocale}${route.path}/:path*`,
        permanent: true,
      }));
  },
};

export default withNextIntl(nextConfig);
