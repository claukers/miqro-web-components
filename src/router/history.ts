import {BASE_PATH} from "./utils.js";
import {windowDispatchEvent} from "../common/index.js";

export function historyPushPath(path: string): void {
  window.history.pushState(null, "", BASE_PATH() + path);
  windowDispatchEvent(new PopStateEvent("popstate"));
}


