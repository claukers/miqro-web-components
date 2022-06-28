import {
  RenderFunction,
  RenderFunctionOutput,
  TemplateValues
} from "./utils/index.js";
import {hasCache, render as realRender} from "./render.js";
import {RenderEventListener} from "./utils/template.js";
import {
  log,
  LOG_LEVEL,
  weakMapDelete,
  weakMapGet,
  weakMapHas,
  weakMapSet
} from "../utils.js";

export function isRenderQueued(component: Node) {
  return weakMapHas.call(refreshTimeouts, component);
}

export function cancelRender(component: Node) {

  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
  if (oldRefreshTimeout && oldRefreshTimeout.timeout) {
    clearTimeout(oldRefreshTimeout.timeout);
    oldRefreshTimeout.abortController.abort();
    oldRefreshTimeout.timeout = null;
    const element = component instanceof ShadowRoot && component.host ? component.host : component;
    log(LOG_LEVEL.debug, "canceling render on %o", element);
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

export function render(component: Node, t: RenderFunction | RenderFunctionOutput, values?: TemplateValues, listener?: RenderEventListener, callback?: () => void): void {
  cancelRender(component);
  const startMS = Date.now();
  const element = (component instanceof ShadowRoot && component.host ? component.host : component) as HTMLElement;
  const renderMode = !hasCache(component) ? "create" : "update";
  log(LOG_LEVEL.trace, `queue render %s %o`, renderMode, element);
  const oldRefreshTimeout = weakMapGet.call(refreshTimeouts, component) as RefreshTimeoutMapValue;
  const abortController = new AbortController();
  const eventTarget = oldRefreshTimeout ? oldRefreshTimeout.eventTarget : new EventTarget();
  const timeout = setTimeout(async function queueRenderTrigger() {
    const renderTimeout = setTimeout(function queueRenderTriggerTimeout() {
      log(LOG_LEVEL.warn, `render %s %o max timeout %s`, renderMode, element, RENDER_TIMEOUT);
      abortController.abort();
    }, RENDER_TIMEOUT);
    try {
      log(LOG_LEVEL.trace, `render %s %o`, renderMode, element);

      if (abortController.signal.aborted) {
        return;
      }
      const renderAction = await realRender(abortController, component, t, values);
      if (abortController.signal.aborted) {
        return;
      }
      if (renderAction) {
        const changesRendered = renderAction.apply();

        try {
          if (callback) {
            callback();
          }
        } catch (e) {
          log(LOG_LEVEL.error, e);
        }

        if (changesRendered) {
          const tookMS = Date.now() - startMS;
          if (tookMS > RENDER_MS_WARNING) {
            log(LOG_LEVEL.warn, `render %s %o took %sms!`, renderMode, element, tookMS);
          } else {
            log(LOG_LEVEL.debug, `render %s %o took %sms`, renderMode, element, tookMS);
          }

          eventTarget.dispatchEvent(new CustomEvent<AbortSignal>("render", {
            detail: abortController.signal
          }));
        }
      }
    } catch (e) {
      log(LOG_LEVEL.error, "error rendering %o %o", element, e);
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
