import {ContextCall, FunctionComponentMeta, RenderFunctionArgs, set} from "../../common/index.js";

export function useAs<T>(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, value: T): void {
  context.name = name;
  set(meta.templateValues, name, value);
}
