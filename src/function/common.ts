import {RenderFunctionOutput, TemplateValues} from "../template/index.js";

export type FunctionComponentOutput = { template: RenderFunctionOutput; values?: TemplateValues; };

export type FunctionComponent = () => Promise<FunctionComponentOutput> | FunctionComponentOutput | RenderFunctionOutput;

export interface AttributeMap {
  [name: string]: string | undefined;
};

export interface FunctionMeta {
  shadowRoot?: ShadowRoot;
  attributeMap: AttributeMap;
  observer: MutationObserver;
  refresh: (firstRun?: boolean) => void;
  effects: {
    disconnected?: () => void;
  }[];
  templateChildren?: Node[];
  componentValues: {
    value?: any;
    defaultValue?: any;
  }[];
}

export type SetFunction<T = any> = (newValue: T) => void;

export type UseStateFunction<T = any> = (defaultValue?: T) => [T | undefined, SetFunction<T>];

//export type UseAttributeFunction = (name: string, defaultValue?: string) => string | null;
export type UseEffectFunction = (effect: () => undefined | (() => void)) => void;

export interface RenderFunctionArgs {
  useState: UseStateFunction;
  children?: Node[];
  attributes: AttributeMap;
  useEffect: UseEffectFunction;
}

export interface RenderContext {
  args: RenderFunctionArgs,
  validate: () => boolean;
}
