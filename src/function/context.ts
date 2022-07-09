import {
  useAs,
  useAttribute,
  useEffect,
  useJSONAttribute,
  useMountEffect,
  useQuery,
  useState,
  useSubscription
} from "./use/index.js";
import {
  ContextCall,
  RenderContext,
  RenderFunctionMeta,
  RenderFunctionThis,
  RenderFunctionArgs
} from "../common/index.js";

export function createFunctionContext(element: HTMLElement, meta: RenderFunctionMeta, firstRun: boolean, renderArgs: RenderFunctionArgs): RenderContext {

  let lock = false;
  const usage: ContextCall[] = [];

  const FunctionContextSelf: Partial<RenderFunctionThis> = {
    element,
    shadowRoot: meta.shadowRoot
  };

  function bindContextUseFunction<R = any>(name: string, useFunc: (this: RenderFunctionThis, element: HTMLElement, context: ContextCall, meta: RenderFunctionMeta, renderArgs: RenderFunctionArgs, ...args: any[]) => any) {
    const useFuncBound = useFunc.bind(FunctionContextSelf as RenderFunctionThis);

    if (FunctionContextSelf[name]) {
      throw new Error("already bound");
    }
    FunctionContextSelf[name] = function (...args: any[]) {
      if (lock) {
        throw new Error(`cannot use ${name} after render!`);
      }
      if (renderArgs.abortController.signal.aborted) {
        throw new Error(`cannot use ${name} after render aborted!`);
      }

      const usageArg: ContextCall = {
        call: name,
        name: `func-${name}-${usage.length}`,
        firstRun
      };
      usage.push(usageArg);
      return useFuncBound(element, usageArg, meta, renderArgs, ...args);
    }
  }

  bindContextUseFunction("useState", useState);
  bindContextUseFunction("useEffect", useEffect);
  bindContextUseFunction("useMountEffect", useMountEffect);
  bindContextUseFunction("useAs", useAs);
  bindContextUseFunction("useAttribute", useAttribute);
  bindContextUseFunction("useJSONAttribute", useJSONAttribute);
  bindContextUseFunction("useQuery", useQuery);
  bindContextUseFunction("useSubscription", useSubscription);

  return {
    validateAndLock: function validateAndLock() {
      if (lock) {
        throw new Error("cannot use validateAndLock when locked!");
      }
      lock = true;

      const usageSplice = usage.splice(0, usage.length);
      if (firstRun) {
        meta.contextCalls = usageSplice;
      } else if (usageSplice.length !== meta.contextCalls.length) {
        meta.lock = true;
        throw new Error(`conditional this.use calls detected(1)! ${usageSplice.map(u => u.name).join(",")} vs ${meta.contextCalls.map(u => u.name).join(",")}`);
      } else if (usageSplice.filter(
        (v, i) => meta.contextCalls[i].call !== v.call || meta.contextCalls[i].name !== v.name
      ).length > 0) {
        meta.lock = true;
        throw new Error("conditional this.use calls detected(2)!");
      } else {
        meta.contextCalls = usageSplice;
      }
    },
    this: FunctionContextSelf as RenderFunctionThis
  }
}
