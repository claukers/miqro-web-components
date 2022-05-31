import {disconnect, nodeList2Array} from "../template/index.js";
import {renderFunction} from "./render.js";
import {getRenderContext, setupObserver} from "./context.js";
import {FunctionComponent, FunctionMeta} from "./common.js";

export function defineFunction(tag: string, render: FunctionComponent, shadowRootInit?: ShadowRootInit | false): void {
  return customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      const meta: FunctionMeta = {
        popStateListener: () => {
          meta.refresh();
        },
        shadowRoot: shadowRootInit === false ? undefined : attachShadow.call(this, typeof shadowRootInit === "object" ? shadowRootInit : {
          mode: "closed"
        }),
        componentValues: [],
        effects: [],
        queryFilter: [],
        refresh: (firstRun: boolean = false) => {
          const context = getRenderContext(this, meta, firstRun, () => {
            meta.refresh();
          });
          renderFunction(this, context, meta, getRoot(this, meta), render);
        },
        observer: new MutationObserver(() => {
          meta.refresh();
        }),
        attributeFilter: []
      };
      setMeta(this, meta);
    }

    connectedCallback() {
      const meta = getMeta(this);
      if (!meta) {
        throw new Error("no meta!");
      }
      meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(this.childNodes);
      setupObserver(this, meta);
      if (meta.queryFilter.length > 0) {
        window.addEventListener("popstate", meta.popStateListener);
      }
      return meta.refresh(true);
    }

    disconnectedCallback() {
      const meta = getMeta(this) as FunctionMeta;
      const root = getRoot(this, meta);
      meta.observer.disconnect();
      if (meta.queryFilter.length > 0) {
        window.removeEventListener("popstate", meta.popStateListener);
      }
      for (const effect of meta.effects) {
        if (effect.disconnected) {
          try {
            effect.disconnected();
          } catch (e) {
            console.error(e);
          }
        }
      }
      disconnect(root);
    }
  });
}

const weakMapGet = WeakMap.prototype.get;
const weakMapSet = WeakMap.prototype.set;
const attachShadow = HTMLElement.prototype.attachShadow;

const shadowMap = new WeakMap<HTMLElement, FunctionMeta>();

function getMeta(element: HTMLElement): FunctionMeta | undefined {
  return weakMapGet.call(shadowMap, element);
}

function setMeta(element: HTMLElement, meta: FunctionMeta) {
  weakMapSet.call(shadowMap, element, meta);
}

function getRoot(element: HTMLElement, meta: FunctionMeta) {
  return meta.shadowRoot ? meta.shadowRoot as ShadowRoot : element;
}
