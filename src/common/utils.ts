import {
  URLSearchParamsAppend,
  URLSearchParamsDelete,
  URLSearchParamsGetAll,
  URLSearchParamsSet,
  windowDispatchEvent
} from "./common.js";

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

export function nodeList2Array(childNodes?: NodeListOf<ChildNode>): Array<Node | HTMLElement> {
  const childrenNodes = [];
  if (childNodes) {
    for (let i = 0; i < childNodes.length; i++) {
      childrenNodes.push(childNodes[i])
    }
  }
  return childrenNodes;
}

const DOMParserParseFromString = DOMParser.prototype.parseFromString;

export function parseXML(xml: string): XMLDocument {
  return DOMParserParseFromString.call(new DOMParser(), `<root>${xml}</root>`, "text/xml") as XMLDocument;
}
