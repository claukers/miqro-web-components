import {disconnect, nodeList2Array} from "../template/index.js";
import {
  callRender,
  ComponentMeta,
  FunctionComponent,
  FunctionComponentArgs,
  RenderContext,
  SetFunction
} from "./common.js";

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

function getRenderContext(meta: ComponentMeta, firstRun: boolean, refresh: () => void): RenderContext {
  let valueKeyAccess = 0;
  let lockUseState = false;
  let lock = false;
  const count = meta.componentValues.length;
  //console.log("firstRun " + firstRun);
  const effects: {
    effect: () => void | (() => void)
  }[] = [];
  return {
    args: {
      useAttribute: function (name: string, defaultValue?: string): string | null {
        if (lock) {
          throw new Error("cannot use useEffect after render!");
        }
        lockUseState = true;
        if (name === "__proto__" || name === "__prototype__") {
          throw new Error("bad name!");
        }
        const currentValue = meta.attributeMap[name];
        return currentValue !== undefined ? currentValue : defaultValue !== undefined ? defaultValue : null;
      },
      useEffect: function (effect: () => undefined | (() => void)) {
        if (lock) {
          throw new Error("cannot use useEffect after render!");
        }
        lockUseState = true;
        if (firstRun) {
          const disconnected = effect();
          if (disconnected) {
            meta.effects.push({
              disconnected
            });
          }
        }
      },
      useState: function <T>(defaultValue?: T): [T | undefined, SetFunction<T>] {
        if (lock) {
          throw new Error("cannot use useState after render!");
        }
        if (lockUseState) {
          throw new Error("cannot use useState after useEffect or useAttribute!");
        }
        const currentValueKey = valueKeyAccess;
        if (!firstRun && currentValueKey >= count) {
          throw new Error("conditional useState detected!");
        }
        valueKeyAccess++;

        if (firstRun) {
          meta.componentValues[currentValueKey] = {
            defaultValue,
            value: undefined
          };
        }

        const currentValue = meta.componentValues[currentValueKey];

        if (currentValue.defaultValue !== defaultValue) {
          throw new Error("conditional useState detected different defaultValues!");
        }

        const value = currentValue.value !== undefined ? currentValue.value : currentValue.defaultValue;

        return [
          value,
          function setValue(newValue): void {
            currentValue.value = newValue;
            refresh();
          }
        ];
      }
    } as FunctionComponentArgs,
    validate: () => {
      lock = true;
      return valueKeyAccess === meta.componentValues.length;
    }
  };
}

export function defineFunction(tag: string, render: FunctionComponent, shadowRootInit?: ShadowRootInit | false): void {
  const noShadowRoot = shadowRootInit === false;
  const attachShadowArgs = shadowRootInit ? shadowRootInit : {
    mode: "closed"
  } as ShadowRootInit;

  return customElements.define(tag, class extends HTMLElement {

    constructor() {
      super();
      //console.log("function ctor");
      const shadowRoot = noShadowRoot ? undefined : attachShadow.call(this, attachShadowArgs);
      const meta = {
        shadowRoot,
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
          callRender(context, meta, meta.shadowRoot ? meta.shadowRoot : this, render);
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
      } as ComponentMeta;

      setMeta(this, meta);
    }

    connectedCallback() {
      //console.log("connected");
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
      const meta = getMeta(this) as ComponentMeta;
      const root = noShadowRoot ? this : meta.shadowRoot as ShadowRoot;
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
