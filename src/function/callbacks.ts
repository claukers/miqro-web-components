import {disconnect} from "../template/index.js";
import {log, LOG_LEVEL} from "../log.js";
import {FunctionComponent, FunctionComponentMeta} from "./common.js";
import {renderFunction} from "./render";

export function constructorCallback(element: HTMLElement, func: FunctionComponent): void {
  if (metaMap.has(element)) {
    throw new Error("createHookContext called twice on element");
  }
  const meta: FunctionComponentMeta = {
    shadowRoot: element.attachShadow({
      mode: "closed"
    }),
    func: func,
    state: {},
    effects: [],
    disconnectCallbacks: [],
    queryWatch: [],
    attributeWatch: [],
    contextCalls: [],
    refresh: () => {
      return renderFunction(element, false, meta);
    }
  };
  metaMap.set(element, meta);
}

export function connectedCallback(element: HTMLElement): void {
  const meta = getMeta(element);
  return renderFunction(element, true, meta);
}

export function disconnectedCallback(element: HTMLElement): void {
  const meta = getMeta(element);
  for (const disconnectCallback of meta.disconnectCallbacks) {
    try {
      disconnectCallback();
    } catch (e) {
      log(LOG_LEVEL.error, e);
    }
  }
  meta.disconnectCallbacks.splice(0, meta.disconnectCallbacks.length); // clear disconnectedCallbacks
  return disconnect(meta.shadowRoot ? meta.shadowRoot : element);
}

const metaMap = new WeakMap<HTMLElement, FunctionComponentMeta>();

function getMeta(element: HTMLElement): FunctionComponentMeta {
  const meta = metaMap.get(element);
  if (!meta) {
    throw new Error("getMeta no meta for element");
  }
  return meta;
}
