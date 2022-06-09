import { RenderFunctionArgs } from "../../template/utils/template.js";
import { ContextCall, Effect, FunctionComponentMeta } from "../common.js";

export function useEffect(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, renderArgs: RenderFunctionArgs, effect: Effect): void {
  if (context.firstRun) {
    meta.effects.push(effect);
  }
}


export function flushEffects(meta: FunctionComponentMeta): void {
  for (const effect of meta.effects) {
    const disconnect = effect();
    if (disconnect) {
      meta.disconnectCallbacks.push(disconnect);
    }
  }
  
  meta.effects.splice(0, meta.effects.length); // clear effects
}