import {Selector, Store} from "../../store.js";
import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, FunctionComponentMeta, FunctionComponentThis} from "../common.js";

export function useSubscription<R, S>(this: FunctionComponentThis, element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, store: Store<S>, selector: Selector<S, R>): R {
  const [value, setValue] = this.useState(selector(store.getState()));
  this.useEffect(() => {
    function listener(newValue: R) {
      setValue(newValue);
    }

    store.subscribe(selector, listener);
    return () => {
      store.unSubscribe(listener);
    }
  });
  context.lastValue = value;
  context.checkChanged = function () {
    return {
      shouldAbort: context.lastValue !== selector(store.getState()),
      shouldRefresh: false
    }
  }
  return value;
}
