import {Component} from "./component.js";

const BASE_PATH = document.documentElement.getAttribute("data-router-base-path") ? document.documentElement.getAttribute("data-router-base-path") : "";

export interface RouterState {
  active?: Route;
  routes: Route[];
}

export interface RouterProps {
  ["data-default-element"]: string;
}

export class Router<P extends RouterProps = RouterProps, S extends RouterState = RouterState> extends Component<P, S> {
  private readonly popStateListener: () => void;

  constructor() {
    super();
    this.popStateListener = () => {
      this._updateActive();
    };
    if (this.props["data-default-element"]) {
      const defaultRoute = new Route();
      defaultRoute.setAttribute("data-element", this.props["data-default-element"]);
      defaultRoute.setAttribute("data-default", "");
      this.appendChild(defaultRoute);
    }
  }

  willMount(): void {
    window.addEventListener("popstate", this.popStateListener);
  }

  didMount() {
    this.state.routes = this._updateRoutes(false);
    this.state.active = this._updateActive(false);
  }

  didUnMount(): void {
    window.removeEventListener("popstate", this.popStateListener);
  }

  private _updateRoutes(setState: boolean = true): Route[] {
    const routes: Route[] = [];
    const children = this.querySelectorAll("*");
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if ((child as Route).isActive && (child as Route).setState && child instanceof Route) {
        routes.push(child as Route);
      }
    }

    if (setState) {
      this.setState({
        routes
      } as Partial<S>);
    }
    return routes;
  }

  private _updateActive(setOwnState: boolean = true): Route | undefined {
    let activeRoute: Route | undefined;
    for (const route of this.state.routes) {
      const active = route.isActive(activeRoute ? activeRoute : this.state.active);
      if (active) {
        activeRoute = route;
      }
    }
    if (activeRoute !== this.state.active) {
      if (this.state.active) {
        this.state.active.setState({
          active: false
        });
      }
      if (activeRoute) {
        activeRoute.setState({
          active: true
        });
      }
      if (setOwnState) {
        this.setState({
          active: activeRoute
        } as Partial<S>);
      }
    }
    return activeRoute;
  }
}

export interface RouteState {
  active?: boolean;
  basePath?: string;
}

export interface RouteProps {
  ["data-path"]: string;
  ["data-default"]?: string;
  ["data-element"]: string;
}

export class Route<P extends RouteProps = RouteProps, S extends RouteState = RouteState> extends Component<P, S> {

  constructor() {
    super();
  }

  public isActive(activeRoute: Route | undefined, useDefault: boolean = true) {
    const path = BASE_PATH + this.props["data-path"];
    let pathname = location.pathname;
    if (pathname.length > 1 && pathname.charAt(pathname.length - 1) !== "/") {
      pathname = pathname + "/";
    }

    let active = useDefault ? pathname === path || this.props["data-default"] === "" : pathname === path;

    if (activeRoute && this !== activeRoute && active && activeRoute.isActive(activeRoute, false)) {
      active = false;
    }
    // console.log("%s %s on %s isActive %s", this.props["data-path"], this.props["data-element"], pathname, active);
    return active;
  }

  public render(): string | void {
    return this.state.active ? `<${this.props["data-element"]}></${this.props["data-element"]}>` : "";

  }
}

export interface RouteLinkProps {
  ["data-path"]: string;
}

export interface RouteLinkState {

}

export class RouteLink<P extends RouteLinkProps = RouteLinkProps, S extends RouteLinkState = RouteLinkState> extends Component<P, S> {
  private readonly clickListener: (ev: Event) => void;

  constructor() {
    super();
    this.clickListener = (ev) => {
      ev.preventDefault();
      historyPushPath(this.props["data-path"]);
    };
  }

  public willMount() {
    this.addEventListener("click", this.clickListener);
  }

  public didUnMount() {
    this.removeEventListener("click", this.clickListener);
  }
}

export function historyPushPath(path: string): void {
  // console.log("historyPushPath(%s)", path);
  window.history.pushState(null, null as any, BASE_PATH + path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
