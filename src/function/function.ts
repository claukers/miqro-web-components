import {dispose, nodeList2Array} from "../template/index.js";
import {callRender, ComponentMeta, FunctionComponent} from "./common.js";

const weakMapGet = WeakMap.prototype.get;
const weakMapSet = WeakMap.prototype.set;
const attachShadow = HTMLElement.prototype.attachShadow;

const shadowMap = new WeakMap<HTMLElement, ComponentMeta>();

function getMeta(element: HTMLElement): ComponentMeta | undefined {
  return weakMapGet.call(shadowMap, element);
}

function setMeta(element: HTMLElement, meta: ComponentMeta) {
  weakMapSet.call(shadowMap, element, meta);
}

export function defineFunction(tag: string, render: FunctionComponent, shadowRootInit?: ShadowRootInit | false): void {
  const noShadowRoot = shadowRootInit === false;
  const attachShadowArgs = shadowRootInit ? shadowRootInit : {
    mode: "closed"
  } as ShadowRootInit;

  return customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = noShadowRoot ? undefined : attachShadow.call(this, attachShadowArgs);
      setMeta(this, {
        shadowRoot,
        componentValues: []
      });
    }

    connectedCallback() {
      const meta = getMeta(this) as ComponentMeta;
      meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(this.childNodes);
      callRender(meta, meta.shadowRoot ? meta.shadowRoot : this, render, true);
    }

    disconnectedCallback() {
      const meta = getMeta(this) as ComponentMeta;
      const root = noShadowRoot ? this : meta.shadowRoot as ShadowRoot;
      dispose(root);
    }
  });
}
