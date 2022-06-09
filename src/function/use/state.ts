import { RenderFunctionArgs } from "../../template/utils/template.js";
import { ContextCall, FunctionComponentMeta, GetFunction, SetFunction } from "../common.js";

export function useState<T>(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, defaultValue?: T): [T | undefined, SetFunction<T>, GetFunction<T>] {
  const key = context.name as string;
  function getValue() {
    return meta.state[key] !== undefined ? meta.state[key] : defaultValue;
  }
  function setValue(newValue: T) {
    meta.state[key] = newValue;
      meta.refresh();
  }
  return [
    getValue(),
    setValue,
    getValue
  ];
}
