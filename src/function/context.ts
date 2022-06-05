import {ContextCall, FunctionComponentContext, FunctionComponentMeta, UseFunction} from "./common.js";
import {Selector, Store} from "../store.js";
import {useAttribute, useEffect, useQuery, useState} from "./use/index.js";

export function createFunctionContext(element: HTMLElement, meta: FunctionComponentMeta, firstRun: boolean): FunctionComponentContext {

  let lock = false;
  const usage: ContextCall[] = [];

  function createUseFunction<R = any>(name: string, useFunc: UseFunction<R>) {
    return function (...args: any[]) {
      if (lock) {
        throw new Error(`cannot use ${name} after render!`);
      }
      const usageArg: ContextCall = {
        call: name,
        name: `func-${name}-${usage.length}`,
        firstRun
      };
      usage.push(usageArg);
      return useFunc(element, usageArg, meta, ...args);
    }
  }

  const useStateFunction = createUseFunction("useState", useState);
  const useEffectFunction = createUseFunction("useEffect", useEffect);

  return {
    validateAndLock: () => {
      if (lock) {
        throw new Error("cannot use validateAndLock when locked!");
      }
      lock = true;

      const usageSplice = usage.splice(0, usage.length);
      if (firstRun) {
        meta.contextCalls = usageSplice;
      } else if (usageSplice.length !== meta.contextCalls.length) {
        throw new Error("conditional this.use calls detected(1)!");
      } else if (usageSplice.filter(
        (v, i) => meta.contextCalls[i].call !== v.call || meta.contextCalls[i].name !== v.name
      ).length > 0) {
        throw new Error("conditional this.use calls detected(2)!");
      }
    },
    this: {
      useState: useStateFunction,
      useEffect: useEffectFunction,
      useAttribute: createUseFunction("useAttribute", useAttribute),
      useQuery: createUseFunction("useQuery", useQuery),
      useSubscription: function useSubscription<S, R>(store: Store<S>, selector: Selector<S, R>) {
        const [value, setValue] = useStateFunction(selector(store.getState()));
        useEffectFunction(() => {
          function listener(newValue: R) {
            setValue(newValue);
          }

          store.subscribe(selector, listener);
          return () => {
            store.unSubscribe(listener);
          }
        });
        return value;
      }
    }
  }
}
