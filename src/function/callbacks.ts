import {disconnect, render} from "../template/index.js";
import {createHookContext} from "./context.js";
import {log, LOG_LEVEL} from "../log.js";
import {FunctionComponent, FunctionComponentMeta} from "./common.js";
import {getQueryValue} from "./use/utils.js";

export function constructorCallback(element: HTMLElement, hook: FunctionComponent): void {
  if (metaMap.has(element)) {
    throw new Error("createHookContext called twice on element");
  }
  metaMap.set(element, {
    shadowRoot: element.attachShadow({
      mode: "closed"
    }),
    hook,
    state: {},
    effects: [],
    disconnectCallbacks: [],
    queryWatch: [],
    attributeWatch: [],
    contextCalls: [],
    refresh: () => {
      return callHook(element, false);
    }
  });
}

export function connectedCallback(element: HTMLElement): void {
  return callHook(element, true);
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

function callHook(element: HTMLElement, firstRun: boolean): void {
  const meta = getMeta(element);
  return render(meta.shadowRoot ? meta.shadowRoot : element, async () => {

    const context = createHookContext(element, meta, firstRun);
    const hookBound = meta.hook.bind({...context.this});
    const output = await hookBound();

    context.validateAndLock();

    return output;
  }, undefined, firstRun ? () => {

    if (meta.queryWatch.length > 0) {
      meta.effects.unshift(() => {
        function listener() {
          let changed = false;
          for (const q of meta.queryWatch) {
            const currentValue = getQueryValue(q.name, q.lastValue);
            if (currentValue !== q.lastValue) {
              changed = true;
              break;
            }
          }
          if (changed) {
            meta.refresh();
          }
        }

        window.addEventListener("popstate", listener);
        return () => {
          window.removeEventListener("popstate", listener);
        }
      });
    }

    if (meta.attributeWatch.length > 0) {
      meta.effects.unshift(() => {
        const observer = new MutationObserver(function () {
          meta.refresh();
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: meta.attributeWatch
        });
        return () => {
          observer.disconnect();
        }
      });
    }

    for (const effect of meta.effects) {
      const disconnect = effect();
      if (disconnect) {
        meta.disconnectCallbacks.push(disconnect);
      }
    }
    meta.effects.splice(0, meta.effects.length); // clear effects
  } : undefined);
}

function getMeta(element: HTMLElement): FunctionComponentMeta {
  const meta = metaMap.get(element);
  if (!meta) {
    throw new Error("getMeta no meta for element");
  }
  return meta;
}
