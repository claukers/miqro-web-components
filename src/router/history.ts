import {BASE_PATH} from "./utils.js";

export function historyPushPath(path: string): void {
  // console.log("historyPushPath(%s)", path);
  window.history.pushState(null, null as any, BASE_PATH() + path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}


