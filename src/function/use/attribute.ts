import {mutationObserverDisconnect, mutationObserverObserve} from "../../template/utils/index.js";
import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, Effect, FunctionComponentMeta} from "../common.js";
import {log, LOG_LEVEL} from "../../log.js";

function getAttribute(element: HTMLElement, name: string, defaultValue?: string) {
  const value = element.getAttribute(name);
  const currentValue = value === null ? defaultValue : value;
  return currentValue;
}

export function useAttribute(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string, watch = true) {
  context.name = name;
  const currentValue = getAttribute(element, name, defaultValue);
  log(LOG_LEVEL.trace, "useAttribute %o with value = %o", element, currentValue);
  if (watch) {
    if (context.firstRun) {
      if (meta.attributeWatch.indexOf(name) === -1) {
        meta.attributeWatch.push(name);
      }
    }
    context.lastValue = currentValue;
    context.checkChanged = function () {
      return {
        shouldAbort: context.lastValue !== getAttribute(element, name, defaultValue),
        shouldRefresh: true
      }
    }
  }
  return currentValue;
}

export function useJSONAttribute(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string) {
  const value = useAttribute(element, context, meta, renderArgs, name, defaultValue);
  log(LOG_LEVEL.trace, "useJSONAttribute %o with value = %o", element, value);
  return typeof value === "string" && value !== "" ? JSON.parse(value) : value;
}

/*function checkAttributeChange(element: HTMLElement, meta: FunctionComponentMeta) {
  let refreshNow = false;
  for (const {name, lastValue} of meta.attributeWatch) {
    const currentValue = element.getAttribute(name);
    if (currentValue !== lastValue) {
      console.log("name %s value %s !== %s", name, currentValue, lastValue)
      refreshNow = true;
      break;
    }
  }
  return refreshNow;
}*/

export function attributeEffect(element: HTMLElement, meta: FunctionComponentMeta): Effect {
  return function () {
    //const refreshNow = checkAttributeChange(element, meta);
    const observer = new MutationObserver(function () {
      meta.refresh();
    });
    mutationObserverObserve.call(observer, element, {
      attributes: true,
      attributeFilter: meta.attributeWatch//meta.attributeWatch.map(a => a.name)
    });
    /*if (refreshNow) {
      setTimeout(function () {
        renderArgs.abortController.abort();
        meta.refresh();
      }, 0);
    }*/
    return () => {
      mutationObserverDisconnect.call(observer);
    }
  }
}
