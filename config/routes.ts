/**
 * The one list of Routes. It drives the menu, page headers and page metadata:
 * adding a page is a single entry here.
 *
 * `label`, `title` and `description` are display texts. Consumers never render
 * them directly: they go through the menu, `PageHeader` and `routeMetadata`,
 * so these texts can become message keys without changing any page.
 */
export interface Route {
  /** Path without any Locale prefix. */
  path: string;
  /** Text of the Route's menu entry. */
  label: string;
  /** Title shown in the page header and the browser tab. */
  title: string;
  /** Page description for search results. */
  description: string;
  /** Whether the Route has a menu entry. Routes outside the menu stay reachable by URL. */
  inMenu: boolean;
}

export const ROUTES = {
  me: {
    path: "/",
    label: "me",
    title: "Who am i?",
    description:
      "Lucas, a French software developer based in Paris, crafting high-quality websites and applications.",
    inMenu: true,
  },
  what: {
    path: "/what",
    label: "what i've done",
    title: "What i've done ?",
    description: "The projects Lucas has built, from side projects to work.",
    inMenu: true,
  },
  how: {
    path: "/how",
    label: "how i do it",
    title: "How i create my apps?",
    description:
      "The languages, frameworks and tools Lucas uses to build his apps.",
    inMenu: true,
  },
  experiences: {
    path: "/experiences",
    label: "my experiences",
    title: "My experiences",
    description: "Lucas's professional experiences and diplomas.",
    inMenu: true,
  },
  videos: {
    path: "/videos",
    label: "yt videos",
    title: "youtube videos",
    description: "The latest videos from Lucas's YouTube channel.",
    inMenu: true,
  },
  contact: {
    path: "/contact",
    label: "contact",
    title: "Contact me",
    description: "How to get in touch with Lucas.",
    inMenu: true,
  },
  mdf2025: {
    path: "/mdf-2025",
    label: "MDF 2025",
    title: "MasterDevFrance 2025",
    description:
      "Lucas won the MasterDevFrance 2025 competition, a national recognition for technical excellence in software development.",
    inMenu: false,
  },
} as const satisfies Record<string, Route>;

/** Routes with a menu entry, in menu order. */
export const MENU_ROUTES: readonly Route[] = Object.values(ROUTES).filter(
  (route) => route.inMenu,
);
