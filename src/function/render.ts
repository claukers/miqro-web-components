import {queueRender} from "../template/index.js";
import {createFunctionContext} from "./context.js";
import {
  RenderFunctionMeta,
  log,
  LOG_LEVEL,
  nodeList2Array,
  RenderFunction,
  RenderFunctionArgs
} from "../common/index.js";
import {flushEffects} from "./use/index.js";

export function renderFunction(element: HTMLElement, firstRun: boolean, meta: RenderFunctionMeta): void {
  return queueRender(
    meta.shadowRoot ? meta.shadowRoot : element,
    createRenderFunction(element, firstRun, meta),
    firstRun ? function () {
      flushEffects(meta.mountEffects, meta.mountEffectCallbacks);
    } : undefined,
    meta.renderCallback
  );
}

function createRenderFunction(element: HTMLElement, firstRun: boolean, meta: RenderFunctionMeta): RenderFunction {

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
    }) : (meta.template ? {
      template: meta.template,
      values
    } : undefined);
  }
}

function checkContextCallsForChangesAndAbort(element: HTMLElement, meta: RenderFunctionMeta, args: RenderFunctionArgs) {
  let shouldAbort = false;
  let shouldRefresh = true;
  for (const call of meta.contextCalls) {
    if (call.checkChanged) {
      const changes = call.checkChanged();
      shouldAbort = shouldAbort ? shouldAbort : changes.shouldAbort;
      if (shouldAbort && shouldRefresh && changes.shouldAbort && !changes.shouldRefresh) {
        shouldRefresh = false;
        log(LOG_LEVEL.debug, `render aborted before apply for %o shouldRefresh %s because %s`, element, shouldRefresh, call.name);
        break;
      }
    }
  }
  if (shouldAbort) {
    log(LOG_LEVEL.debug, `render aborted before apply for %o shouldRefresh %s`, element, shouldRefresh);
    args.abortController.abort();
    if (shouldRefresh) {
      setTimeout(function () {
        meta.refresh();
      }, 0);
    }
  }
}
