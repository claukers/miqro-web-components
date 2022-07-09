import {ContextCall, RenderFunctionMeta, RenderFunctionArgs, set} from "../../common/index.js";

export function useAs<T>(element: HTMLElement, context: ContextCall, meta: RenderFunctionMeta, renderArgs: RenderFunctionArgs, name: string, value: T): void {
  context.name = name;
  set(meta.templateValues, name, value);
}
