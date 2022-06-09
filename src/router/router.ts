import {Component} from "../component/index.js";
//import { Route, updateRouter, getActiveRoute } from "./utils.js";
import {Route, getActiveRoute} from "./utils.js";
import {windowAddEventListener, windowRemoveEventListener} from "../template/utils";
import {FunctionComponentThis} from "../function/common.js";

const renderTag = (tagName: string | (() => string)) => typeof tagName === "function" ? tagName() : `<${tagName}/>`;

/*export interface PathRouterState {
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
    windowAddEventListener("popstate", this.popStateListener);
    return super.connectedCallback();
  }

  public stateChangedCallback(prevState: S) {
    if (updateRouter(this)) {
      return false;
    }
  }

  public disconnectedCallback(): void {
    windowRemoveEventListener("popstate", this.popStateListener);
  }

  public render() {
    return this.state.active ? renderTag(this.state.active.element) : (this.state.defaultElement ? renderTag(this.state.defaultElement) : "");
  }
}*/

export function PathRouter(this: FunctionComponentThis) {
  const routesJSON = this.useAttribute("data-routes");
  const defaultElement = this.useAttribute("data-default-element");
  const routes = routesJSON ? JSON.parse(routesJSON) : [];
  const currentActive = getActiveRoute(routes);
  const [activeRoute, setActiveRoute, getActive] = this.useState(currentActive ? currentActive : {element: defaultElement});

  console.log("routes %o", routes);
  console.log("currentActive %o", currentActive);
  console.log("activeRoute %o", activeRoute);

  this.useEffect(function () {
    function popStateListener() {
      const currentActive = getActive();
      const newActive = getActiveRoute(routes, currentActive);
      if (newActive === undefined && currentActive !== defaultElement) {
        setActiveRoute({element: defaultElement});
      }
      if (newActive !== currentActive) {
        setActiveRoute(newActive);
      }
    }

    windowAddEventListener("popstate", popStateListener);
    return function () {
      windowRemoveEventListener("popstate", popStateListener);
    }
  });

  const activeElement = activeRoute ? (activeRoute as Route).element : undefined

  return activeElement ? renderTag(activeElement) : "";
}
