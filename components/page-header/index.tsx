import type { Metadata } from "next";

import { TypographyH2 } from "@/components/typography";
import type { Route } from "@/config/routes";

/** The page title of a Route, rendered at the top of its page. */
export const PageHeader: React.FC<{ route: Route }> = ({ route }) => {
  return <TypographyH2>{route.title}</TypographyH2>;
};

/**
 * Builds a page's `generateMetadata` from its Route:
 * `export const generateMetadata = routeMetadata(ROUTES.what);`
 */
export function routeMetadata(route: Route): () => Promise<Metadata> {
  return async () => ({
    title: `${route.title} · ImJustLucas`,
    description: route.description,
  });
}
