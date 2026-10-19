import type messages from "@/messages/en.json";

/** Key of a Route's texts under `Routes` in the message dictionaries. */
export type RouteMessageKey = keyof (typeof messages)["Routes"];

/**
 * The one list of Routes. It drives the menu, page headers, page metadata and
 * the legacy unprefixed redirects: adding a page is a single entry here plus
 * its texts under `Routes.<messageKey>` in every message dictionary
 * (`label` for the menu entry, `title` for the page header and browser tab,
 * `description` for search results).
 */
export interface Route {
  /** Path without any Locale prefix. */
  path: string;
  /** Where the Route's texts live in the message dictionaries. */
  messageKey: RouteMessageKey;
  /** Whether the Route has a menu entry. Routes outside the menu stay reachable by URL. */
  inMenu: boolean;
}

export const ROUTES = {
  me: { path: "/", messageKey: "me", inMenu: true },
  what: { path: "/what", messageKey: "what", inMenu: true },
  how: { path: "/how", messageKey: "how", inMenu: true },
  experiences: {
    path: "/experiences",
    messageKey: "experiences",
    inMenu: true,
  },
  videos: { path: "/videos", messageKey: "videos", inMenu: true },
  contact: { path: "/contact", messageKey: "contact", inMenu: true },
  mdf2025: { path: "/mdf-2025", messageKey: "mdf2025", inMenu: false },
} as const satisfies Record<string, Route>;

/** Routes with a menu entry, in menu order. */
export const MENU_ROUTES: readonly Route[] = Object.values(ROUTES).filter(
  (route) => route.inMenu,
);
