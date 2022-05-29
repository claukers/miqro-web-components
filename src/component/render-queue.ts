import {RenderFunction, RenderFunctionOutput, TemplateValues} from "../template/index.js";
import {hasCache, render as realRender} from "./render.js";

export function isRenderQueued(component: Node) {
  return refreshTimeouts.has(component);
}

export function cancelRender(component: Node) {
  const oldRefreshTimeout = refreshTimeouts.get(component);
  if (oldRefreshTimeout) {
    clearTimeout(oldRefreshTimeout.timeout);
    oldRefreshTimeout.abortController.abort();
  }
}

export function addRenderListener(component: Node, listener: EventListener) {
  const oldRefreshTimeout = refreshTimeouts.get(component);
  if (oldRefreshTimeout) {
    oldRefreshTimeout.eventTarget.addEventListener("render", listener)
  }
}

export function render(component: Node, t: RenderFunction | RenderFunctionOutput, values?: TemplateValues, listener?: EventListener): void {
  cancelRender(component);
  //const firstRun = !hasCache(component);
  //console.log(`queue${firstRun ? " create " : " "}render %o`, component);

  const oldRefreshTimeout = refreshTimeouts.get(component);
  const abortController = new AbortController();
  const eventTarget = oldRefreshTimeout ? oldRefreshTimeout.eventTarget : new EventTarget();
  const timeout = setTimeout(async function queueRenderTrigger() {
    try {

      const firstRun = !hasCache(component);
      const startMS = Date.now();
      if (abortController.signal.aborted) {
        //console.log(`${firstRun ? "create " : ""}render aborted %o`, component);
        return;
      }

      /*const template = t && typeof t === "string" ? t : t ? await t : undefined;

      if (abortController.signal.aborted) {
        //console.log(`${firstRun ? "create " : ""}render aborted %o`, component);
        return;
      }*/

      const renderAction = await realRender(abortController.signal, component, t, values);

      if (abortController.signal.aborted) {
        //console.log(`${firstRun ? "create " : ""}render aborted %o`, component);
        return;
      }

      const refreshTimeout = refreshTimeouts.get(component);
      if (refreshTimeout) {
        refreshTimeouts.delete(component);
        refreshTimeout.eventTarget.dispatchEvent(new CustomEvent("render"));
      }

      if (renderAction) {
        if (abortController.signal.aborted) {
          //console.log(`${firstRun ? "create " : ""}render aborted %o`, component);
          return;
        }
        //renderAction.apply();
        const changesRendered = renderAction.apply();
        if (changesRendered) {
          const tookMS = Date.now() - startMS;
          console.log(`${firstRun ? "create " : "update "}render %o done in %sms`, component, tookMS);
        }
      }
    } catch (e) {
      console.error(e);
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
