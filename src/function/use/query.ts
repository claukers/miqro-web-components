import {ContextCall, FunctionComponentMeta, SetFunction} from "../common.js";
import {getQueryValue, setQueryValue} from "./utils.js";

export function useQuery(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, name: string, defaultValue?: string | string[]): [string[] | string | null, SetFunction<string[] | string | null>] {
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
