import {nodeList2Array, render} from "../template/index.js";
import {createFunctionContext} from "./context.js";
import {FunctionComponentMeta} from "./common.js";
import {RenderFunction, RenderFunctionArgs} from "../template/utils/template.js";
import {log, LOG_LEVEL} from "../log.js";
import {flushEffects} from "./use/index.js";

export function renderFunction(element: HTMLElement, firstRun: boolean, meta: FunctionComponentMeta): void {
  return render(
    meta.shadowRoot ? meta.shadowRoot : element,
    createRenderFunction(element, firstRun, meta),
    undefined,
    firstRun ? function () {
      flushEffects(meta.mountEffects, meta.mountEffectCallbacks);
    } : undefined,
    meta.renderCallback
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

    context.validateAndLock();

    if (args.abortController.signal.aborted) {
      return;
    }

    checkContextCallsForChangesAndAbort(element, meta, args);

    if (args.abortController.signal.aborted) {
      return;
    }

    const values = {
      ...defaultValues,
      ...meta.templateValues,
      ...(output && typeof output !== "string" && output.values ? output.values : {})
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

function checkContextCallsForChangesAndAbort(element: HTMLElement, meta: FunctionComponentMeta, args: RenderFunctionArgs) {
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
  }
}
