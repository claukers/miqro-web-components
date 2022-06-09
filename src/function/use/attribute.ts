import { mutationObserverDisconnect, mutationObserverObserve } from "../../template/utils/index.js";
import { RenderFunctionArgs } from "../../template/utils/template.js";
import { ContextCall, Effect, FunctionComponentMeta } from "../common.js";

export function useAttribute(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string) {
  context.name = name;
  const value = element.getAttribute(name);
  if (context.firstRun) {
    if (meta.attributeWatch.indexOf(name) === -1) {
      meta.attributeWatch.push(name);
    }
  }

  return value === null ? defaultValue : value;
}

export function attributeEffect(element: Node, meta: FunctionComponentMeta): Effect {
  return function () {
    const observer = new MutationObserver(function () {
      meta.refresh();
    });
    mutationObserverObserve.call(observer, element, {
      attributes: true,
      attributeFilter: meta.attributeWatch
    });
    return () => {
      mutationObserverDisconnect.call(observer);
    }
  }

}