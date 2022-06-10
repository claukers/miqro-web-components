import {historyPushPath} from "./history.js";
import {isPathLocation} from "./utils.js";
import {windowAddEventListener, windowRemoveEventListener} from "../template/utils";
import {FunctionComponentThis} from "../function/common.js";

export function RouteLink(this: FunctionComponentThis) {
  const path = this.useAttribute("data-path");

  const element = this.element;

  const isActive = isPathLocation(path ? path : undefined);

  if (element.classList.contains("active") && !isActive) {
    element.classList.remove("active");
  } else if (!element.classList.contains("active") && isActive) {
    element.classList.add("active");
  }

  this.useEffect(function () {
    function clickListener(ev: Event) {
      ev.preventDefault();
      historyPushPath(path as string);
    }

    function popStateListener() {
      const isActive = isPathLocation(path ? path : undefined);

      if (element.classList.contains("active") && !isActive) {
        element.classList.remove("active");
      } else if (!element.classList.contains("active") && isActive) {
        element.classList.add("active");
      }
    }

    element.addEventListener("click", clickListener);
    windowAddEventListener("popstate", popStateListener);
    return function () {
      element.removeEventListener("click", clickListener);
      windowRemoveEventListener("popstate", popStateListener);
    }
  });
  return "{children}";
}
