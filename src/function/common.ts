import {RenderFunctionOutput, TemplateValues} from "../template/index.js";

export type FunctionComponentOutput = { template: RenderFunctionOutput; values?: TemplateValues; };

export type FunctionComponent = () => Promise<FunctionComponentOutput> | FunctionComponentOutput | RenderFunctionOutput;

export interface FunctionMeta {
  shadowRoot?: ShadowRoot;
  observer: MutationObserver;
  attributeFilter: string[];
  queryFilter: string[];
  popStateListener: () => void;
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

export type UseAttributeFunction = (name: string, defaultValue?: string) => string | null;
export type UseQueryFunction = (name: string, defaultValue?: string | string[]) => [string[] | string | null, SetFunction<string[] | string | null>];
export type UseEffectFunction = (effect: () => undefined | (() => void)) => void;

export interface FunctionContext {
  useState: UseStateFunction;
  useAttribute: UseAttributeFunction;
  useQuery: UseQueryFunction;
  useEffect: UseEffectFunction;
}

export interface RenderContext {
  this: FunctionContext,
  validate: () => boolean;
}
