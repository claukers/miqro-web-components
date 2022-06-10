import {windowAddEventListener, windowRemoveEventListener} from "../../template/utils/index.js";
import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, Effect, FunctionComponentMeta, SetFunction} from "../common.js";
import {getQueryValue, setQueryValue} from "./utils.js";

export function useQuery(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string | string[]): [string[] | string | null, SetFunction<string[] | string | null>] {
  //context.name = name;
  const value = getQueryValue(name, defaultValue);

  if (meta.queryWatch.indexOf(name) === -1) {
    meta.queryWatch.push(name);
    context.lastValue = value;
    context.checkChanged = function () {
      return {
        shouldAbort: context.lastValue !== getQueryValue(name, defaultValue),
        shouldRefresh: true
      }
    }
  }

  return [
    value,
    newValue => {
      setQueryValue(name, newValue);
    }
  ];
}

export function queryEffect(meta: FunctionComponentMeta): Effect {
  return function () {
    const queryCalls = meta.contextCalls.filter(c => c.call === "useQuery");

    function listener() {
      let changed = false;
      for (const call of queryCalls) {
        if (call.checkChanged && call.checkChanged()) {
          changed = true;
          break;
        }
      }
      if (changed) {
        meta.refresh();
      }
    }

    windowAddEventListener("popstate", listener);
    return function () {
      windowRemoveEventListener("popstate", listener);
    }
  }
}
