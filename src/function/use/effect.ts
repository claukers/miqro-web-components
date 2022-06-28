import {RenderFunctionArgs} from "../../template/utils/template.js";
import {ContextCall, Effect, FunctionComponentMeta} from "../common.js";
import {log, LOG_LEVEL} from "../../utils.js";

export function useEffect(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, effect: Effect): void {
  meta.effects.push(effect);
}

export function useMountEffect(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, effect: Effect): void {
  if (context.firstRun) {
    meta.mountEffects.push(effect);
  }
}


export function flushEffects(effects: Effect[], callbacks: (() => void)[]): void {
  const splice = effects.splice(0, effects.length); // clear effects
  for (const effect of splice) {
    try {
      const disconnect = effect();
      if (disconnect) {
        callbacks.push(disconnect);
      }
    } catch (e) {
      log(LOG_LEVEL.error, e);
    }
  }
}

export function flushEffectCallbacks(callbacks: (() => void)[]): void {
  const splice = callbacks.splice(0, callbacks.length); // clear effects
  for (const cb of splice) {
    try {
      cb();
    } catch (e) {
      log(LOG_LEVEL.error, e);
    }
  }
}
