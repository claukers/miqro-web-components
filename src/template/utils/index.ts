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

export const weakMapGet = WeakMap.prototype.get;
export const weakMapHas = WeakMap.prototype.has;
export const weakMapSet = WeakMap.prototype.set;
export const weakMapDelete = WeakMap.prototype.delete;

export const mapKeys = Map.prototype.keys;
export const mapGet = Map.prototype.get;
export const mapHas = Map.prototype.has;
export const mapSet = Map.prototype.set;
export const mapDelete = Map.prototype.delete;

export const mutationObserverObserve = MutationObserver.prototype.observe;
export const mutationObserverDisconnect = MutationObserver.prototype.disconnect;

// export const windowPushState = window.history.pushState;
export const windowDispatchEvent = window.dispatchEvent;
export const windowAddEventListener = window.addEventListener;
export const windowRemoveEventListener = window.removeEventListener;

const DOMParserParseFromString = DOMParser.prototype.parseFromString;

export function parseXML(xml: string): XMLDocument {
  return DOMParserParseFromString.call(new DOMParser(), `<root>${xml}</root>`, "text/xml") as XMLDocument;
}
