import {nodeList2Array, render} from "../template/index.js";
import {createFunctionContext} from "./context.js";
import {getQueryValue} from "./use/utils.js";
import {FunctionComponentMeta} from "./common.js";
import {
  mutationObserverDisconnect,
  mutationObserverObserve,
  windowAddEventListener,
  windowRemoveEventListener
} from "../template/utils/index.js";

export function renderFunction(element: HTMLElement, firstRun: boolean, meta: FunctionComponentMeta): void {
  return render(meta.shadowRoot ? meta.shadowRoot : element, async (args) => {
    meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(element.childNodes);

    const context = createFunctionContext(element, meta, firstRun);

    const funcBound = meta.func.bind({...context.this});

    const output = await funcBound(args);

    context.validateAndLock();

    const defaultValues = {
      children: meta.templateChildren
    };

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

        windowAddEventListener("popstate", listener);
        return () => {
          windowRemoveEventListener("popstate", listener);
        }
      });
    }

    if (meta.attributeWatch.length > 0) {
      meta.effects.unshift(() => {
        const observer = new MutationObserver(function () {
          meta.refresh();
        });
        mutationObserverObserve.call(observer, element, {
          attributes: true,
          attributeFilter: meta.attributeWatch
        });
        return () => {
          mutationObserverDisconnect.call(observer);
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
