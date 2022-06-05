import {BASE_PATH} from "./utils.js";
import {log, LOG_LEVEL} from "../log.js";
import {windowDispatchEvent, windowPushState} from "../template/utils/index.js";

export function historyPushPath(path: string): void {
  log(LOG_LEVEL.debug, "historyPushPath(%s)", path);
  windowPushState(null, null as any, BASE_PATH() + path);
  windowDispatchEvent(new PopStateEvent("popstate"));
}


