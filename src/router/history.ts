import {BASE_PATH} from "./utils.js";
import {log, LOG_LEVEL} from "../log.js";

export function historyPushPath(path: string): void {
  log(LOG_LEVEL.debug, "historyPushPath(%s)", path);
  window.history.pushState(null, null as any, BASE_PATH() + path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}


