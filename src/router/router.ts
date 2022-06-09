import {Route, getActiveRoute} from "./utils.js";
import {windowAddEventListener, windowRemoveEventListener} from "../template/utils";
import {FunctionComponentThis} from "../function/common.js";

const renderTag = (tagName: string | (() => string)) => typeof tagName === "function" ? tagName() : `<${tagName}/>`;

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
