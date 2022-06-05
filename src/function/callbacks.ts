import {disconnect, RenderFunction} from "../template/index.js";
import {log, LOG_LEVEL} from "../log.js";
import {FunctionComponentMeta} from "./common.js";
import {renderFunction} from "./render.js";
import {weakMapGet, weakMapHas, weakMapSet} from "../template/utils";

export function constructorCallback(element: HTMLElement, func: RenderFunction): void {
  if (weakMapHas.call(metaMap, element)) {
    throw new Error("createHookContext called twice on element");
  }

  const meta: FunctionComponentMeta = {
    shadowRoot: element.attachShadow({
      mode: "closed"
    }),
    func,
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
  weakMapSet.call(metaMap, element, meta);
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

  const meta = weakMapGet.call(metaMap, element) as FunctionComponentMeta;
  if (!meta) {
    throw new Error("getMeta no meta for element");
  }
  return meta;
}
