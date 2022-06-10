import {ContextCall, FunctionComponentContext, FunctionComponentMeta, FunctionComponentThis} from "./common.js";
import {useMountEffect, useAs, useAttribute, useEffect, useJSONAttribute, useQuery, useState, useSubscription} from "./use/index.js";
import {RenderFunctionArgs} from "../template/utils/template.js";

export function createFunctionContext(element: HTMLElement, meta: FunctionComponentMeta, firstRun: boolean, renderArgs: RenderFunctionArgs): FunctionComponentContext {

  let lock = false;
  const usage: ContextCall[] = [];

  const FunctionContextSelf: Partial<FunctionComponentThis> = {
    element,
    shadowRoot: meta.shadowRoot
  };

  function bindContextUseFunction<R = any>(name: string, useFunc: (this: FunctionComponentThis, element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, ...args: any[]) => any) {
    const useFuncBound = useFunc.bind(FunctionContextSelf as FunctionComponentThis);

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

  function validateAndLock() {
    if (lock) {
      throw new Error("cannot use validateAndLock when locked!");
    }
    lock = true;

    const usageSplice = usage.splice(0, usage.length);
    if (firstRun) {
      meta.contextCalls = usageSplice;
    } else if (usageSplice.length !== meta.contextCalls.length) {
      throw new Error(`conditional this.use calls detected(1)! ${usageSplice.map(u => u.name).join(",")} vs ${meta.contextCalls.map(u => u.name).join(",")}`);
    } else if (usageSplice.filter(
      (v, i) => meta.contextCalls[i].call !== v.call || meta.contextCalls[i].name !== v.name
    ).length > 0) {
      throw new Error("conditional this.use calls detected(2)!");
    } else {
      meta.contextCalls = usageSplice;
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
    validateAndLock,
    this: FunctionContextSelf as FunctionComponentThis
  }
}
