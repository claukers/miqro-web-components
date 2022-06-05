import {render} from "../template/index.js";
import {createHookContext} from "./context.js";
import {getQueryValue} from "./use/utils.js";
import {FunctionComponentMeta} from "./common.js";

export function renderFunction(element: HTMLElement, firstRun: boolean, meta: FunctionComponentMeta): void {
  return render(meta.shadowRoot ? meta.shadowRoot : element, async () => {
    const context = createHookContext(element, meta, firstRun);
    const hookBound = meta.hook.bind({...context.this});
    const output = await hookBound();

    context.validateAndLock();

    return output;
  }, undefined, firstRun ? () => {

    if (meta.queryWatch.length > 0) {
      meta.effects.unshift(() => {
        function listener() {
          let changed = false;
          for (const q of meta.queryWatch) {
            const currentValue = getQueryValue(q.name, q.lastValue);
            if (currentValue !== q.lastValue) {
              changed = true;
              break;
            }
          }
          if (changed) {
            meta.refresh();
          }
        }

        window.addEventListener("popstate", listener);
        return () => {
          window.removeEventListener("popstate", listener);
        }
      });
    }

    if (meta.attributeWatch.length > 0) {
      meta.effects.unshift(() => {
        const observer = new MutationObserver(function () {
          meta.refresh();
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: meta.attributeWatch
        });
        return () => {
          observer.disconnect();
        }
      });
    }

    for (const effect of meta.effects) {
      const disconnect = effect();
      if (disconnect) {
        meta.disconnectCallbacks.push(disconnect);
      }
    }
    meta.effects.splice(0, meta.effects.length); // clear effects
  } : undefined);
}
