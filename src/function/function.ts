import {disconnect, nodeList2Array} from "../template/index.js";
import {renderFunction} from "./render.js";
import {getRenderContext} from "./context.js";
import {FunctionComponent, FunctionMeta} from "./common.js";

export function defineFunction(tag: string, render: FunctionComponent, shadowRootInit?: ShadowRootInit | false): void {
  return customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      const meta: FunctionMeta = {
        shadowRoot: shadowRootInit === false ? undefined : attachShadow.call(this, typeof shadowRootInit === "object" ? shadowRootInit : {
          mode: "closed"
        }),
        attributeMap: Object.create(null),
        componentValues: [],
        effects: [],
        refresh: (firstRun: boolean = false) => {
          if (firstRun) {
            const attrNames = this.getAttributeNames();
            for (const attribute of attrNames) {
              meta.attributeMap[attribute] = this.getAttribute(attribute) as string;
            }
          }
          const context = getRenderContext(meta, firstRun, () => {
            meta.refresh();
          });
          renderFunction(context, meta, meta.shadowRoot ? meta.shadowRoot : this, render);
        },
        observer: new MutationObserver((records) => {
          for (const record of records) {
            if (record.attributeName !== null) {
              const attrName = record.attributeName;
              const attrValue = (record.target as Element).getAttribute(attrName);
              if (attrValue !== null) {
                meta.attributeMap[attrName] = attrValue;
              } else {
                delete meta.attributeMap[attrName];
              }
            }
          }
          meta.refresh();
        })
      };

      setMeta(this, meta);
    }

    connectedCallback() {
      const meta = getMeta(this);
      if (!meta) {
        throw new Error("no meta!");
      }
      meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(this.childNodes);
      meta.observer.observe(this, {
        attributes: true
      });
      return meta.refresh(true);
    }

    disconnectedCallback() {
      const meta = getMeta(this) as FunctionMeta;
      const root = getRoot(this, meta);
      meta.observer.disconnect();
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
