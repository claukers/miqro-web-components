//import {windowDispatchEvent, windowPushState} from "../../template/utils/index.js";
import {windowDispatchEvent} from "../../template/utils/index.js";

const URLSearchParamsGetAll = URLSearchParams.prototype.getAll;
const URLSearchParamsSet = URLSearchParams.prototype.set;
const URLSearchParamsAppend = URLSearchParams.prototype.append;
const URLSearchParamsDelete = URLSearchParams.prototype.delete;
const URLSearchParamsToString = URLSearchParams.prototype.toString;

export function getQueryValue(name: string, defaultValue?: string[] | string | null): string[] | string | null {
  const ret = URLSearchParamsGetAll.call(new URL(window.location.href).searchParams, name);
  if (ret.length === 0) {
    return defaultValue !== undefined ? defaultValue : null;
  }
  return ret && ret.length === 1 ? ret[0] : ret;
}

export function setQueryValue(name: string, value: string[] | string | null): void {
  const url = new URL(window.location.href);
  if (value instanceof Array) {
    for (const v of value) {
      URLSearchParamsAppend.call(url.searchParams, name, v);
    }
  } else if (value !== null) {
    URLSearchParamsSet.call(url.searchParams, name, value);
  } else {
    URLSearchParamsDelete.call(url.searchParams, name);
  }
  window.history.pushState(null, "", String(url));
  windowDispatchEvent(new PopStateEvent("popstate"));
}
