import {
  render as queueRender,
  dispose,
  hasCache,
  ComponentState,
  RenderFunctionOutput,
  TemplateValues, nodeList2Array
} from "../template/index.js";

export type useStateFunction<T = any> = (defaultValue?: T) => [value: T, setValue: (val: T) => void];

export interface FunctionComponentArgs<S extends ComponentState = ComponentState> {
  useState: <T = any>(defaultValue?: T) => T;
  firstRun: boolean;
}

export type SetFunction<T = any> = (newVal: T) => void;

const weakMapGet = WeakMap.prototype.get;
const weakMapSet = WeakMap.prototype.set;
//const weakMapDelete = WeakMap.prototype.delete;
const attachShadow = HTMLElement.prototype.attachShadow;

interface ShadowMapValue {
  shadowRoot?: ShadowRoot;
  templateChildren?: Node[];
  componentValues: [{
    value?: any;
    defaultValue?: any;
  }];
}

const shadowMap = new WeakMap<HTMLElement, ShadowMapValue>();

export type FunctionComponentOutput = { template: RenderFunctionOutput; values: TemplateValues; };

export type FunctionComponent = (args: FunctionComponentArgs) => Promise<FunctionComponentOutput> | FunctionComponentOutput;

export function defineFunction(tag: string, render: FunctionComponent, shadowRootInit?: ShadowRootInit | false): void {

  const noShadowRoot = shadowRootInit === false;
  const attachShadowArgs = shadowRootInit ? shadowRootInit : {
    mode: "closed"
  } as ShadowRootInit;

  function getRoot(element: HTMLElement): HTMLElement | ShadowRoot {
    return noShadowRoot ? element : (weakMapGet.call(shadowMap, element) as ShadowMapValue).shadowRoot as ShadowRoot;
  }

  function getMeta(element: HTMLElement): ShadowMapValue | undefined {
    return weakMapGet.call(shadowMap, element);
  }

  function getRenderArgs(element: HTMLElement, meta: ShadowMapValue): { args: FunctionComponentArgs, validateUseAccess: () => boolean; } {
    let valueKeyAccess = 0;
    const firstRun = !hasCache(getRoot(element));
    //const count = getComponentValueCount(element);
    const count = meta.componentValues.length;
    if (firstRun) {
      meta.templateChildren = meta.templateChildren ? meta.templateChildren : nodeList2Array(element.childNodes);
    }
    //console.log("firstRun " + firstRun);
    return {
      args: {
        firstRun,
        useState: function <T>(defaultValue?: T): [T | undefined, SetFunction<T>] {
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

          const value = currentValue.value ? currentValue.value : currentValue.defaultValue;

          return [
            value,
            function setValue(newValue) {
              currentValue.value = newValue;
              callRender(element);
            }
          ]
        }
      } as FunctionComponentArgs,
      validateUseAccess: () => {
        return valueKeyAccess === meta.componentValues.length;
      }
    };
  }

  function callRender(element: HTMLElement) {
    queueRender(getRoot(element), async () => {
      try {
        const meta = getMeta(element);
        if (!meta) {
          throw new Error("bad state for render");
        }
        const renderArgs = getRenderArgs(element, meta);
        const renderBind = render.bind(renderArgs.args);
        const output = await renderBind(renderArgs.args);
        if (!renderArgs.validateUseAccess()) {
          throw new Error("conditional useState detected!");
        }
        return {
          template: output.template,
          values: output.values ? {
            children: meta.templateChildren,
            ...output.values
          } : {
            children: meta.templateChildren
          }
        };
      } catch (e) {
        console.error(e);
        return undefined;
      }
    });
  }


  return customElements.define(tag, class extends HTMLElement {
    constructor() {
      super();
      weakMapSet.call(shadowMap, this, {
        shadowRoot: noShadowRoot ? undefined : attachShadow.call(this, attachShadowArgs),
        componentValues: []
      });
    }

    connectedCallback() {
      callRender(this);
    }

    disconnectedCallback() {
      dispose(getRoot(this));
    }
  });
}
