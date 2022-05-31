import {RenderFunction, RenderFunctionOutput, TemplateValues} from "./utils/index.js";
import {hasCache, render as realRender} from "./render.js";

export function isRenderQueued(component: Node) {
  return refreshTimeouts.has(component);
}

export function cancelRender(component: Node) {
  const oldRefreshTimeout = refreshTimeouts.get(component);
  if (oldRefreshTimeout) {
    clearTimeout(oldRefreshTimeout.timeout);
    oldRefreshTimeout.abortController.abort();
    console.log("canceling render on %o", component);
  }
}

export function addRenderListener(component: Node, listener: EventListener) {
  const oldRefreshTimeout = refreshTimeouts.get(component);
  if (oldRefreshTimeout) {
    oldRefreshTimeout.eventTarget.addEventListener("render", listener)
  }
}

const RENDER_TIMEOUT = 1000;
const RENDER_MS_WARNING = 50;

export function render(component: Node, t: RenderFunction | RenderFunctionOutput, values?: TemplateValues, listener?: EventListener): void {
  cancelRender(component);
  const firstRun = !hasCache(component);
  console.log(`queue${firstRun ? " create " : " update "}render %o`, component);

  const oldRefreshTimeout = refreshTimeouts.get(component);
  const abortController = new AbortController();
  const eventTarget = oldRefreshTimeout ? oldRefreshTimeout.eventTarget : new EventTarget();
  const timeout = setTimeout(async function queueRenderTrigger() {
    const renderTimeout = setTimeout(function queueRenderTriggerTimeout() {
      abortController.abort();
    }, RENDER_TIMEOUT);
    try {
      const firstRun = !hasCache(component);
      const startMS = Date.now();
      if (!abortController.signal.aborted) {
        const renderAction = await realRender(abortController.signal, component, t, values);
        if (!abortController.signal.aborted) {
          if (renderAction) {
            //renderAction.apply();
            const changesRendered = renderAction.apply();
            if (changesRendered) {
              const tookMS = Date.now() - startMS;
              if (tookMS > RENDER_MS_WARNING) {
                console.warn(`${firstRun ? "create " : "update "}render %o done in %sms`, component, tookMS);
              }
            }
          }
          eventTarget.dispatchEvent(new CustomEvent("render"));
        }
      }
    } catch (e) {
      console.error(e);
    }
    clearTimeout(renderTimeout);
    const refreshTimeout = refreshTimeouts.get(component);
    if (refreshTimeout) {
      refreshTimeouts.delete(component);
    }
  }, 0);
  refreshTimeouts.set(component, {
    eventTarget,
    abortController,
    timeout
  });
  if (listener) {
    addRenderListener(component, listener);
  }
}

const refreshTimeouts = new WeakMap<Node, { eventTarget: EventTarget, abortController: AbortController; timeout: any; }>();
const fallback = new WeakMap<Node>();

function searchFallbackComponent(component: Node): Node | undefined {
  if (component.parentElement?.tagName === "fallback-component" && hasCache(component.parentElement)) {
    return component.parentElement as Node;
  }
  if (component.parentElement) {
    return searchFallbackComponent(component.parentElement);
  }
}
