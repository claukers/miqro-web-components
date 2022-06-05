import {ContextCall, FunctionComponentMeta, SetFunction} from "../common.js";

export function useState<T>(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, defaultValue?: T): [T | undefined, SetFunction<T>] {
  const key = context.name as string;
  return [
    meta.state[key] !== undefined ? meta.state[key] : defaultValue,
    function (newValue: T) {
      meta.state[key] = newValue;
      meta.refresh();
    }
  ];
}