export {get} from "./get.js";
export {set} from "./set.js";
export {
  getTemplateTokenValue,
  evaluateTextTemplateForAttribute,
  nodeList2Array,
  TemplateValues,
  re,
  removeChildrenFrom,
  removeChild,
  removeChildren,
  appendChildren,
  RefreshCallback,
  RenderFunctionOutput,
  RenderFunction,
  RenderFunctionArgs,
  AsyncRenderFunctionOutputPair
} from "./template.js";

export const mutationObserverObserve = MutationObserver.prototype.observe;
export const mutationObserverDisconnect = MutationObserver.prototype.disconnect;

// export const windowPushState = window.history.pushState;
export const windowDispatchEvent = window.dispatchEvent;
export const windowAddEventListener = window.addEventListener;
export const windowRemoveEventListener = window.removeEventListener;


