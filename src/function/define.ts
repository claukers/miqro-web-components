import {RenderFunctionOptions, RenderFunction, RenderFunctionWithOptions} from "../common/index.js";
import {connectedCallback, constructorCallback, disconnectedCallback} from "./callbacks.js";

const DEFAULT_OPTIONS: RenderFunctionOptions = {
  shadowInit: {
    mode: "closed"
  },
  template: ""
}

export function define(tag: string, func: RenderFunction | RenderFunctionWithOptions, options?: Partial<RenderFunctionOptions>) {

  if (typeof func !== "function" && options !== undefined) {
    throw new Error("bad arguments options cannot be passed if func is RenderFunctionWithOptions")
  }

  const f = typeof func === "function" ? func : func.render;

  const o = typeof func === "function" ? (options ? {
    ...DEFAULT_OPTIONS,
    ...options
  } : DEFAULT_OPTIONS) : (
    func
  );

  customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      constructorCallback(this, f, o.shadowInit, o.template);
    }

    connectedCallback() {
      return connectedCallback(this);
    }

    disconnectedCallback() {
      return disconnectedCallback(this);
    }
  })
}
