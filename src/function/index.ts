import {connectedCallback, constructorCallback, disconnectedCallback} from "./callbacks.js";
import {FunctionComponent} from "./common.js";

export {
  Effect,
  UseQueryFunction,
  SetFunction,
  UseAttributeFunction,
  UseEffectFunction,
  UseStateFunction,
  UseSubscriptionFunction,
  FunctionComponent
} from "./common.js";

export function defineFunction(tag: string, hook: FunctionComponent) {
  customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      constructorCallback(this, hook);
    }

    connectedCallback() {
      return connectedCallback(this);
    }

    disconnectedCallback() {
      return disconnectedCallback(this);
    }
  })
}
