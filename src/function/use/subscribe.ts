import {deepEquals, Selector, Store} from "../../store.js";
import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, FunctionComponentMeta, FunctionComponentThis, SetFunction} from "../common.js";
import {log, LOG_LEVEL} from "../../utils.js";

export function useSubscription<R, S>(this: FunctionComponentThis, element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, store: Store<S>, selector: Selector<S, R>): R {
  function listener(newValue: R) {
    log(LOG_LEVEL.trace, `useSubscription.listener for %s for %s`, context.name, element);
    renderArgs.abortController.abort();
    setTimeout(function () {
      meta.refresh();
    });
  }

  const value = store.subscribe(selector, listener);

  this.useEffect(() => {
    return () => {
      store.unSubscribe(listener);
    }
  });
  context.lastValue = value;
  context.checkChanged = function () {
    const currentValue = selector(store.getState());
    log(LOG_LEVEL.trace, `useSubscription check for %s for [%s] !== [%s]`,
      context.name,
      context.lastValue,
      currentValue);
    log(LOG_LEVEL.trace, `useSubscription check for %s for %s`, context.name, element);
    return {
      shouldAbort: !deepEquals(context.lastValue, currentValue),
      shouldRefresh: false
    }
  }
  return value;
}
