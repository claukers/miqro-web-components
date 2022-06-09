import {nodeList2Array, render} from "../template/index.js";
import {createFunctionContext} from "./context.js";
import {FunctionComponentMeta} from "./common.js";
import {RenderEventListener, RenderFunction, RenderFunctionArgs} from "../template/utils/template.js";
import {attributeEffect, flushEffects, queryEffect} from "./use/index.js";
import {log, LOG_LEVEL} from "../log.js";

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
    if (args.abortController.signal.aborted) {
      return;
    }
    meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(element.childNodes);
    const defaultValues = {
      children: meta.templateChildren
    };

    const context = createFunctionContext(element, meta, firstRun, args);

    const output = await (meta.func.bind({...context.this}))(args);

    if (args.abortController.signal.aborted) {
      return;
    }

    context.validateAndLock();

    let shouldAbort = false;
    let shouldRefresh = true;

    for (const call of meta.contextCalls) {
      if (call.checkChanged) {
        const changes = call.checkChanged();
        shouldAbort = shouldAbort ? shouldAbort : changes.shouldAbort;
        if (shouldAbort && shouldRefresh && changes.shouldAbort && !changes.shouldRefresh) {
          shouldRefresh = false;
          break;
        }
      }
    }
    if (shouldAbort) {
      log(LOG_LEVEL.debug, `render aborted before apply for %o`, element);
      args.abortController.abort();
      if (shouldRefresh) {
        setTimeout(function () {
          meta.refresh();
        }, 0);
      }
      return;
    }

    const values = {
      ...defaultValues,
      ...meta.templateValues,
      ...(output && typeof output !== "string" ? output : {})
    };

    meta.templateValues = {};

    return output ? (typeof output === "string" ? {
      template: output,
      values
    } : {
      template: output.template,
      values
    }) : undefined;
  }
}

function createRenderListener(element: HTMLElement, meta: FunctionComponentMeta): RenderEventListener {
  return function (args: CustomEvent<undefined>): void {
    if (meta.queryWatch.length > 0) {
      meta.effects.unshift(queryEffect(meta));
    }

    if (meta.attributeWatch.length > 0) {
      meta.effects.unshift(attributeEffect(element, meta));
    }
    flushEffects(meta);
  }
}
