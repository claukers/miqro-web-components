import {Component} from "./component.js";
import {ComponentProps} from "./common.js";

interface RouterState {
  active?: Route;
  routes: Route[];
}

interface RouterProps extends ComponentProps {
  ["data-default-element"]: string;
}

export class Router extends Component<RouterProps, RouterState> {
  private readonly popStateListener: () => void;

  constructor() {
    super();
    this.popStateListener = () => {
      this._updateActive();
    };
    this.state.routes = this._updateRoutes(false);
    this.state.active = this._updateActive(false);
  }

  willMount(): void {
    window.addEventListener("popstate", this.popStateListener);
  }

  didUnMount(): void {
    window.removeEventListener("popstate", this.popStateListener);
  }

  render(): string | void {
    if (this.children.length > 1) {
      this.state.routes = this._updateRoutes(false);
      this.state.active = this._updateActive(false);
    }
    if (this.children.length > 1) {
      throw new Error("something went wrong");
    }
    const active = this.children[0];
    if (active !== this.state.active) {
      if (active) {
        active.remove();
      }
      if (this.state.active) {
        this.appendChild(this.state.active);
      }
    }
  }

  private _updateRoutes(setState: boolean = true): Route[] {
    const routes: Route[] = [];
    const children = this.querySelectorAll("*");
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child instanceof Route) {
        routes.push(child);
        child.remove();
      }
    }
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
    if (!activeRoute && this.props["data-default-element"]) {
      activeRoute = new Route();
      activeRoute.setAttribute("data-element", this.props["data-default-element"]);
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
}

interface RouteProps extends ComponentProps {
  ["data-path"]: string;
  ["data-element"]: string;
}

export class Route extends Component<RouteProps, RouteState> {

  isActive(activeRoute: Route | undefined, useDefault: boolean = true) {
    let active = useDefault ? location.pathname === this.props["data-path"] || this.props.default === "" : location.pathname === this.props["data-path"];

    if (activeRoute && this !== activeRoute && active && activeRoute.isActive(activeRoute, false)) {
      active = false;
    }
    // console.log("%s isActive %s", this.props["data-element"], active);
    return active;
  }

  render(): string | void {
    return this.state.active ? `<{props.data-element}></{props.data-element}>` : "";

  }
}

export function historyPushPath(path: string): void {
  // console.log("historyPushPath(%s)", path);
  window.history.pushState(null, null as any, path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
