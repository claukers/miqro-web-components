import {hasCache, render} from "./render.js";
import {
  log,
  LOG_LEVEL,
  RenderEventListener,
  RenderFunction,
  weakMapDelete,
  weakMapGet,
  weakMapHas,
  weakMapSet
} from "../common/index.js";

export function isRenderQueued(element: Node) {
  return weakMapHas.call(refreshTimeouts, element);
}

export function cancelRender(element: Node) {

  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, element) as RefreshTimeoutMapValue;
  if (oldRefreshTimeout && oldRefreshTimeout.timeout) {
    clearTimeout(oldRefreshTimeout.timeout);
    oldRefreshTimeout.abortController.abort();
    oldRefreshTimeout.timeout = null;
    const elementToRenderOn = element instanceof ShadowRoot && element.host ? element.host : element;
    log(LOG_LEVEL.debug, "canceling render on %o", elementToRenderOn);
  }
}

export function addRenderListener(component: Node, listener: RenderEventListener) {
  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
  if (oldRefreshTimeout) {
    oldRefreshTimeout.eventTarget.addEventListener("render", listener as EventListener)
  }
}

const RENDER_TIMEOUT = 60000;
const RENDER_MS_WARNING = 50;

export function queueRender(element: Node, renderFunction: RenderFunction, listener?: RenderEventListener, callback?: () => void): void {
  cancelRender(element);
  const startMS = Date.now();
  const elementToRenderOn = (element instanceof ShadowRoot && element.host ? element.host : element) as HTMLElement;
  const renderMode = !hasCache(element) ? "create" : "update";
  log(LOG_LEVEL.trace, `queue render %s %o`, renderMode, elementToRenderOn);
  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, element) as RefreshTimeoutMapValue;
  const abortController = new AbortController();
  const eventTarget = oldRefreshTimeout ? oldRefreshTimeout.eventTarget : new EventTarget();
  const timeout = setTimeout(async function queueRenderTrigger() {
    const renderTimeout = setTimeout(function queueRenderTriggerTimeout() {
      log(LOG_LEVEL.warn, `render %s %o max timeout %s`, renderMode, elementToRenderOn, RENDER_TIMEOUT);
      abortController.abort();
    }, RENDER_TIMEOUT);
    try {
      log(LOG_LEVEL.trace, `render %s %o`, renderMode, elementToRenderOn);

      if (abortController.signal.aborted) {
        return;
      }
      const renderAction = await render(abortController, element, renderFunction);
      if (abortController.signal.aborted) {
        return;
      }
      if (renderAction) {
        const changesRendered = renderAction.apply();
        if (changesRendered) {
          const tookMS = Date.now() - startMS;
          if (tookMS > RENDER_MS_WARNING) {
            log(LOG_LEVEL.warn, `render %s %o took %sms!`, renderMode, elementToRenderOn, tookMS);
          } else {
            log(LOG_LEVEL.debug, `render %s %o took %sms`, renderMode, elementToRenderOn, tookMS);
          }
        }
      }
      eventTarget.dispatchEvent(new CustomEvent<AbortSignal>("render", {
        detail: abortController.signal
      }));
      try {
        if (callback) {
          callback();
        }
      } catch (e) {
        log(LOG_LEVEL.error, e);
      }
    } catch (e) {
      log(LOG_LEVEL.error, "error rendering %o %o", elementToRenderOn, e);
    } finally {
      clearTimeout(renderTimeout);
      const refreshTimeout = weakMapGet.call(refreshTimeouts, element) as RefreshTimeoutMapValue;
      if (refreshTimeout) {
        weakMapDelete.call(refreshTimeouts, element);
      }
    }
  }, 0);
  weakMapSet.call(refreshTimeouts, element, {
    eventTarget,
    abortController,
    timeout
  } as RefreshTimeoutMapValue);
  if (listener) {
    addRenderListener(element, listener);
  }
}

interface RefreshTimeoutMapValue {
  eventTarget: EventTarget,
  abortController: AbortController;
  timeout: any;
}

const refreshTimeouts = new WeakMap<Node, RefreshTimeoutMapValue>();
