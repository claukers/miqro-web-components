import {BASE_PATH} from "./utils.js";
import {log, LOG_LEVEL} from "../utils.js";
import {windowDispatchEvent} from "../template/utils/index.js";

export function historyPushPath(path: string): void {
  log(LOG_LEVEL.debug, "historyPushPath(%s)", path);
  window.history.pushState({}, "", BASE_PATH() + path);
  windowDispatchEvent(new PopStateEvent("popstate"));
}


