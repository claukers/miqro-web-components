import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, FunctionComponentMeta, GetFunction, SetFunction} from "../common.js";

export function useState<T>(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, defaultValue?: T): [T | undefined, SetFunction<T>, GetFunction<T>] {
  const key = context.name as string;

  function getValue() {
    return meta.state[key] !== undefined ? meta.state[key] : defaultValue;
  }

  function setValue(newValue: T) {
    if (meta.state[key] !== newValue) {
      renderArgs.abortController.abort();
      meta.state[key] = newValue;
      setTimeout(function () {
        meta.refresh();
      }, 0)
    }
  }

  const value = getValue();
  meta.state[key] = value;
  context.lastValue = value;
  context.checkChanged = function () {
    return {
      shouldAbort: context.lastValue !== getValue(),
      shouldRefresh: false
    }
  }

  return [
    value,
    setValue,
    getValue
  ];
}
