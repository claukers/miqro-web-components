import {ComponentState, RenderFunctionOutput, TemplateValues} from "../component/template/index.js";
import {render as queueRender} from "../component/render-queue.js";
import {dispose, hasCache} from "../component/index.js";

export type useStateFunction<T = any> = (defaultValue?: T) => [value: T, setValue: (val: T) => void];

export interface FunctionComponentArgs<S extends ComponentState = ComponentState> {
  useState: <T = any>(defaultValue?: T) => T;
}

export type SetFunction<T = any> = (newVal: T) => void;

const weakMapGet = WeakMap.prototype.get;
const weakMapSet = WeakMap.prototype.set;
//const weakMapDelete = WeakMap.prototype.delete;
const attachShadow = HTMLElement.prototype.attachShadow;
const shadowMap = new WeakMap<HTMLElement, {
  shadowRoot?: ShadowRoot,
  firstRun: boolean,
  componentValues: [{
    value?: any;
    defaultValue?: any;
  }]
}>();

export type FunctionComponentOutput = { template: RenderFunctionOutput; values: TemplateValues; };

export type FunctionComponent = (args: FunctionComponentArgs) => Promise<FunctionComponentOutput> | FunctionComponentOutput;

export function defineFunction(tag: string, render: FunctionComponent, shadowRootInit?: ShadowRootInit | false): void {

  const noShadowRoot = shadowRootInit === false;
  const attachShadowArgs = shadowRootInit ? shadowRootInit : {
    mode: "closed"
  } as ShadowRootInit;

  function getRoot(element: HTMLElement) {
    return noShadowRoot ? element : weakMapGet.call(shadowMap, element).shadowRoot;
  }

  function flipFirstRun(element: HTMLElement): boolean {
    const currentState = weakMapGet.call(shadowMap, element);
    const ret = currentState.firstRun;
    currentState.firstRun = false;
    return ret;
  }

  function getComponentValue(element: HTMLElement, index: number): {
    value?: any;
    defaultValue?: any;
  } {
    return weakMapGet.call(shadowMap, element).componentValues[index];
  }

  function getComponentValueCount(element: HTMLElement): number {
    return weakMapGet.call(shadowMap, element).componentValues.length;
  }

  function setComponentValue(element: HTMLElement, index: number, value?: any, defaultValue?: any): void {
    weakMapGet.call(shadowMap, element).componentValues[index] = {
      defaultValue,
      value
    };
  }

  function getRenderArgs(element: HTMLElement, firstRun: boolean): { args: FunctionComponentArgs, validateUseAccess: () => boolean; } {
    let valueKeyAccess = 0;
    //console.log("firstRun " + firstRun);
    return {
      args: {
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

  function callRender(element: HTMLElement, firstRun: boolean = false) {
    queueRender(getRoot(element), async () => {
      const renderArgs = getRenderArgs(element, firstRun);
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
      callRender(this, true);
    }

    disconnectedCallback() {
      dispose(getRoot(this));
    }
  });
}
