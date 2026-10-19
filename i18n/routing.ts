import { defineRouting } from "next-intl/routing";

/** The two Locales the site is published in. English is the default. */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
  // Pages declare their alternate-Locale URLs in their metadata
  // (`routeMetadata`); no duplicate `Link` header from the proxy.
  alternateLinks: false,
  // The root address follows the browser language only: remembering the
  // last Locale visited would keep a French Visitor who opened one English
  // link in English.
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
