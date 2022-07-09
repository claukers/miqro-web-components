import {
  ContextCall,
  Effect,
  RenderFunctionMeta,
  log,
  LOG_LEVEL,
  mutationObserverDisconnect,
  mutationObserverObserve,
  RenderFunctionArgs
} from "../../common/index.js";

function getAttribute(element: HTMLElement, name: string, defaultValue?: string) {
  const value = element.getAttribute(name);
  const currentValue = value === null ? defaultValue : value;
  return currentValue;
}

export function useAttribute(element: HTMLElement, context: ContextCall, meta: RenderFunctionMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string, watch = true) {
  //context.name = name;
  const currentValue = getAttribute(element, name, defaultValue);
  log(LOG_LEVEL.trace, "useAttribute %o with value = %o", element, currentValue);
  if (watch) {
    if (meta.attributeWatch.indexOf(name) === -1) {
      meta.attributeWatch.push(name);
      context.lastValue = currentValue;
      context.checkChanged = function () {
        return {
          shouldAbort: context.lastValue !== getAttribute(element, name, defaultValue),
          shouldRefresh: true
        }
      }
    }
  }
  return currentValue;
}

export function useJSONAttribute(element: HTMLElement, context: ContextCall, meta: RenderFunctionMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string) {
  const value = useAttribute(element, context, meta, renderArgs, name, defaultValue);
  log(LOG_LEVEL.trace, "useJSONAttribute %o with value = %o", element, value);
  return typeof value === "string" && value !== "" ? JSON.parse(value) : value;
}

export function attributeEffect(element: HTMLElement, meta: RenderFunctionMeta): Effect {
  return function () {
    mutationObserverObserve.call(meta.observer, element, {
      attributes: true,
      attributeFilter: meta.attributeWatch//meta.attributeWatch.map(a => a.name)
    });
    return () => {
      mutationObserverDisconnect.call(meta.observer);
    }
  }
}
