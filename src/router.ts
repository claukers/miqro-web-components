import {Component} from "./component.js";

const BASE_PATH = document.documentElement.getAttribute("data-router-base-path") ? document.documentElement.getAttribute("data-router-base-path") : "";

interface RouterState {
  active?: Route;
  routes: Route[];
}

interface RouterProps {
  ["data-default-element"]: string;
}

export class Router extends Component<RouterProps, RouterState> {
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
    console.log("Router ctor");
    console.dir(this.props);
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
      console.log(child.tagName);
      if ((child as Route).isActive && (child as Route).setState && child instanceof Route) {
        routes.push(child as Route);
      }
    }

    console.dir(routes);
    console.dir(this.props);
    if (setState) {
      this.setState({
        routes
      });
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
        });
      }
    }
    return activeRoute;
  }
}

interface RouteState {
  active?: boolean;
  basePath?: string;
}

interface RouteProps {
  ["data-path"]: string;
  ["data-default"]?: string;
  ["data-element"]: string;
}

export class Route extends Component<RouteProps, RouteState> {

  constructor() {
    super();
    console.log("route ctor ");
    console.dir(this.props);
  }

  isActive(activeRoute: Route | undefined, useDefault: boolean = true) {
    const path = BASE_PATH + this.props["data-path"];
    let pathname = location.pathname;
    if (pathname.length > 1 && pathname.charAt(pathname.length - 1) !== "/") {
      pathname = pathname + "/";
    }

    let active = useDefault ? pathname === path || this.props["data-default"] === "" : pathname === path;

    if (activeRoute && this !== activeRoute && active && activeRoute.isActive(activeRoute, false)) {
      active = false;
    }
    console.log("%s %s on %s isActive %s", this.props["data-path"], this.props["data-element"], pathname, active);
    return active;
  }

  render(): string | void {
    return this.state.active ? `<${this.props["data-element"]}></${this.props["data-element"]}>` : "";

  }
}

interface RouteLinkProps {
  ["data-path"]: string;
}

interface RouteLinkState {

}

export class RouteLink extends Component<RouteLinkProps, RouteLinkState> {
  private readonly clickListener: (ev: Event) => void;

  constructor() {
    super();
    this.clickListener = (ev) => {
      ev.preventDefault();
      historyPushPath(this.props["data-path"]);
    };
  }

  willMount() {
    this.addEventListener("click", this.clickListener);
  }

  didUnMount() {
    this.removeEventListener("click", this.clickListener);
  }
}

export function historyPushPath(path: string): void {
  // console.log("historyPushPath(%s)", path);
  window.history.pushState(null, null as any, BASE_PATH + path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
