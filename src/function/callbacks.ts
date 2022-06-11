import {disconnect, RenderFunction} from "../template/index.js";
import {log, LOG_LEVEL} from "../log.js";
import {FunctionComponentMeta} from "./common.js";
import {renderFunction} from "./render.js";
import {weakMapGet, weakMapHas, weakMapSet} from "../template/utils/index.js";
import {attributeEffect, flushEffectCallbacks, flushEffects, queryEffect} from "./use/index.js";

export function constructorCallback(element: HTMLElement, func: RenderFunction): void {
  if (weakMapHas.call(metaMap, element)) {
    throw new Error("createHookContext called twice on element");
  }

  const meta: FunctionComponentMeta = {
    lock: false,
    shadowRoot: element.attachShadow({
      mode: "closed"
    }),
    func,
    state: {},
    mountEffects: [],
    mountEffectCallbacks: [],
    effects: [],
    effectCallbacks: [],
    queryWatch: [],
    attributeWatch: [],
    contextCalls: [],
    templateValues: {},
    observer: new MutationObserver(function () {
      meta.refresh();
    }),
    refresh: (firstRun: boolean = false) => {
      if (meta.lock) {
        throw new Error("conditional this.use calls detected. function component locked!");
      }
      flushEffectCallbacks(meta.effectCallbacks);
      meta.attributeWatch.splice(0, meta.attributeWatch.length); // clear attribute watch
      meta.queryWatch.splice(0, meta.queryWatch.length); // clear query watch
      return renderFunction(element, firstRun, meta);
    },
    renderCallback: () => {
      if (meta.queryWatch.length > 0) {
        meta.effects.unshift(queryEffect(meta));
      }

      if (meta.attributeWatch.length > 0) {
        meta.effects.unshift(attributeEffect(element, meta));
      }
      flushEffects(meta.effects, meta.effectCallbacks);
    }
  };
  weakMapSet.call(metaMap, element, meta);
}

export function connectedCallback(element: HTMLElement): void {
  const meta = getMeta(element);
  return meta.refresh(true);
}

export function disconnectedCallback(element: HTMLElement): void {
  const meta = getMeta(element);
  flushEffectCallbacks(meta.effectCallbacks);
  flushEffectCallbacks(meta.mountEffectCallbacks);
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
