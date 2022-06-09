import {connectedCallback, constructorCallback, disconnectedCallback} from "./callbacks.js";
import {RenderFunction} from "../template";

export {
  Effect,
  UseQueryFunction,
  SetFunction,
  UseAttributeFunction,
  UseEffectFunction,
  UseStateFunction,
  UseSubscriptionFunction,
  FunctionComponentThis
} from "./common.js";

export function defineFunction(tag: string, func: RenderFunction) {

  customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      constructorCallback(this, func);
    }

    connectedCallback() {
      return connectedCallback(this);
    }

    disconnectedCallback() {
      return disconnectedCallback(this);
    }
  })
}
