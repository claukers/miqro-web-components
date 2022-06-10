import {historyPushPath} from "./history.js";
import {isPathLocation} from "./utils.js";
import {windowAddEventListener, windowRemoveEventListener} from "../template/utils";
import {FunctionComponentThis} from "../function/common.js";

function flipActiveClass(element: HTMLElement, path: string, activeClass: string) {
  const isActive = isPathLocation(path ? path : undefined);
  if (element.classList.contains(activeClass) && !isActive) {
    element.classList.remove(activeClass);
  } else if (!element.classList.contains(activeClass) && isActive) {
    element.classList.add(activeClass);
  }
}

export function RouteLink(this: FunctionComponentThis) {
  const path = this.useAttribute("data-path", "/") as string;
  const activeClass = this.useAttribute("data-active-class", "active", false) as string;

  const element = this.element;
  flipActiveClass(element, path, activeClass);

  this.useEffect(function () {
    function clickListener(ev: Event) {
      ev.preventDefault();
      historyPushPath(path);
    }

    function popStateListener() {
      flipActiveClass(element, path, activeClass);
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
