let basePath: string | null = null;
export const BASE_PATH = () => basePath === null ? normalizePath(document.documentElement.getAttribute("data-router-base-path") ? document.documentElement.getAttribute("data-router-base-path") as string : "") : basePath;

export function isPathLocation(p?: string) {
  if (p === undefined) {
    return false;
  }
  const path = normalizePath(BASE_PATH() + p);
  const pathname = normalizePath(location.pathname);
  return pathname.toLowerCase() === path.toLowerCase();
}

export function isRouteActive(route: Route, activeRoute: Route | undefined, useDefault: boolean = true): boolean | undefined {
  let active = useDefault ? route.isDefault || isPathLocation(route.path) : isPathLocation(route.path);

  if (activeRoute && route.element !== activeRoute.element && active && isRouteActive(activeRoute, activeRoute, false)) {
    active = false;
  }
  return active;
}

export function getActiveRoute(routes: Route[], currentActive?: Route): Route | undefined {
  let activeRoute: Route | undefined;

  for (const route of routes) {
    const active = isRouteActive(route, activeRoute ? activeRoute : currentActive);
    if (active) {
      activeRoute = route;
    }
  }
  return activeRoute;
}

export interface Route {
  path: string;
  isDefault?: boolean;
  element: string | (() => string);
}

function normalizePath(path: string) {
  if (path.length > 1 && path.charAt(path.length - 1) === "/") {
    path = path.substring(0, path.length - 1);
  }
  return path;
}


