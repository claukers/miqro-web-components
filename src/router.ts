import {Component, ComponentState} from "./component.js";
import {normalizePath} from "./helpers.js";

const renderTag = (tagName: string | (() => string)) => typeof tagName === "function" ? tagName() : `<${tagName}></${tagName}>`;

const BASE_PATH = normalizePath(document.documentElement.getAttribute("data-router-base-path") ? document.documentElement.getAttribute("data-router-base-path") as string : "");

interface Route {
  path: string;
  isDefault?: boolean;
  element: string | (() => string);
}

export interface RouterState {
  active?: Route;
  defaultElement?: string | (() => string);
  routes: Route[];
}

export class Router<S extends RouterState = RouterState> extends Component<S> {
  private readonly popStateListener: () => void;

  constructor() {
    super();
    this.popStateListener = () => {
      updateRouter(this);
    };
    this.state.routes = [];
  }

  public resetRoutes(): void {
    return this.setState({
      routes: [] as Route[],
      active: undefined
    } as Partial<S>);
  }

  public setDefault(defaultElement: string): void {
    return this.setState({
      defaultElement
    } as Partial<S>);
  }

  public pushRoute(route: { path: string; element: string; } | Array<{ path: string; element: string; }>): void {
    return this.concatRoutes(route);
  }

  public concatRoutes(route: { path: string; element: string; } | Array<{ path: string; element: string; }>): void {
    route = route instanceof Array ? route : [route];
    const routes = this.state.routes.concat(route);
    return this.setState({
      routes
    } as Partial<S>);
  }

  public connectedCallback() {
    updateRouter(this, false);
    window.addEventListener("popstate", this.popStateListener);
    return super.connectedCallback();
  }

  public didUpdate(prevState: S) {
    if (updateRouter(this)) {
      return false;
    }

    return super.didUpdate(prevState);
  }

  public disconnectedCallback(): void {
    window.removeEventListener("popstate", this.popStateListener);
  }

  public render() {
    return this.state.active ? renderTag(this.state.active.element) : (this.state.defaultElement ? renderTag(this.state.defaultElement) : "");
  }
}

export class RouteLink<S extends ComponentState = ComponentState> extends Component<S> {
  private readonly clickListener: (ev: Event) => void;

  public static tagName: string = "route-link";

  constructor() {
    super();
    this.clickListener = (ev) => {
      ev.preventDefault();
      historyPushPath(this.dataset.path as string);
    };
  }

  public connectedCallback() {
    this.addEventListener("click", this.clickListener);
    return super.connectedCallback();
  }

  public disconnectedCallback() {
    this.removeEventListener("click", this.clickListener);
  }
}

export function historyPushPath(path: string): void {
  // console.log("historyPushPath(%s)", path);
  window.history.pushState(null, null as any, BASE_PATH + path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function updateRouter(router: Router, setState = true): boolean {
  const active = getActiveRoute(router.state.routes, router.state.active);
  if (active !== router.state.active) {
    if (setState) {
      router.setState({
        active
      });
    } else {
      router.state.active = active;
    }
    return true;
  }
  return false;
}

function getActiveRoute(routes: Route[], currentActive?: Route): Route | undefined {
  let activeRoute: Route | undefined;

  for (const route of routes) {
    const active = isRouteActive(route, activeRoute ? activeRoute : currentActive);
    if (active) {
      activeRoute = route;
    }
  }
  return activeRoute;
}

function isRouteActive(route: Route, activeRoute: Route | undefined, useDefault: boolean = true): boolean | undefined {
  const path = normalizePath(BASE_PATH + route.path);
  const pathname = normalizePath(location.pathname);

  let active = useDefault ? pathname.toLowerCase() === path.toLowerCase() || route.isDefault : pathname.toLowerCase() === path.toLowerCase();

  if (activeRoute && route.element !== activeRoute.element && active && isRouteActive(activeRoute, activeRoute, false)) {
    active = false;
  }
  // console.log("default:%s path:%s on %s isActive %s", route.isDefault, path, pathname, active);
  return active;
}
