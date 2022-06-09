import { nodeList2Array, render } from "../template/index.js";
import { createFunctionContext } from "./context.js";
import { FunctionComponentMeta } from "./common.js";
import { RenderFunction, RenderFunctionArgs } from "../template/utils/template.js";
import { queryEffect, attributeEffect, flushEffects } from "./use/index.js";

export function renderFunction(element: HTMLElement, firstRun: boolean, meta: FunctionComponentMeta): void {
  const renderFunction = createRenderFunction(element, firstRun, meta);
  const listener = firstRun ? createRenderListener(element, meta) : undefined;
  return render(
    meta.shadowRoot ? meta.shadowRoot : element,
    renderFunction,
    undefined,
    listener
  );
}

function createRenderFunction(element: HTMLElement, firstRun: boolean, meta: FunctionComponentMeta): RenderFunction {
  return async function (args: RenderFunctionArgs) {
    if (args.abortSignal.aborted) {
      return;
    }
    meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(element.childNodes);
    const defaultValues = {
      children: meta.templateChildren
    };

    const context = createFunctionContext(element, meta, firstRun, args);

    const output = await (meta.func.bind({ ...context.this }))(args);

    if (args.abortSignal.aborted) {
      return;
    }

    context.validateAndLock();

    return output ? (typeof output === "string" ? {
      template: output,
      values: defaultValues
    } : {
      template: output.template,
      values: {
        ...defaultValues,
        ...output.values
      }
    }) : undefined;
  }
}

function createRenderListener(element: HTMLElement, meta: FunctionComponentMeta): (() => void) {
  return function () {
    if (meta.queryWatch.length > 0) {
      meta.effects.unshift(queryEffect(meta));
    }

    if (meta.attributeWatch.length > 0) {
      meta.effects.unshift(attributeEffect(element, meta));
    }
    flushEffects(meta);
  }
}