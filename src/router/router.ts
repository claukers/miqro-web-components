import {Component} from "../component/index.js";
import {Route, updateRouter} from "./utils.js";

const renderTag = (tagName: string | (() => string)) => typeof tagName === "function" ? tagName() : `<${tagName}></${tagName}>`;

export interface PathRouterState {
  active?: Route;
  defaultElement?: string | (() => string);
  routes: Route[];
}

export class PathRouter<S extends PathRouterState = PathRouterState> extends Component<S> {
  public static tagName: string = "path-router";

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

  public stateChangedCallback(prevState: S) {
    if (updateRouter(this)) {
      return false;
    }
  }

  public disconnectedCallback(): void {
    window.removeEventListener("popstate", this.popStateListener);
  }

  public render() {
    return this.state.active ? renderTag(this.state.active.element) : (this.state.defaultElement ? renderTag(this.state.defaultElement) : "");
  }
}
