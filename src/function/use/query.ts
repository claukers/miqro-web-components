import { windowAddEventListener, windowRemoveEventListener } from "../../template/utils/index.js";
import { RenderFunctionArgs } from "../../template/utils/template.js";
import {ContextCall, Effect, FunctionComponentMeta, SetFunction} from "../common.js";
import {getQueryValue, setQueryValue} from "./utils.js";

export function useQuery(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string | string[]): [string[] | string | null, SetFunction<string[] | string | null>] {
  context.name = name;
  const value = getQueryValue(name, defaultValue);
  const queryWatchesFiltered = meta.queryWatch.filter(q => q.name === name);
  if (context.firstRun && queryWatchesFiltered.length !== 0) {
    throw new Error("bad useQuery usage(1)!");
  } else if (!context.firstRun && queryWatchesFiltered.length !== 1) {
    throw new Error("bad useQuery usage(2)!");
  }
  const queryWatch = context.firstRun ? {
    name,
    lastValue: value
  } : queryWatchesFiltered[0];

  if (context.firstRun) {
    meta.queryWatch.push(queryWatch);
  } else {
    queryWatch.lastValue = value;
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
    return function() {
      windowRemoveEventListener("popstate", listener);
    }
  }
}