import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * The Locale of a request comes from the `[locale]` root segment. An explicit
 * `locale` (e.g. `getTranslations({ locale })`) wins, as root params are not
 * available in Route Handlers and Server Actions.
 */
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const param = await rootParams.locale();
    if (!hasLocale(routing.locales, param)) notFound();
    locale = param;
  }

  return {
    locale,
    // Dates are those of the Owner, in Paris, whatever the build machine's zone.
    timeZone: "Europe/Paris",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
