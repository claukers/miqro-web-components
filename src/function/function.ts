import {ComponentState, RenderFunctionOutput, TemplateValues} from "../template/index.js";
import {render as queueRender} from "../component/render-queue.js";
import {dispose, hasCache} from "../component/index.js";

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
  shadowRoot?: ShadowRoot,
  componentValues: [{
    value?: any;
    defaultValue?: any;
  }]
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

  function getComponentValue(element: HTMLElement, index: number): {
    value?: any;
    defaultValue?: any;
  } {
    return (weakMapGet.call(shadowMap, element) as ShadowMapValue).componentValues[index];
  }

  function getComponentValueCount(element: HTMLElement): number {
    return (weakMapGet.call(shadowMap, element) as ShadowMapValue).componentValues.length;
  }

  function setComponentValue(element: HTMLElement, index: number, value?: any, defaultValue?: any): void {
    (weakMapGet.call(shadowMap, element) as ShadowMapValue).componentValues[index] = {
      defaultValue,
      value
    };
  }

  function getRenderArgs(element: HTMLElement): { args: FunctionComponentArgs, validateUseAccess: () => boolean; } {
    let valueKeyAccess = 0;
    const firstRun = !hasCache(getRoot(element));
    console.log("firstRun " + firstRun);
    return {
      args: {
        firstRun,
        useState: function <T>(defaultValue?: T): [T | undefined, SetFunction<T>] {
          const currentValueKey = valueKeyAccess;
          if (!firstRun && currentValueKey >= getComponentValueCount(element)) {
            throw new Error("conditional useState detected!");
          }
          valueKeyAccess++;

          if (firstRun) {
            setComponentValue(element, currentValueKey, undefined, defaultValue);
          }

          const currentValue = getComponentValue(element, currentValueKey);

          if (currentValue.defaultValue !== defaultValue) {
            throw new Error("conditional useState detected different defaultValues!");
          }

          const value = currentValue.value ? currentValue.value : currentValue.defaultValue;

          return [
            value,
            function setValue(newValue) {
              setComponentValue(element, currentValueKey, newValue, defaultValue)
              callRender(element);
            }
          ]
        }
      } as FunctionComponentArgs,
      validateUseAccess: () => {
        return valueKeyAccess === getComponentValueCount(element);
      }
    };
  }

  function callRender(element: HTMLElement) {
    queueRender(getRoot(element), async () => {
      const renderArgs = getRenderArgs(element);
      const renderBind = render.bind(renderArgs.args);
      const output = await renderBind(renderArgs.args);
      if (!renderArgs.validateUseAccess()) {
        throw new Error("conditional useState detected!");
      }
      return output;
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
