import {getActiveRoute, Route} from "./utils.js";
import {windowAddEventListener, windowRemoveEventListener} from "../template/utils";
import {FunctionComponentThis} from "../function/common.js";
import {log, LOG_LEVEL} from "../log.js";

const renderTag = (tagName: string | (() => string)) => typeof tagName === "function" ? tagName() : `<${tagName}/>`;

export function PathRouter(this: FunctionComponentThis) {
  const routesJSON = this.useAttribute("data-routes");
  const defaultElement = this.useAttribute("data-default-element");
  const routes = routesJSON ? JSON.parse(routesJSON) : [];
  const currentActive = getActiveRoute(routes);
  const [activeRoute, setActiveRoute, getActive] = this.useState(currentActive ? currentActive : {element: defaultElement});

  this.useEffect(function () {
    function popStateListener() {
      const currentActive = getActive();
      const newActive = getActiveRoute(routes, currentActive);
      log(LOG_LEVEL.trace, "PathRouter popStateListener currentActive %o vs newActive %o", currentActive, newActive);
      if (newActive === undefined && currentActive !== defaultElement) {
        setActiveRoute({element: defaultElement});
      } else if (newActive !== currentActive) {
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
