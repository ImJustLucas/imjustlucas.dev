/**
 * Whether the Route at `routePath` is the one the Visitor is on.
 * `pathname` is the current path, without any Locale prefix.
 */
export function isActiveRoute(routePath: string, pathname: string): boolean {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}
