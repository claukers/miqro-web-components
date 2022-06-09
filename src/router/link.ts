import { historyPushPath } from "./history.js";
import { isPathLocation } from "./utils.js";
import { windowAddEventListener, windowRemoveEventListener } from "../template/utils";
import { FunctionComponentThis } from "../function/common.js";

export function RouteLink(this: FunctionComponentThis) {
  const path = this.useAttribute("data-path");
  const [isActive, setIsActive, getIsActive] = this.useState(false);

  if (this.element.classList.contains("active") && isActive) {
    this.element.classList.remove("active");
  } else if (!this.element.classList.contains("active") && isActive) {
    this.element.classList.add("active");
  }

  const element = this.element;

  this.useEffect(function () {
    function clickListener(ev: Event) {
      ev.preventDefault();
      historyPushPath(path as string);
    }
    function popStateListener() {
      const currentIsActive = getIsActive();
      const isActive = isPathLocation(path ? path : undefined);
      if (currentIsActive !== isActive) {
        setIsActive(isActive);
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
