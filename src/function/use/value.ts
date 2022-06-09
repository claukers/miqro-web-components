import {ContextCall, FunctionComponentMeta} from "../common.js";
import {set} from "../../template/utils/index.js";
import {RenderFunctionArgs} from "../../template/utils/template";

export function useAs<T>(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, value: T): void {
  context.name = name;
  set(meta.templateValues, name, value);
}
