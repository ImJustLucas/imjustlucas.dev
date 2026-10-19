import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware replacements for `next/link` and `next/navigation`: `Link`
 * prefixes paths with the current Locale and `usePathname` returns the
 * Locale-stripped path.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
