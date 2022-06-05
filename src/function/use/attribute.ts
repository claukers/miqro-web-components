import {ContextCall, FunctionComponentMeta} from "../common.js";

export function useAttribute(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, name: string, defaultValue?: string) {
  context.name = name;
  const value = element.getAttribute(name);
  if (context.firstRun) {
    if (meta.attributeWatch.indexOf(name) === -1) {
      meta.attributeWatch.push(name);
    }
  }

  return value === null ? defaultValue : value;
}
