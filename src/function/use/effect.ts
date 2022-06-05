import {ContextCall, Effect, FunctionComponentMeta} from "../common.js";

export function useEffect(element: HTMLElement, context: ContextCall, meta: FunctionComponentMeta, effect: Effect): void {
  if (context.firstRun) {
    meta.effects.push(effect);
  }
}
