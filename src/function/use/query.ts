import {windowAddEventListener, windowRemoveEventListener} from "../../template/utils/index.js";
import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, Effect, FunctionComponentMeta, SetFunction} from "../common.js";
import {getQueryValue, setQueryValue} from "./utils.js";

export function useQuery(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, name: string, defaultValue?: string | string[]): [string[] | string | null, SetFunction<string[] | string | null>] {
  context.name = name;
  const value = getQueryValue(name, defaultValue);
  //const queryWatchesFiltered = meta.queryWatch.filter(q => q.name === name);
  /*if (context.firstRun && queryWatchesFiltered.length !== 0) {
    throw new Error("bad useQuery usage(1)!");
  } else if (!context.firstRun && queryWatchesFiltered.length !== 1) {
    throw new Error("bad useQuery usage(2)!");
  }*/
  /*const queryWatch = context.firstRun ? {
    name,
    lastValue: value
  } : queryWatchesFiltered[0];*/

  if (context.firstRun) {
    /*if (meta.queryWatch.length === 0) {
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
      meta.disconnectCallbacks.push(function() {
        windowRemoveEventListener("popstate", listener);
      });
    }*/
    //meta.queryWatch.push(queryWatch);
    //meta.queryWatch.push(queryWatch);
    if (meta.queryWatch.indexOf(name) === -1) {
      meta.queryWatch.push(name);
    }
  }
  context.lastValue = value;
  context.checkChanged = function () {
    return {
      shouldAbort: context.lastValue !== getQueryValue(name, defaultValue),
      shouldRefresh: true
    }
  }

  return [
    value,
    newValue => {
      setQueryValue(name, newValue);
    }
  ];
}

function checkQueryChanged(meta: FunctionComponentMeta) {
  let changed = false;
  const queryCalls = meta.contextCalls.filter(c => c.call === "useQuery");
  for (const call of queryCalls) {
    if (call.checkChanged && call.checkChanged()) {
      changed = true;
      break;
    }
  }
  /*for (const q of meta.queryWatch) {
    const currentValue = getQueryValue(q.name, q.lastValue);
    if (currentValue !== q.lastValue) {
      changed = true;
      break;
    }
  }*/
  return changed;
}

export function queryEffect(meta: FunctionComponentMeta): Effect {
  return function () {

    function listener() {
      const changed = checkQueryChanged(meta);
      if (changed) {
        meta.refresh();
      }
    }

    /*const changed = checkQueryChanged(meta);
    if (changed) {
      setTimeout(function () {
        renderArgs.abortController.abort();
        meta.refresh();
      }, 0);
    }*/

    windowAddEventListener("popstate", listener);
    return function () {
      windowRemoveEventListener("popstate", listener);
    }
  }
}
