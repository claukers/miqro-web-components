import {
  RenderFunction,
  RenderFunctionOutput,
  TemplateValues, weakMapDelete,
  weakMapGet,
  weakMapHas,
  weakMapSet
} from "./utils/index.js";
import {hasCache, render as realRender} from "./render.js";
import {log, LOG_LEVEL} from "../log.js";

export function isRenderQueued(component: Node) {
  return weakMapHas.call(refreshTimeouts, component);
}

export function cancelRender(component: Node) {

  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
  if (oldRefreshTimeout && oldRefreshTimeout.timeout) {
    clearTimeout(oldRefreshTimeout.timeout);
    oldRefreshTimeout.abortController.abort();
    oldRefreshTimeout.timeout = null;
    log(LOG_LEVEL.trace, "canceling render on %o", component);
  }
}

export function addRenderListener(component: Node, listener: EventListener) {
  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
  if (oldRefreshTimeout) {
    oldRefreshTimeout.eventTarget.addEventListener("render", listener)
  }
}

const RENDER_TIMEOUT = 60000;
const RENDER_MS_WARNING = 50;

export function render(component: Node, t: RenderFunction | RenderFunctionOutput, values?: TemplateValues, listener?: EventListener): void {
  cancelRender(component);
  const startMS = Date.now();
  const renderMode = !hasCache(component) ? "create" : "update";
  log(LOG_LEVEL.trace, `queue render %s %o`, renderMode, component);
  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
  const abortController = new AbortController();
  const eventTarget = oldRefreshTimeout ? oldRefreshTimeout.eventTarget : new EventTarget();
  const timeout = setTimeout(async function queueRenderTrigger() {
    const renderTimeout = setTimeout(function queueRenderTriggerTimeout() {
      log(LOG_LEVEL.warn, `render %s %o max timeout %s`, renderMode, component, RENDER_TIMEOUT);
      abortController.abort();
    }, RENDER_TIMEOUT);
    try {
      log(LOG_LEVEL.trace, `render %s %o`, renderMode, component);

      if (!abortController.signal.aborted) {
        const renderAction = await realRender(abortController.signal, component, t, values);
        if (!abortController.signal.aborted) {
          if (renderAction) {
            const changesRendered = renderAction.apply();
            if (changesRendered) {
              const tookMS = Date.now() - startMS;
              if (tookMS > RENDER_MS_WARNING) {
                log(LOG_LEVEL.warn, `render %s %o took %sms!`, renderMode, component, tookMS);
              } else {
                log(LOG_LEVEL.debug, `render %s %o took %sms`, renderMode, component, tookMS);
              }
              eventTarget.dispatchEvent(new CustomEvent("render"));
            }
          }
        }
      }
    } catch (e) {
      log(LOG_LEVEL.error, e);
    } finally {
      clearTimeout(renderTimeout);
      const refreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
      if (refreshTimeout) {
        weakMapDelete.call(refreshTimeouts, component);
      }
    }
  }, 0);
  weakMapSet.call(refreshTimeouts, component, {
    eventTarget,
    abortController,
    timeout
  } as RefreshTimeoutMapValue);
  if (listener) {
    addRenderListener(component, listener);
  }
}

interface RefreshTimeoutMapValue {
  eventTarget: EventTarget,
  abortController: AbortController;
  timeout: any;
}

const refreshTimeouts = new WeakMap<Node, RefreshTimeoutMapValue>();
